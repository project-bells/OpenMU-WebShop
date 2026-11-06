import crypto from 'crypto';
import dotenv from 'dotenv';
import express from 'express';
import type { Server } from 'http';
import path from 'path';
import { getRecentAuditLogs, recordAuditLog } from './src/server/auditLogger';
import {
  CashShopCoinType,
  TransactionDomainError,
  authenticateOpenMuAccount,
  buildDefaultPromotionConfig,
  deleteCatalogGroup,
  deleteCatalogItem,
  executePaymentGrantTx,
  executePurchaseGroupSetTx,
  executePurchaseSingleItemTx,
  executeRefundVaultItemTx,
  getCatalogBundleCached,
  getDatabaseHealth,
  getEffectivePromotions,
  getOpenMuAccountSummary,
  getMemoryAccount,
  getPgPool,
  getPromotionConfig,
  getRecentCoinGrants,
  initializeDatabaseLayer,
  invalidateCatalogCache,
  queryMembStatOnlineStatus,
  reserveCreditExchange,
  completeCreditExchange,
  registerAccountRecord,
  resetPromotionConfigToDefault,
  setMembStatConnectionState,
  updatePromotionConfig,
  upsertCatalogGroup,
  upsertCatalogItem,
  verifyAccountPassword,
} from './src/server/dbRepository';
import {
  clearSessionCookie,
  createSession,
  type AuthenticatedRequest,
  readSession,
  requireAdminSession,
  requireCsrf,
  requireSession,
  validateProductionConfiguration,
} from './src/server/security';
import { createDistributedRateLimiter, extractClientIp } from './src/server/rateLimiter';
import { closeRedisConnection, getCacheBackendStatus } from './src/server/redisCache';
import { capturePayPalOrder, createPayPalOrder, verifyPayPalWebhook } from './src/server/paypal';
import type {
  ItemGroup,
  PromotionConfig,
  VaultItemInstance,
  WebShopItem,
} from './src/types/webshop';

dotenv.config();

const DEFAULT_PROMO_SNAPSHOT = buildDefaultPromotionConfig();
export const PAYPAL_PACKAGES = DEFAULT_PROMO_SNAPSHOT.payPalPackages;
export const TRUEMONEY_TIERS = DEFAULT_PROMO_SNAPSHOT.trueMoneyTiers;

