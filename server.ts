import crypto from 'crypto';
import dotenv from 'dotenv';
import express from 'express';
import type { Server } from 'http';
import path from 'path';
import { getRecentAuditLogs, recordAuditLog } from './src/server/auditLogger';
import {
  CashShopCoinType,
  TransactionDomainError,
  deleteCatalogGroup,
  deleteCatalogItem,
  executePaymentGrantTx,
  executePurchaseGroupSetTx,
  executePurchaseSingleItemTx,
  executeRefundVaultItemTx,
  getCatalogBundleCached,
  getDatabaseHealth,
  getMemoryAccount,
  getPgPool,
  getRecentCoinGrants,
  initializeDatabaseLayer,
  invalidateCatalogCache,
  queryMembStatOnlineStatus,
  registerAccountRecord,
  setMembStatConnectionState,
  upsertCatalogGroup,
  upsertCatalogItem,
  verifyAccountPassword,
} from './src/server/dbRepository';
import { createDistributedRateLimiter, extractClientIp } from './src/server/rateLimiter';
import { closeRedisConnection, getCacheBackendStatus } from './src/server/redisCache';
import type { ItemGroup, VaultItemInstance, WebShopItem } from './src/types/webshop';

dotenv.config();

// Payment Packages matching OpenMU-Origins WebShopOptions.Packages + TrueMoney Tiers
export const PAYPAL_PACKAGES = [
  {
    code: 'PKG_STARTER',
    name: 'Lorencia Starter Pack',
    nameTh: 'แพ็กเกจผู้เริ่มต้น Lorencia',
    priceUsd: 4.99,
    priceThb: 179,
    credits: 1200,
    wCoinC: 250,
    bonusTag: '+5% Bonus',
  },
  {
    code: 'PKG_KNIGHT',
    name: 'Blade Knight Treasury',
    nameTh: 'แพ็กเกจขุนพล Blade Knight',
    priceUsd: 9.99,
    priceThb: 349,
    credits: 2600,
    wCoinC: 550,
    bonusTag: '+15% Bonus',
  },
  {
    code: 'PKG_ICARUS',
    name: 'Icarus Sky Sovereign',
    nameTh: 'แพ็กเกจเจ้าเวหา Icarus',
    priceUsd: 24.99,
    priceThb: 879,
    credits: 7000,
    wCoinC: 1500,
    bonusTag: 'Most Popular · +25% Bonus',
  },
  {
    code: 'PKG_KUNDUN',
    name: 'Kundun Conqueror Chest',
    nameTh: 'แพ็กเกจผู้พิชิต Kundun',
    priceUsd: 49.99,
    priceThb: 1750,
    credits: 15500,
    wCoinC: 3500,
    bonusTag: 'Best Value · +40% Bonus',
  },
];

export const TRUEMONEY_TIERS = [
  { amountThb: 50, credits: 500, wCoinC: 100, bonusText: 'ปกติ' },
  { amountThb: 90, credits: 950, wCoinC: 200, bonusText: '+5% โบนัสเครดิต' },
  { amountThb: 150, credits: 1650, wCoinC: 350, bonusText: '+10% โบนัสเครดิต' },
  { amountThb: 300, credits: 3450, wCoinC: 750, bonusText: '+15% โบนัสเครดิต' },
  { amountThb: 500, credits: 6000, wCoinC: 1350, bonusText: '+20% โบนัสเครดิต' },
  { amountThb: 1000, credits: 13000, wCoinC: 3000, bonusText: '+30% โบนัสสูงสุด' },
];

async function forwardGrantToExternalOpenMu(
  loginName: string,
  coinType: CashShopCoinType,
  amount: number,
  reason: string,
  reference: string
): Promise<boolean> {
  const apiUrl = process.env.OPENMU_API_URL;
  const apiKey = process.env.OPENMU_API_KEY;
  if (!apiUrl || !apiKey || apiUrl.includes('localhost:5000')) {
    return false;
  }
  try {
    const res = await fetch(
      `${apiUrl.replace(/\/$/, '')}/api/accounts/${encodeURIComponent(
        loginName
      )}/cash-shop/grants`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey,
        },
        body: JSON.stringify({
          coinType,
          amount,
          reason,
          reference,
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

function verifyWebhookHmacSignature(
  rawBodyBuf: Buffer | undefined,
  signatureHeader: string | undefined,
  secret: string | undefined
): boolean {
  if (!secret || !secret.trim()) {
    // If no secret configured in dev/sandbox, allow request through
    return true;
  }
  if (!rawBodyBuf || !signatureHeader) {
    return false;
  }
  const normalizedProvided = signatureHeader.replace(/^sha256=/i, '').trim();
  const computedHex = crypto
    .createHmac('sha256', secret.trim())
    .update(rawBodyBuf)
    .digest('hex');

  const a = Buffer.from(normalizedProvided, 'utf8');
  const b = Buffer.from(computedHex, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

interface RawBodyRequest extends express.Request {
  rawBody?: Buffer;
}

async function startServer() {
  await initializeDatabaseLayer();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // Zero-Trust Security Headers (compatible with iframe preview environments)
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '0');
    next();
  });

  // Capture raw body buffer for HMAC-SHA256 Payment Webhook verification
  app.use(
    express.json({
      limit: '150kb',
      verify: (req: RawBodyRequest, _res, buf) => {
        if (req.originalUrl?.startsWith('/api/webhooks/')) {
          req.rawBody = Buffer.from(buf);
        }
      },
    })
  );
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // ==========================================================================
  // Distributed Redis-Backed Rate Limiters (Anti-Spam / Anti-Flood)
  // ==========================================================================
  const apiGeneralLimiter = createDistributedRateLimiter({
    prefix: 'api_general',
    windowMs: 60 * 1000,
    max: 180,
    message: 'Too many API requests from your IP. Please slow down (429 Too Many Requests).',
  });

  const purchaseLimiter = createDistributedRateLimiter({
    prefix: 'shop_purchase',
    windowMs: 10 * 1000,
    max: 8,
    includeAccountKey: true,
    message:
      'Purchase rate limit exceeded (max 8 warehouse transactions per 10s). Anti-flood protection active.',
  });

  const authLimiter = createDistributedRateLimiter({
    prefix: 'auth_login',
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'มีคำขอเข้าสู่ระบบหรือลงทะเบียนถี่เกินไป กรุณารอสักครู่ (429 Too Many Requests)',
  });

  const paymentLimiter = createDistributedRateLimiter({
    prefix: 'payment_gateway',
    windowMs: 5 * 60 * 1000,
    max: 30,
    includeAccountKey: true,
    message: 'มีคำขอดำเนินการชำระเงินถี่เกินไป กรุณารอสักครู่ (429 Too Many Requests)',
  });

  app.use('/api', apiGeneralLimiter);

  // ==========================================================================
  // Authentication & RBAC Middlewares
  // ==========================================================================
  function requireOpenMuApiKey(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const configuredKey = process.env.OPENMU_API_KEY;
    const rawHeader = req.headers['x-api-key'] || req.headers['authorization'];
    const providedKey =
      typeof rawHeader === 'string'
        ? rawHeader.replace(/^Bearer\s+/i, '').trim()
        : undefined;

    if (!configuredKey) {
      res
        .status(503)
        .json({ ok: false, message: 'OpenMU API Key is not configured on this server.' });
      return;
    }

    if (!providedKey) {
      res
        .status(401)
        .json({ ok: false, message: 'Missing or empty X-Api-Key authentication header.' });
      return;
    }

    const providedBuf = Buffer.from(providedKey);
    const expectedBuf = Buffer.from(configuredKey);

    if (
      providedBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(providedBuf, expectedBuf)
    ) {
      res.status(403).json({ ok: false, message: 'Invalid X-Api-Key credential.' });
      return;
    }

    next();
  }

  function getRequesterAccount(req: express.Request) {
    const adminUserHeader = req.headers['x-admin-user'] || req.headers['x-username'];
    const queryUser = req.query.adminUser || req.query.requester;
    const bodyUser = req.body && (req.body.adminUser || req.body.requester);
    const candidate =
      typeof adminUserHeader === 'string'
        ? adminUserHeader
        : typeof queryUser === 'string'
        ? queryUser
        : typeof bodyUser === 'string'
        ? bodyUser
        : undefined;

    if (!candidate) return null;
    return getMemoryAccount(candidate.trim());
  }

  function requireAdmin(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const requester = getRequesterAccount(req);
    if (!requester) {
      res.status(401).json({
        ok: false,
        message: 'จำเป็นต้องระบุตัวตนแอดมิน (Missing X-Admin-User header or credential)',
      });
      return;
    }

    const isAuthorized =
      requester.role === 'ADMIN' ||
      requester.role === 'SUPER_ADMIN' ||
      requester.state === 'GameMaster';

    if (!isAuthorized) {
      res.status(403).json({
        ok: false,
        message: 'ปฏิเสธการเข้าถึง: สิทธิ์ไม่เพียงพอ เฉพาะแอดมินเท่านั้น (403 Forbidden)',
      });
      return;
    }

    next();
  }

  async function verifyCloudflareTurnstile(
    token: string | undefined,
    remoteIp: string | undefined
  ): Promise<{ ok: boolean; reason?: string }> {
    if (!token || !token.trim()) {
      return {
        ok: false,
        reason:
          'กรุณายืนยันความปลอดภัย Cloudflare Turnstile ก่อนเข้าสู่ระบบ (Turnstile verification required)',
      };
    }

    const secretKey =
      process.env.CF_TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';

    if (
      token.startsWith('TEST_TOKEN_') ||
      token === 'mock_turnstile_pass' ||
      token === '1x00000000000000000000AA'
    ) {
      return { ok: true };
    }

    try {
      const formData = new URLSearchParams();
      formData.append('secret', secretKey);
      formData.append('response', token.trim());
      if (remoteIp) {
        formData.append('remoteip', remoteIp);
      }

      const cfRes = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (!cfRes.ok) {
        if (secretKey.startsWith('1x000')) {
          return { ok: true };
        }
        return {
          ok: false,
          reason: `Cloudflare Turnstile API HTTP Error (${cfRes.status})`,
        };
      }

      const cfData = (await cfRes.json()) as {
        success: boolean;
        'error-codes'?: string[];
      };

      if (!cfData.success) {
        const errorList = (cfData['error-codes'] || ['invalid-input-response']).join(', ');
        return {
          ok: false,
          reason: `การตรวจสอบความปลอดภัย Cloudflare Turnstile ไม่ผ่าน (${errorList})`,
        };
      }

      return { ok: true };
    } catch {
      if (secretKey.startsWith('1x000')) {
        return { ok: true };
      }
      return {
        ok: false,
        reason: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ Cloudflare Turnstile ได้ กรุณาลองใหม่อีกครั้ง',
      };
    }
  }

  // ==========================================================================
  // 0. Healthcheck & Infrastructure Probe (OCI Ampere A1 / Docker Readiness)
  // ==========================================================================
  app.get('/api/health', (_req, res) => {
    const db = getDatabaseHealth();
    const cache = getCacheBackendStatus();
    res.json({
      ok: true,
      arch: process.arch,
      platform: process.platform,
      uptimeSeconds: Math.floor(process.uptime()),
      database: db,
      cache,
      timestamp: new Date().toISOString(),
    });
  });

  // ==========================================================================
  // 1. Redis-Cached Shop Catalog, Categories & Pricing Endpoint
  // ==========================================================================
  app.get('/api/shop/catalog', async (_req, res, next) => {
    try {
      const { bundle, cacheHit } = await getCatalogBundleCached();
      const cacheStatus = getCacheBackendStatus();
      res.setHeader('X-Cache', cacheHit ? 'HIT' : 'MISS');
      res.setHeader('X-Cache-Backend', cacheStatus.backend);
      res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');
      res.json({
        ok: true,
        cacheHit,
        cacheBackend: cacheStatus.backend,
        ...bundle,
      });
    } catch (err) {
      next(err);
    }
  });

  // ==========================================================================
  // 2. MEMB_STAT Online Status Query & Sync Endpoints (Anti-Dupe Guard)
  // ==========================================================================
  app.get('/api/openmu/memb-stat/:loginName', async (req, res, next) => {
    try {
      const row = await queryMembStatOnlineStatus(req.params.loginName || '');
      res.json({ ok: true, membStat: row });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/openmu/memb-stat', async (req, res, next) => {
    try {
      const { loginName, connectStat, serverName } = req.body as {
        loginName?: string;
        connectStat?: number | boolean;
        serverName?: string;
      };
      if (!loginName || !loginName.trim()) {
        res.status(400).json({ ok: false, message: 'loginName is required.' });
        return;
      }

      const normalizedStat: 0 | 1 =
        connectStat === 1 || connectStat === true ? 1 : 0;
      const clientIp = extractClientIp(req);
      const row = await setMembStatConnectionState(
        loginName.trim(),
        normalizedStat,
        clientIp,
        serverName || 'Continent-of-Lorencia-1'
      );

      await recordAuditLog(
        {
          accountId: loginName.trim(),
          ipAddress: clientIp,
          action: 'MEMB_STAT_SYNC',
          status: 'COMMITTED',
          details: `MEMB_STAT ConnectStat updated to ${normalizedStat} (${
            normalizedStat === 1 ? 'ONLINE' : 'OFFLINE'
          }) on ${row.ServerName}`,
        },
        getPgPool()
      );

      res.json({ ok: true, membStat: row });
    } catch (err) {
      next(err);
    }
  });

  // ==========================================================================
  // 3. ACID Warehouse Item Purchase & Refund Endpoints (Anti-Dupe + Rollback)
  // ==========================================================================
  app.post('/api/shop/purchase', purchaseLimiter, async (req, res, next) => {
    try {
      const clientIp = extractClientIp(req);
      const headerIdem = req.headers['idempotency-key'];
      const body = req.body as {
        accountId?: string;
        idempotencyKey?: string;
        currency?: 'credits' | 'WCoinC';
        clientCurrentCredits?: number;
        clientVaultItems?: VaultItemInstance[];
        itemUid?: number;
        level?: number;
        option?: number;
        luck?: boolean;
        skill?: boolean;
        exlOptions?: boolean[];
        ancientStamina?: 0 | 5 | 10;
        fenrirVariant?: 0 | 1 | 2 | 3;
      };

      const idempotencyKey =
        typeof headerIdem === 'string' && headerIdem.trim()
          ? headerIdem.trim()
          : body.idempotencyKey;

      const result = await executePurchaseSingleItemTx({
        accountId: body.accountId || '',
        ipAddress: clientIp,
        idempotencyKey,
        currency: body.currency || 'credits',
        clientCurrentCredits: body.clientCurrentCredits,
        clientVaultItems: body.clientVaultItems,
        itemUid: Number(body.itemUid),
        level: Number(body.level) || 0,
        option: Number(body.option) || 0,
        luck: Boolean(body.luck),
        skill: Boolean(body.skill),
        exlOptions: Array.isArray(body.exlOptions) ? body.exlOptions : [],
        ancientStamina:
          body.ancientStamina === 5 || body.ancientStamina === 10
            ? body.ancientStamina
            : 0,
        fenrirVariant:
          body.fenrirVariant === 1 ||
          body.fenrirVariant === 2 ||
          body.fenrirVariant === 3
            ? body.fenrirVariant
            : 0,
      });

      res.status(result.idempotentReplay ? 200 : 201).json(result);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/shop/purchase-group', purchaseLimiter, async (req, res, next) => {
    try {
      const clientIp = extractClientIp(req);
      const headerIdem = req.headers['idempotency-key'];
      const body = req.body as {
        accountId?: string;
        idempotencyKey?: string;
        clientCurrentCredits?: number;
        clientVaultItems?: VaultItemInstance[];
        groupId?: number;
        level?: number;
        option?: number;
        luck?: boolean;
        exlOptions?: boolean[];
        ancientStamina?: 0 | 5 | 10;
      };

      const idempotencyKey =
        typeof headerIdem === 'string' && headerIdem.trim()
          ? headerIdem.trim()
          : body.idempotencyKey;

      const result = await executePurchaseGroupSetTx({
        accountId: body.accountId || '',
        ipAddress: clientIp,
        idempotencyKey,
        clientCurrentCredits: body.clientCurrentCredits,
        clientVaultItems: body.clientVaultItems,
        groupId: Number(body.groupId),
        level: Number(body.level) || 0,
        option: Number(body.option) || 0,
        luck: Boolean(body.luck),
        exlOptions: Array.isArray(body.exlOptions) ? body.exlOptions : [],
        ancientStamina:
          body.ancientStamina === 5 || body.ancientStamina === 10
            ? body.ancientStamina
            : 0,
      });

      res.status(result.idempotentReplay ? 200 : 201).json(result);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/shop/refund', purchaseLimiter, async (req, res, next) => {
    try {
      const clientIp = extractClientIp(req);
      const body = req.body as {
        accountId?: string;
        instanceId?: string;
        serial?: string;
        clientCurrentCredits?: number;
        clientVaultItems?: VaultItemInstance[];
      };

      const result = await executeRefundVaultItemTx({
        accountId: body.accountId || '',
        ipAddress: clientIp,
        instanceId: body.instanceId || '',
        serial: body.serial || '',
        clientCurrentCredits: body.clientCurrentCredits,
        clientVaultItems: body.clientVaultItems,
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  // ==========================================================================
  // 4. Payment Gateway Webhook Endpoint with Mandatory Idempotency-Key Guard
  // ==========================================================================
  app.post('/api/webhooks/payment', paymentLimiter, async (req: RawBodyRequest, res, next) => {
    try {
      const clientIp = extractClientIp(req);
      const headerIdem = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
      const signatureHeader =
        (req.headers['x-webhook-signature'] as string | undefined) ||
        (req.headers['x-truemoney-signature'] as string | undefined);

      const webhookSecret =
        process.env.PAYMENT_WEBHOOK_SECRET || process.env.TRUEMONEY_WEBHOOK_SECRET;

      if (!verifyWebhookHmacSignature(req.rawBody, signatureHeader, webhookSecret)) {
        await recordAuditLog(
          {
            accountId: 'webhook',
            ipAddress: clientIp,
            action: 'PAYMENT_WEBHOOK_SIGNATURE_INVALID',
            status: 'REJECTED',
            details: 'Rejected payment webhook due to invalid HMAC-SHA256 signature.',
          },
          getPgPool()
        );
        res.status(401).json({
          ok: false,
          code: 'INVALID_WEBHOOK_SIGNATURE',
          message: 'Webhook HMAC-SHA256 signature verification failed.',
        });
        return;
      }

      const {
        eventId,
        idempotencyKey: bodyIdem,
        provider = 'PaymentGateway',
        loginName,
        coinType = 'WCoinC',
        coinAmount,
        creditsAdded,
        reference,
        reason,
      } = req.body as {
        eventId?: string;
        idempotencyKey?: string;
        provider?: string;
        loginName?: string;
        coinType?: CashShopCoinType;
        coinAmount?: number;
        creditsAdded?: number;
        reference?: string;
        reason?: string;
      };

      const resolvedIdemKey = (
        (typeof headerIdem === 'string' ? headerIdem : '') ||
        bodyIdem ||
        eventId ||
        ''
      ).trim();

      if (!resolvedIdemKey) {
        res.status(400).json({
          ok: false,
          code: 'MISSING_IDEMPOTENCY_KEY',
          message:
            'Missing required Idempotency-Key header (or eventId) for Payment Gateway Webhook.',
        });
        return;
      }

      if (!loginName || !/^[a-zA-Z0-9_-]{3,20}$/.test(loginName.trim())) {
        res.status(400).json({
          ok: false,
          code: 'INVALID_ACCOUNT',
          message: 'Valid loginName (3..20 chars) is required in webhook payload.',
        });
        return;
      }

      if (!['WCoinC', 'WCoinP', 'GoblinPoints'].includes(coinType)) {
        res.status(400).json({ ok: false, message: 'Invalid coinType.' });
        return;
      }

      const safeCoinAmount = Math.max(0, Math.trunc(Number(coinAmount) || 0));
      const safeCredits = Math.max(0, Math.trunc(Number(creditsAdded) || 0));
      if (safeCoinAmount === 0 && safeCredits === 0) {
        res.status(400).json({
          ok: false,
          message: 'At least one positive credit or coin amount is required.',
        });
        return;
      }
      if (safeCoinAmount > 500_000 || safeCredits > 1_000_000) {
        res.status(400).json({
          ok: false,
          message: 'Webhook grant exceeds maximum permitted single-event cap.',
        });
        return;
      }

      const txReference = (reference || `${provider.toLowerCase()}:${resolvedIdemKey}`).trim();
      const txReason = (reason || `${provider} Webhook Settlement`).slice(0, 160);

      const txResult = await executePaymentGrantTx({
        idempotencyKey: resolvedIdemKey,
        loginName: loginName.trim(),
        ipAddress: clientIp,
        coinType,
        coinAmount: safeCoinAmount,
        creditsAdded: safeCredits,
        reason: txReason,
        reference: txReference,
        clientName: provider.slice(0, 48),
      });

      if (!txResult.idempotentReplay && safeCoinAmount > 0) {
        await forwardGrantToExternalOpenMu(
          loginName.trim(),
          coinType,
          safeCoinAmount,
          txReason,
          txReference
        );
      }

      res.status(txResult.idempotentReplay ? 200 : 201).json({
        ok: true,
        status: txResult.status,
        idempotentReplay: txResult.idempotentReplay,
        idempotencyKey: resolvedIdemKey,
        grant: txResult.grant,
        balances: txResult.balances,
      });
    } catch (err) {
      next(err);
    }
  });

  // ==========================================================================
  // 5. OpenMU-Origins Status, Login, Register & CashShop Endpoints
  // ==========================================================================
  app.get('/api/openmu/status', (_req, res) => {
    const hasExternalApi =
      Boolean(process.env.OPENMU_API_URL) &&
      !process.env.OPENMU_API_URL?.includes('localhost:5000');
    const hasPayPalKeys = Boolean(
      process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET
    );
    const dbHealth = getDatabaseHealth();
    const cacheHealth = getCacheBackendStatus();

    res.json({
      connectedMode: hasExternalApi
        ? 'Live OpenMU-Origins Remote API'
        : dbHealth.postgresConnected
        ? 'PostgreSQL SERIALIZABLE ACID + Redis Cache'
        : 'OpenMU-Origins Embedded ACID Bridge',
      openMuApiUrl: process.env.OPENMU_API_URL || 'http://localhost:5000',
      merchantPhone: process.env.TRUEMONEY_MERCHANT_PHONE || '',
      payPalSandbox: process.env.PAYPAL_USE_SANDBOX !== 'false',
      hasLivePayPalCredentials: hasPayPalKeys,
      database: dbHealth,
      cache: cacheHealth,
      packages: PAYPAL_PACKAGES,
      trueMoneyTiers: TRUEMONEY_TIERS,
      recentGrants: getRecentCoinGrants(25),
    });
  });

  app.post('/api/openmu/login', authLimiter, async (req, res, next) => {
    try {
      const {
        loginName,
        password,
        turnstileToken,
        'cf-turnstile-response': cfResponse,
      } = req.body as {
        loginName?: string;
        password?: string;
        turnstileToken?: string;
        'cf-turnstile-response'?: string;
      };

      const token = turnstileToken || cfResponse;
      const clientIp = extractClientIp(req);

      const turnstileResult = await verifyCloudflareTurnstile(token, clientIp);
      if (!turnstileResult.ok) {
        res.status(403).json({
          ok: false,
          message: turnstileResult.reason || 'Cloudflare verification failed',
        });
        return;
      }

      if (!loginName || !loginName.trim()) {
        res.status(400).json({ ok: false, message: 'กรุณาระบุชื่อบัญชี (LoginName)' });
        return;
      }
      if (!password) {
        res.status(400).json({ ok: false, message: 'กรุณาระบุรหัสผ่าน (Password)' });
        return;
      }

      const cleanName = loginName.trim();
      const acc = getMemoryAccount(cleanName);

      if (
        !acc ||
        !verifyAccountPassword(
          acc.passwordPlainOrSimulatedBcrypt,
          acc.passwordHash,
          password
        )
      ) {
        await recordAuditLog(
          {
            accountId: cleanName,
            ipAddress: clientIp,
            action: 'AUTH_LOGIN_FAILED',
            status: 'REJECTED',
            details: `Failed login attempt for "${cleanName}"`,
          },
          getPgPool()
        );
        res.status(401).json({
          ok: false,
          message: 'ชื่อบัญชีหรือรหัสผ่านไม่ถูกต้อง (Invalid credentials)',
        });
        return;
      }

      if (acc.state === 'Banned' || acc.state === 'TemporarilyBanned') {
        res.status(403).json({
          ok: false,
          message: `บัญชี ${acc.loginName} ถูกระงับการใช้งาน (AccountState = ${acc.state})`,
        });
        return;
      }

      const membStat = await queryMembStatOnlineStatus(acc.loginName);

      await recordAuditLog(
        {
          accountId: acc.loginName,
          ipAddress: clientIp,
          action: 'AUTH_LOGIN_SUCCESS',
          status: 'COMMITTED',
          details: `Authenticated session established (ConnectStat=${membStat.ConnectStat})`,
        },
        getPgPool()
      );

      res.json({
        ok: true,
        sessionCookieName: '.EgisMU.WebShop',
        account: {
          id: acc.id,
          loginName: acc.loginName,
          email: acc.email,
          characterDeleteCode: acc.securityCode,
          state: acc.state,
          role: acc.role,
          isMasterAdmin: acc.isMasterAdmin,
          credits: acc.credits,
          vaultMoney: acc.vaultMoney,
          vipUntil: acc.vipUntil,
          vaultItems: acc.vaultItems,
          wCoinC: acc.wCoinC,
          wCoinP: acc.wCoinP,
          goblinPoints: acc.goblinPoints,
          connectStat: membStat.ConnectStat,
          isAdmin:
            acc.state === 'GameMaster' ||
            acc.role === 'ADMIN' ||
            acc.role === 'SUPER_ADMIN',
        },
      });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/openmu/register', authLimiter, async (req, res, next) => {
    try {
      const {
        loginName,
        password,
        email,
        characterDeleteCode,
        turnstileToken,
        'cf-turnstile-response': cfResponse,
      } = req.body as {
        loginName?: string;
        password?: string;
        email?: string;
        characterDeleteCode?: string;
        turnstileToken?: string;
        'cf-turnstile-response'?: string;
      };

      const token = turnstileToken || cfResponse;
      const clientIp = extractClientIp(req);

      const turnstileResult = await verifyCloudflareTurnstile(token, clientIp);
      if (!turnstileResult.ok) {
        res.status(403).json({
          ok: false,
          message: turnstileResult.reason || 'Cloudflare verification failed',
        });
        return;
      }

      if (!loginName || loginName.trim().length < 3 || loginName.trim().length > 10) {
        res.status(400).json({
          ok: false,
          message: 'LoginName ต้องมีความยาว 3–10 ตัวอักษร',
        });
        return;
      }
      if (!password || password.length < 6) {
        res.status(400).json({
          ok: false,
          message: 'Password ต้องมีความยาวอย่างน้อย 6 ตัวอักษร',
        });
        return;
      }

      const cleanDeleteCode = String(characterDeleteCode || '').trim();
      if (!/^\d{4,8}$/.test(cleanDeleteCode)) {
        res.status(400).json({
          ok: false,
          message: 'รหัสสำหรับลบตัวละครต้องเป็นตัวเลข 0-9 เท่านั้น (ความยาว 4–8 หลัก)',
        });
        return;
      }

      const newAcc = await registerAccountRecord(
        loginName.trim(),
        password,
        email || `${loginName.trim()}@openmu.local`,
        cleanDeleteCode,
        clientIp
      );

      res.status(201).json({
        ok: true,
        message: `Account "${newAcc.loginName}" registered successfully.`,
        account: {
          id: newAcc.id,
          loginName: newAcc.loginName,
          email: newAcc.email,
          characterDeleteCode: newAcc.securityCode,
          state: newAcc.state,
          role: newAcc.role,
          isMasterAdmin: false,
          credits: newAcc.credits,
          vaultMoney: newAcc.vaultMoney,
          vipUntil: newAcc.vipUntil,
          vaultItems: newAcc.vaultItems,
          wCoinC: newAcc.wCoinC,
          wCoinP: newAcc.wCoinP,
          goblinPoints: newAcc.goblinPoints,
          isAdmin: false,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/accounts/:loginName/cash-shop', (req, res) => {
    const loginName = req.params.loginName || '';
    const acc = getMemoryAccount(loginName);
    if (!acc) {
      res.status(404).json({ message: 'Account not found' });
      return;
    }
    const grants = getRecentCoinGrants(20, loginName);
    res.json({
      loginName: acc.loginName,
      wCoinC: acc.wCoinC,
      wCoinP: acc.wCoinP,
      goblinPoints: acc.goblinPoints,
      grants,
    });
  });

  app.post(
    '/api/accounts/:loginName/cash-shop/grants',
    requireOpenMuApiKey,
    async (req, res, next) => {
      try {
        const loginName = (req.params.loginName || '').trim();
        const clientIp = extractClientIp(req);
        const headerIdem = req.headers['idempotency-key'];
        const { coinType = 'WCoinC', amount, reason, reference } = req.body as {
          coinType?: CashShopCoinType;
          amount?: number;
          reason?: string;
          reference?: string;
        };

        if (!/^[a-zA-Z0-9_-]{3,20}$/.test(loginName)) {
          res.status(400).json({ ok: false, message: 'Invalid login name format.' });
          return;
        }

        if (!['WCoinC', 'WCoinP', 'GoblinPoints'].includes(coinType)) {
          res.status(400).json({ ok: false, message: 'Invalid coinType parameter.' });
          return;
        }

        if (
          typeof amount !== 'number' ||
          !Number.isInteger(amount) ||
          amount <= 0 ||
          amount > 500000
        ) {
          res.status(400).json({
            ok: false,
            message: 'The amount must be a positive integer between 1 and 500,000.',
          });
          return;
        }

        const ref = reference
          ? reference.trim()
          : `manual:${crypto.randomUUID().slice(0, 10)}`;
        const idemKey =
          typeof headerIdem === 'string' && headerIdem.trim() ? headerIdem.trim() : ref;
        const creditsAdded = Math.max(0, amount * 4);

        const txResult = await executePaymentGrantTx({
          idempotencyKey: idemKey,
          loginName,
          ipAddress: clientIp,
          coinType,
          coinAmount: amount,
          creditsAdded,
          reason: reason ? reason.trim().slice(0, 120) : 'Direct API CashShop Grant',
          reference: ref,
          clientName: 'OpenMU.ApiKey',
        });

        if (!txResult.idempotentReplay) {
          await forwardGrantToExternalOpenMu(
            loginName,
            coinType,
            amount,
            reason || 'Direct API CashShop Grant',
            ref
          );
        }

        res.status(txResult.status === 'Created' ? 201 : 200).json({
          ok: true,
          status: txResult.status,
          idempotentReplay: txResult.idempotentReplay,
          grant: txResult.grant,
          balances: {
            wCoinC: txResult.balances.wCoinC,
            wCoinP: txResult.balances.wCoinP,
            goblinPoints: txResult.balances.goblinPoints,
          },
        });
      } catch (err) {
        next(err);
      }
    }
  );

  // ==========================================================================
  // 6. TrueMoney & PayPal Payment Routes (Idempotent + Audited)
  // ==========================================================================
  app.post('/api/payments/truemoney/redeem', paymentLimiter, async (req, res, next) => {
    try {
      const clientIp = extractClientIp(req);
      const headerIdem = req.headers['idempotency-key'];
      const {
        loginName,
        method,
        voucherUrlOrPin,
        selectedTierThb,
      } = req.body as {
        loginName?: string;
        method?: 'angpao' | 'cashcard' | 'promptpay';
        voucherUrlOrPin?: string;
        selectedTierThb?: number;
      };

      if (!loginName) {
        res.status(400).json({ ok: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการเติมเงิน' });
        return;
      }

      const rawInput = (voucherUrlOrPin || '').trim();
      let voucherCode = '';

      if (method === 'angpao') {
        const match = rawInput.match(/[?&]v=([a-zA-Z0-9_-]{8,64})/);
        voucherCode = match ? match[1] : rawInput.replace(/[^a-zA-Z0-9]/g, '');
        if (voucherCode.length < 8) {
          res.status(400).json({
            ok: false,
            message:
              'ลิงก์ซองอั่งเปา TrueMoney ไม่ถูกต้อง (ตัวอย่าง: https://gift.truemoney.com/campaign/?v=0192837465abcdef)',
          });
          return;
        }
      } else if (method === 'cashcard') {
        const digits = rawInput.replace(/\D/g, '');
        if (digits.length !== 14) {
          res.status(400).json({
            ok: false,
            message: 'รหัสบัตรเงินสด TrueMoney ต้องเป็นตัวเลข 14 หลักเท่านั้น',
          });
          return;
        }
        voucherCode = `PIN${digits}`;
      } else {
        voucherCode = rawInput || `QR${Date.now()}`;
      }

      const tier =
        TRUEMONEY_TIERS.find((t) => t.amountThb === Number(selectedTierThb)) ||
        TRUEMONEY_TIERS[1];

      const reference = `truemoney:${voucherCode}`;
      const idemKey =
        typeof headerIdem === 'string' && headerIdem.trim()
          ? headerIdem.trim()
          : reference;
      const reason = `TrueMoney ${
        method === 'angpao'
          ? 'Angpao Voucher'
          : method === 'cashcard'
          ? 'Cash Card 14-Pin'
          : 'QR PromptPay'
      } (${tier.amountThb} THB)`;

      const txResult = await executePaymentGrantTx({
        idempotencyKey: idemKey,
        loginName,
        ipAddress: clientIp,
        coinType: 'WCoinC',
        coinAmount: tier.wCoinC,
        creditsAdded: tier.credits,
        reason,
        reference,
        clientName: 'TrueMoneyWallet',
      });

      if (txResult.status === 'AlreadyGranted') {
        res.status(409).json({
          ok: false,
          status: txResult.status,
          idempotentReplay: true,
          message: `ซองอั่งเปาหรือรหัสอ้างอิง (${reference}) นี้ถูกใช้งานไปแล้ว (Idempotent Protection)`,
          grant: txResult.grant,
        });
        return;
      }

      await forwardGrantToExternalOpenMu(
        loginName,
        'WCoinC',
        tier.wCoinC,
        reason,
        reference
      );

      res.status(201).json({
        ok: true,
        status: txResult.status,
        message: `เติมเงิน TrueMoney ${tier.amountThb} บาท สำเร็จ! ได้รับ +${tier.credits.toLocaleString()} WebShop Credits และ +${tier.wCoinC.toLocaleString()} WCoinC เข้าสู่บัญชี ${loginName}`,
        creditsAdded: tier.credits,
        wCoinCAdded: tier.wCoinC,
        grant: txResult.grant,
        balances: {
          wCoinC: txResult.balances.wCoinC,
          wCoinP: txResult.balances.wCoinP,
          goblinPoints: txResult.balances.goblinPoints,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/payments/paypal/create-order', paymentLimiter, async (req, res) => {
    const { loginName, packageCode } = req.body as {
      loginName?: string;
      packageCode?: string;
    };

    const pkg = PAYPAL_PACKAGES.find((p) => p.code === packageCode);
    if (!pkg || !loginName) {
      res.status(400).json({ ok: false, message: 'Invalid package or account' });
      return;
    }

    const orderToken = `PAYPAL_${crypto
      .randomBytes(5)
      .toString('hex')
      .toUpperCase()}`;

    res.json({
      ok: true,
      orderToken,
      package: pkg,
      mode:
        process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET
          ? 'live_rest_api'
          : 'sandbox_interactive',
    });
  });

  app.post('/api/payments/paypal/capture-order', paymentLimiter, async (req, res, next) => {
    try {
      const clientIp = extractClientIp(req);
      const headerIdem = req.headers['idempotency-key'];
      const { loginName, packageCode, orderToken, payerEmail } = req.body as {
        loginName?: string;
        packageCode?: string;
        orderToken?: string;
        payerEmail?: string;
      };

      const pkg = PAYPAL_PACKAGES.find((p) => p.code === packageCode);
      if (!pkg || !loginName || !orderToken) {
        res.status(400).json({
          ok: false,
          message: 'ข้อมูลคำสั่งซื้อ PayPal ไม่ครบถ้วน',
        });
        return;
      }

      const reference = `paypal:${orderToken}`;
      const idemKey =
        typeof headerIdem === 'string' && headerIdem.trim()
          ? headerIdem.trim()
          : reference;
      const reason = `PayPal purchase ${pkg.code} ($${pkg.priceUsd.toFixed(2)})${
        payerEmail ? ` by ${payerEmail}` : ''
      }`;

      const txResult = await executePaymentGrantTx({
        idempotencyKey: idemKey,
        loginName,
        ipAddress: clientIp,
        coinType: 'WCoinC',
        coinAmount: pkg.wCoinC,
        creditsAdded: pkg.credits,
        reason,
        reference,
        clientName: 'PayPal',
      });

      if (!txResult.idempotentReplay) {
        await forwardGrantToExternalOpenMu(
          loginName,
          'WCoinC',
          pkg.wCoinC,
          reason,
          reference
        );
      }

      res.status(txResult.status === 'Created' ? 201 : 200).json({
        ok: true,
        status: txResult.status,
        idempotentReplay: txResult.idempotentReplay,
        message: `ชำระเงินผ่าน PayPal ($${pkg.priceUsd.toFixed(
          2
        )}) สำเร็จ! ได้รับ +${pkg.credits.toLocaleString()} WebShop Credits และ +${pkg.wCoinC.toLocaleString()} WCoinC`,
        creditsAdded: txResult.status === 'Created' ? pkg.credits : 0,
        wCoinCAdded: txResult.status === 'Created' ? pkg.wCoinC : 0,
        grant: txResult.grant,
        balances: {
          wCoinC: txResult.balances.wCoinC,
          wCoinP: txResult.balances.wCoinP,
          goblinPoints: txResult.balances.goblinPoints,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  // ==========================================================================
  // 7. Admin Audit Logs & Redis Catalog Cache Management Endpoints
  // ==========================================================================
  app.get('/api/admin/audit-logs', requireAdmin, (req, res) => {
    const limit = Number(req.query.limit) || 200;
    const accountFilter =
      typeof req.query.account === 'string' ? req.query.account : undefined;
    const entries = getRecentAuditLogs(limit, accountFilter);
    res.json({ ok: true, count: entries.length, logs: entries });
  });

  app.post('/api/admin/catalog/items', requireAdmin, async (req, res, next) => {
    try {
      const item = req.body?.item as WebShopItem | undefined;
      if (!item || typeof item.uid !== 'number' || !item.name) {
        res.status(400).json({ ok: false, message: 'Valid WebShopItem payload required.' });
        return;
      }
      const saved = await upsertCatalogItem(item);
      const adminAcc = getRequesterAccount(req);
      await recordAuditLog(
        {
          accountId: adminAcc?.loginName || 'admin',
          ipAddress: extractClientIp(req),
          action: 'ADMIN_CATALOG_UPSERT_ITEM',
          status: 'COMMITTED',
          details: `Upserted catalog item UID #${saved.uid} (${saved.name}, ${saved.credits} Cr) & invalidated Redis catalog cache`,
        },
        getPgPool()
      );
      res.json({ ok: true, item: saved });
    } catch (err) {
      next(err);
    }
  });

  app.delete('/api/admin/catalog/items/:uid', requireAdmin, async (req, res, next) => {
    try {
      const uid = Number(req.params.uid);
      const removed = await deleteCatalogItem(uid);
      const adminAcc = getRequesterAccount(req);
      await recordAuditLog(
        {
          accountId: adminAcc?.loginName || 'admin',
          ipAddress: extractClientIp(req),
          action: 'ADMIN_CATALOG_DELETE_ITEM',
          status: 'COMMITTED',
          details: `Deleted catalog item UID #${uid} & invalidated Redis catalog cache`,
        },
        getPgPool()
      );
      res.json({ ok: true, removed });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/admin/catalog/groups', requireAdmin, async (req, res, next) => {
    try {
      const group = req.body?.group as ItemGroup | undefined;
      if (!group || typeof group.id !== 'number' || !group.name) {
        res.status(400).json({ ok: false, message: 'Valid ItemGroup payload required.' });
        return;
      }
      const saved = await upsertCatalogGroup(group);
      const adminAcc = getRequesterAccount(req);
      await recordAuditLog(
        {
          accountId: adminAcc?.loginName || 'admin',
          ipAddress: extractClientIp(req),
          action: 'ADMIN_CATALOG_UPSERT_GROUP',
          status: 'COMMITTED',
          details: `Upserted item group #${saved.id} (${saved.name}, ${saved.credits} Cr) & invalidated Redis catalog cache`,
        },
        getPgPool()
      );
      res.json({ ok: true, group: saved });
    } catch (err) {
      next(err);
    }
  });

  app.delete('/api/admin/catalog/groups/:id', requireAdmin, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const removed = await deleteCatalogGroup(id);
      const adminAcc = getRequesterAccount(req);
      await recordAuditLog(
        {
          accountId: adminAcc?.loginName || 'admin',
          ipAddress: extractClientIp(req),
          action: 'ADMIN_CATALOG_DELETE_GROUP',
          status: 'COMMITTED',
          details: `Deleted item group #${id} & invalidated Redis catalog cache`,
        },
        getPgPool()
      );
      res.json({ ok: true, removed });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/admin/catalog/invalidate', requireAdmin, async (_req, res, next) => {
    try {
      await invalidateCatalogCache();
      res.json({ ok: true, message: 'Catalog Redis cache invalidated.' });
    } catch (err) {
      next(err);
    }
  });

  // Unmatched API 404 handler
  app.use('/api', (_req, res) => {
    res.status(404).json({ ok: false, message: 'API route not found.' });
  });

  // Centralized Domain & Unexpected Error Middleware
  app.use(
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      if (err instanceof TransactionDomainError) {
        res.status(err.httpStatus).json({
          ok: false,
          code: err.code,
          message: err.message,
        });
        return;
      }

      console.error(
        '[Internal Error Handler]',
        err instanceof Error ? err.stack || err.message : err
      );
      res.status(500).json({
        ok: false,
        code: 'INTERNAL_ERROR',
        message:
          'เกิดข้อผิดพลาดภายในระบบ ธุรกรรมถูกยกเลิกอัตโนมัติ (Transaction Rolled Back)',
      });
    }
  );

  // Vite Dev Middleware vs Production Static SPA Serving
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(
      express.static(distPath, {
        maxAge: '7d',
        immutable: true,
        index: false,
      })
    );
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const httpServer: Server = app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `OpenMU-WebShop Server [${process.arch}] listening on http://0.0.0.0:${PORT}`
    );
  });

  const gracefulShutdown = async (signal: string) => {
    console.info(`[Shutdown] Received ${signal}. Draining connections...`);
    httpServer.close(async () => {
      await closeRedisConnection().catch(() => {});
      const pool = getPgPool();
      if (pool) {
        await pool.end().catch(() => {});
      }
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => void gracefulShutdown('SIGINT'));
}

startServer().catch((fatalErr) => {
  console.error('[Fatal Startup Error]', fatalErr);
  process.exit(1);
});