async function forwardGrantToExternalOpenMu(
  loginName: string,
  coinType: CashShopCoinType,
  amount: number,
  reason: string,
  reference: string
): Promise<boolean> {
  const apiUrl = process.env.OPENMU_API_URL;
  const apiKey = process.env.OPENMU_API_KEY;
  if (!apiUrl || !apiKey) {
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
    return false;
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
  validateProductionConfiguration();
  await initializeDatabaseLayer();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);
  app.disable('x-powered-by');

  // Zero-Trust Security Headers (compatible with iframe preview environments)
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '0');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https://api-m.sandbox.paypal.com https://api-m.paypal.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
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
  app.use((req, res, next) => {
    if (req.path.includes('legacy-disabled') || req.path.startsWith('/api/openmu/memb-stat')) {
      res.status(404).json({ ok: false, message: 'Not found.' });
      return;
    }
    next();
  });

  app.use('/api/shop', (req, res, next) => req.method === 'GET' && req.path === '/catalog' ? next() : requireSession(req as AuthenticatedRequest, res, next));
  app.use('/api/accounts', requireSession);
  app.use('/api/accounts/:loginName/cash-shop', (_req, res) => {
    res.status(410).json({ ok: false, message: 'Use the authoritative OpenMU CashShop API.' });
  });
  app.use('/api/accounts/:loginName', (req: AuthenticatedRequest, res, next) => {
    if (!req.session?.admin && req.params.loginName.toLowerCase() !== req.session?.loginName.toLowerCase()) {
      res.status(403).json({ ok: false, message: 'Account access denied.' });
      return;
    }
    next();
  });
  app.use('/api/payments', requireSession);
  app.use('/api/admin', requireSession, requireAdminSession);
  app.use('/api/shop', (req, res, next) => req.method === 'GET' ? next() : requireCsrf(req as AuthenticatedRequest, res, next));
  app.use('/api/accounts', (req, res, next) => req.method === 'GET' ? next() : requireCsrf(req as AuthenticatedRequest, res, next));
  app.use('/api/payments', (req, res, next) => req.method === 'GET' ? next() : requireCsrf(req as AuthenticatedRequest, res, next));
  app.use('/api/admin', (req, res, next) => req.method === 'GET' ? next() : requireCsrf(req as AuthenticatedRequest, res, next));
  app.use(['/api/shop/purchase', '/api/shop/purchase-group', '/api/shop/refund'], (_req, res) => {
    res.status(503).json({ ok: false, message: 'Direct item delivery is disabled until an authoritative OpenMU inventory API is configured.' });
  });

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
    const session = (req as AuthenticatedRequest).session ?? readSession(req);
    return session ? { loginName: session.loginName } : null;
  }

  function requireAdmin(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    requireAdminSession(req as AuthenticatedRequest, res, next);
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

    const secretKey = process.env.CF_TURNSTILE_SECRET_KEY;
    if (!secretKey) return { ok: false, reason: 'Cloudflare Turnstile is not configured.' };

    if (process.env.NODE_ENV !== 'production' && (
      token.startsWith('TEST_TOKEN_') ||
      token === 'mock_turnstile_pass' ||
      token === '1x00000000000000000000AA'
    )) {
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
      return {
        ok: false,
        reason: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ Cloudflare Turnstile ได้ กรุณาลองใหม่อีกครั้ง',
      };
    }
  }

  // ==========================================================================
  // 0. Healthcheck & Infrastructure Probe (OCI Ampere A1 / Docker Readiness)
  // ==========================================================================
  app.get('/health/live', (_req, res) => res.json({ status: 'ok' }));

  app.get('/health/ready', (_req, res) => {
    const db = getDatabaseHealth();
    const ready = db.postgresConnected && Boolean(process.env.OPENMU_API_URL && process.env.OPENMU_API_KEY);
    res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'unavailable', database: db.mode });
  });

  app.get('/api/health', (_req, res) => {
    const db = getDatabaseHealth();
    const cache = getCacheBackendStatus();
    res.status(db.postgresConnected ? 200 : 503).json({
      ok: db.postgresConnected,
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
  app.post('/api/webhooks/paypal', paymentLimiter, async (req: RawBodyRequest, res) => {
    try {
      const headers = Object.fromEntries(Object.entries(req.headers).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]));
      if (!await verifyPayPalWebhook(headers, req.body)) { res.status(401).json({ ok: false }); return; }
      const event = req.body as any;
      if (event.event_type !== 'PAYMENT.CAPTURE.COMPLETED') { res.status(204).end(); return; }
      const resource = event.resource;
      const [loginName, packageCode] = String(resource?.custom_id ?? '').split('|');
      const pkg = getEffectivePromotions().effectivePayPalPackages.find((candidate) => candidate.code === packageCode);
      if (!pkg || resource?.status !== 'COMPLETED' || resource?.amount?.currency_code !== 'THB' || String(resource?.amount?.value) !== pkg.priceThb.toFixed(2) || !resource?.id || !loginName) {
        res.status(400).json({ ok: false }); return;
      }
      const reference = `paypal:${resource.id}`;
      const reason = `PayPal ${pkg.code}`;
      const granted = pkg.wCoinC === 0 || await forwardGrantToExternalOpenMu(loginName, 'WCoinC', pkg.wCoinC, reason, reference);
      if (!granted) { res.status(503).json({ ok: false }); return; }
      await executePaymentGrantTx({ idempotencyKey: reference, loginName, ipAddress: extractClientIp(req), coinType: 'WCoinC', coinAmount: pkg.wCoinC, creditsAdded: pkg.credits, reason, reference, clientName: 'PayPal' });
      res.status(204).end();
    } catch (error) {
      console.error('[PayPal webhook]', error instanceof Error ? error.message : error);
      res.status(503).json({ ok: false });
    }
  });

  app.post('/api/webhooks/payment', (_req, res) => {
    res.status(410).json({ ok: false, message: 'Generic payment webhooks are disabled. Use a verified provider-specific endpoint.' });
  });

  app.post('/api/webhooks/payment-legacy-disabled', paymentLimiter, async (req: RawBodyRequest, res, next) => {
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
    const {
      config: promoConfig,
      effectiveTrueMoneyTiers,
      effectivePayPalPackages,
    } = getEffectivePromotions();

    res.json({
      connectedMode: hasExternalApi
        ? 'Live OpenMU-Origins Remote API'
        : dbHealth.postgresConnected
        ? 'PostgreSQL SERIALIZABLE ACID + Redis Cache'
        : 'OpenMU-Origins Embedded ACID Bridge',
      openMuApiUrl: process.env.OPENMU_API_URL || 'http://localhost:5000',
      merchantPhone:
        promoConfig.merchantPhone || process.env.TRUEMONEY_MERCHANT_PHONE || '',
      payPalSandbox: process.env.PAYPAL_USE_SANDBOX !== 'false',
      hasLivePayPalCredentials: hasPayPalKeys,
      database: dbHealth,
      cache: cacheHealth,
      promotionConfig: promoConfig,
      packages: effectivePayPalPackages,
      trueMoneyTiers: effectiveTrueMoneyTiers,
      paymentProviders: {
        trueMoney: process.env.PAYMENTS_ENABLED === 'true' && process.env.TRUEMONEY_ENABLED === 'true' ? 'configured' : 'disabled',
        payPal: process.env.PAYMENTS_ENABLED === 'true' && Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) ? 'configured' : 'disabled',
        cards: process.env.PAYMENTS_ENABLED === 'true' && process.env.CARDS_ENABLED === 'true' ? 'configured' : 'disabled',
      },
    });
  });

  app.get('/api/payments/promotions', (_req, res) => {
    const {
      config: promoConfig,
      effectiveTrueMoneyTiers,
      effectivePayPalPackages,
    } = getEffectivePromotions();
    res.json({
      ok: true,
      promotionConfig: promoConfig,
      trueMoneyTiers: effectiveTrueMoneyTiers,
      packages: effectivePayPalPackages,
    });
  });

  app.post('/api/payments/credits/exchange', paymentLimiter, async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.session) { res.status(401).json({ ok: false }); return; }
      const credits = Math.trunc(Number(req.body?.credits));
      const idempotencyKey = String(req.headers['idempotency-key'] ?? '').trim();
      if (!/^[a-zA-Z0-9:_-]{16,128}$/.test(idempotencyKey)) {
        res.status(400).json({ ok: false, message: 'A valid Idempotency-Key header is required.' }); return;
      }
      if (credits < 100 || credits > 50_000 || credits % 5 !== 0) {
        res.status(400).json({ ok: false, message: 'Exchange 100-50,000 credits in multiples of 5.' }); return;
      }
      const wCoinC = credits / 5;
      const status = await reserveCreditExchange(req.session.loginName, credits, wCoinC, idempotencyKey);
      if (status === 'completed') { res.json({ ok: true, idempotentReplay: true, creditsSpent: credits, wCoinC }); return; }
      const reference = `credit-exchange:${idempotencyKey}`;
      const granted = await forwardGrantToExternalOpenMu(req.session.loginName, 'WCoinC', wCoinC, 'WebShop credit exchange', reference);
      if (!granted) { res.status(503).json({ ok: false, pending: true, message: 'Exchange is reserved and awaiting the OpenMU server. Retry with the same Idempotency-Key.' }); return; }
      await completeCreditExchange(idempotencyKey);
      res.status(201).json({ ok: true, creditsSpent: credits, wCoinC });
    } catch (error) { next(error); }
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
      const acc = await authenticateOpenMuAccount(cleanName, password);
      if (!acc) {
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

      if (acc.state !== 0) {
        res.status(403).json({
          ok: false,
          message: `บัญชี ${acc.loginName} ไม่สามารถเข้า WebShop ได้ในขณะนี้`,
        });
        return;
      }

      const isAdmin = new Set((process.env.ADMIN_ACCOUNTS ?? '').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean)).has(acc.loginName.toLowerCase());
      const session = createSession(acc.loginName, isAdmin);

      await recordAuditLog(
        {
          accountId: acc.loginName,
          ipAddress: clientIp,
          action: 'AUTH_LOGIN_SUCCESS',
          status: 'COMMITTED',
          details: 'Authenticated session established',
        },
        getPgPool()
      );

      res.setHeader('Set-Cookie', session.cookie);
      res.json({
        ok: true,
        csrfToken: session.csrfToken,
        account: {
          id: acc.id,
          loginName: acc.loginName,
          email: acc.email,
          state: acc.state,
          role: isAdmin ? 'ADMIN' : 'USER',
          isMasterAdmin: isAdmin,
          credits: acc.credits,
          vaultMoney: 0,
          vipUntil: null,
          vaultItems: [],
          wCoinC: acc.wCoinC,
          wCoinP: acc.wCoinP,
          goblinPoints: acc.goblinPoints,
          isAdmin,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/openmu/logout', requireSession, requireCsrf, (req, res) => {
    res.setHeader('Set-Cookie', clearSessionCookie());
    res.json({ ok: true });
  });

  app.get('/api/openmu/session', async (req, res) => {
    const session = readSession(req);
    if (!session) { res.status(401).json({ ok: false }); return; }
    const account = await getOpenMuAccountSummary(session.loginName);
    if (!account) { res.setHeader('Set-Cookie', clearSessionCookie()); res.status(401).json({ ok: false }); return; }
    res.json({ ok: true, csrfToken: session.csrf, account: {
      id: account.id, loginName: account.loginName, email: account.email, state: account.state,
      role: session.admin ? 'ADMIN' : 'USER', isAdmin: session.admin, isMasterAdmin: session.admin,
      credits: account.credits, vaultMoney: 0, vipUntil: null, vaultItems: [],
      wCoinC: account.wCoinC, wCoinP: account.wCoinP, goblinPoints: account.goblinPoints,
    } });
  });

  app.post('/api/openmu/register', authLimiter, async (_req, res) => {
    res.status(410).json({ ok: false, message: 'Registration is handled by the main player website.' });
  });

  /* Legacy registration implementation retained below but unreachable until removed after migration. */
  app.post('/api/openmu/register-legacy-disabled', authLimiter, async (req, res, next) => {
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
  app.post('/api/payments/truemoney/redeem', (_req, res) => {
    res.status(503).json({ ok: false, message: 'TrueMoney is not connected. No credit has been granted.' });
  });

  app.post('/api/payments/truemoney/redeem-legacy-disabled', paymentLimiter, async (req, res, next) => {
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

      const { config: promoCfg, effectiveTrueMoneyTiers } = getEffectivePromotions();
      const tier = effectiveTrueMoneyTiers.find(
        (t) => t.amountThb === Number(selectedTierThb)
      );
      if (!tier) {
        res.status(400).json({
          ok: false,
          message: 'ไม่พบแพ็กเกจราคา TrueMoney ที่เลือก หรือแพ็กเกจถูกปิดใช้งานชั่วคราว',
        });
        return;
      }

      const reference = `truemoney:${voucherCode}`;
      const idemKey =
        typeof headerIdem === 'string' && headerIdem.trim()
          ? headerIdem.trim()
          : reference;
      const promoNote =
        promoCfg.campaignActive && promoCfg.extraBonusPercent > 0
          ? ` [Event +${promoCfg.extraBonusPercent}%]`
          : '';
      const reason = `TrueMoney ${
        method === 'angpao'
          ? 'Angpao Voucher'
          : method === 'cashcard'
          ? 'Cash Card 14-Pin'
          : 'QR PromptPay'
      } (${tier.amountThb} THB · +${tier.bonusPercent}%${promoNote})`;

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
        message: `เติมเงิน TrueMoney ${tier.amountThb.toLocaleString()} บาท สำเร็จ! ได้รับ +${tier.credits.toLocaleString()} WebShop Credits และ +${tier.wCoinC.toLocaleString()} WCoinC เข้าสู่บัญชี ${loginName}`,
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

  app.post('/api/payments/paypal/create-order', paymentLimiter, async (req: AuthenticatedRequest, res, next) => {
    try {
      if (process.env.PAYMENTS_ENABLED !== 'true' || !process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
        res.status(503).json({ ok: false, message: 'PayPal checkout is not configured.' });
        return;
      }
      const { packageCode } = req.body as { packageCode?: string };
      const pkg = getEffectivePromotions().effectivePayPalPackages.find((candidate) => candidate.code === packageCode);
      if (!pkg || !req.session) { res.status(400).json({ ok: false, message: 'Invalid package.' }); return; }
      const order = await createPayPalOrder(pkg, req.session.loginName);
      res.status(201).json({ ok: true, orderToken: order.orderId, approvalUrl: order.approvalUrl, package: pkg });
    } catch (error) { next(error); }
  });

  app.post('/api/payments/paypal/create-order-legacy-disabled', paymentLimiter, async (req, res) => {
    const { loginName, packageCode } = req.body as {
      loginName?: string;
      packageCode?: string;
    };

    const { effectivePayPalPackages } = getEffectivePromotions();
    const pkg = effectivePayPalPackages.find((p) => p.code === packageCode);
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

  app.post('/api/payments/paypal/capture-order', (_req, res) => {
    res.status(503).json({ ok: false, message: 'PayPal capture is disabled. No credit has been granted.' });
  });

  app.get('/api/payments/paypal/complete', async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.session) { res.redirect('/?payment=login-required'); return; }
      const orderId = typeof req.query.token === 'string' ? req.query.token : '';
      const requestedPackage = typeof req.query.packageCode === 'string' ? req.query.packageCode : '';
      const capture = await capturePayPalOrder(orderId);
      const pkg = getEffectivePromotions().effectivePayPalPackages.find((candidate) => candidate.code === capture.packageCode);
      if (!pkg || pkg.code !== requestedPackage || capture.loginName.toLowerCase() !== req.session.loginName.toLowerCase() || capture.currency !== 'THB' || capture.amount !== pkg.priceThb.toFixed(2)) {
        res.redirect('/?payment=invalid'); return;
      }
      const reference = `paypal:${capture.captureId}`;
      const reason = `PayPal ${pkg.code}`;
      const granted = pkg.wCoinC === 0 || await forwardGrantToExternalOpenMu(capture.loginName, 'WCoinC', pkg.wCoinC, reason, reference);
      if (!granted) { res.redirect('/?payment=grant-pending'); return; }
      await executePaymentGrantTx({
        idempotencyKey: reference, loginName: capture.loginName, ipAddress: extractClientIp(req), coinType: 'WCoinC',
        coinAmount: pkg.wCoinC, creditsAdded: pkg.credits, reason, reference, clientName: 'PayPal',
      });
      res.redirect('/?payment=approved');
    } catch (error) {
      console.error('[PayPal completion]', error instanceof Error ? error.message : error);
      res.redirect('/?payment=invalid');
    }
  });

  app.post('/api/payments/paypal/capture-order-legacy-disabled', paymentLimiter, async (req, res, next) => {
    try {
      const clientIp = extractClientIp(req);
      const headerIdem = req.headers['idempotency-key'];
      const { loginName, packageCode, orderToken, payerEmail } = req.body as {
        loginName?: string;
        packageCode?: string;
        orderToken?: string;
        payerEmail?: string;
      };

      const { config: promoCfg, effectivePayPalPackages } = getEffectivePromotions();
      const pkg = effectivePayPalPackages.find((p) => p.code === packageCode);
      if (!pkg || !loginName || !orderToken) {
        res.status(400).json({
          ok: false,
          message: 'ข้อมูลคำสั่งซื้อ PayPal ไม่ครบถ้วน หรือแพ็กเกจถูกปิดใช้งาน',
        });
        return;
      }

      const reference = `paypal:${orderToken}`;
      const idemKey =
        typeof headerIdem === 'string' && headerIdem.trim()
          ? headerIdem.trim()
          : reference;
      const promoNote =
        promoCfg.campaignActive && promoCfg.extraBonusPercent > 0
          ? ` [Event +${promoCfg.extraBonusPercent}%]`
          : '';
      const reason = `PayPal purchase ${pkg.code} ($${pkg.priceUsd.toFixed(
        2
      )} / ${pkg.priceThb} THB · +${pkg.bonusPercent}%${promoNote})${
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
        )} / ฿${pkg.priceThb.toLocaleString()}) สำเร็จ! ได้รับ +${pkg.credits.toLocaleString()} WebShop Credits และ +${pkg.wCoinC.toLocaleString()} WCoinC`,
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

  // ==========================================================================
  // 8. Admin Top-Up & Donation Promotion Management Endpoints (RBAC Protected)
  // ==========================================================================
  app.get('/api/admin/promotions', requireAdmin, (_req, res) => {
    const config = getPromotionConfig();
    const { effectiveTrueMoneyTiers, effectivePayPalPackages } =
      getEffectivePromotions();
    res.json({
      ok: true,
      promotionConfig: config,
      effectiveTrueMoneyTiers,
      effectivePayPalPackages,
    });
  });

  app.put('/api/admin/promotions', requireAdmin, async (req, res, next) => {
    try {
      const adminAcc = getRequesterAccount(req);
      const patch = (req.body?.promotionConfig || req.body) as Partial<PromotionConfig>;
      if (!patch || typeof patch !== 'object') {
        res
          .status(400)
          .json({ ok: false, message: 'Valid promotionConfig payload is required.' });
        return;
      }

      const saved = await updatePromotionConfig(
        patch,
        adminAcc?.loginName || 'admin'
      );
      const { effectiveTrueMoneyTiers, effectivePayPalPackages } =
        getEffectivePromotions();

      await recordAuditLog(
        {
          accountId: adminAcc?.loginName || 'admin',
          ipAddress: extractClientIp(req),
          action: 'ADMIN_PROMOTION_UPDATE',
          status: 'COMMITTED',
          details: `Updated Top-Up Promotions (${saved.trueMoneyTiers.length} TrueMoney tiers, ${saved.payPalPackages.length} PayPal packages, Campaign=${
            saved.campaignActive ? `ON (+${saved.extraBonusPercent}%)` : 'OFF'
          }, Base=${saved.baseCreditsPerThb} Cr/THB & ${saved.baseWCoinCPerThb} WCoinC/THB)`,
        },
        getPgPool()
      );

      res.json({
        ok: true,
        message: 'บันทึกการตั้งค่าโปรโมชั่น TrueMoney & PayPal สำเร็จ',
        promotionConfig: saved,
        effectiveTrueMoneyTiers,
        effectivePayPalPackages,
      });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/admin/promotions/reset', requireAdmin, async (req, res, next) => {
    try {
      const adminAcc = getRequesterAccount(req);
      const reset = await resetPromotionConfigToDefault(
        adminAcc?.loginName || 'admin'
      );
      const { effectiveTrueMoneyTiers, effectivePayPalPackages } =
        getEffectivePromotions();

      await recordAuditLog(
        {
          accountId: adminAcc?.loginName || 'admin',
          ipAddress: extractClientIp(req),
          action: 'ADMIN_PROMOTION_RESET',
          status: 'COMMITTED',
          details:
            'Reset TrueMoney & PayPal promotion tiers to harmonized Egis-MU defaults',
        },
        getPgPool()
      );

      res.json({
        ok: true,
        message: 'รีเซ็ตโปรโมชั่นกลับเป็นค่ามาตรฐานที่สอดคล้องกันทั้ง TrueMoney & PayPal สำเร็จ',
        promotionConfig: reset,
        effectiveTrueMoneyTiers,
        effectivePayPalPackages,
      });
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
