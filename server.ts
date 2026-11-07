import crypto from 'crypto';
import dotenv from 'dotenv';
import express from 'express';
import type { Server } from 'http';
import path from 'path';
import { getRecentAuditLogs, recordAuditLog } from './src/server/auditLogger';
import {
  CashShopCoinType,
  TransactionDomainError,
  adminAdjustAccountBalance,
  authenticateOpenMuAccount,
  buildDefaultPromotionConfig,
  buyCharacter400Tx,
  completeCreditExchange,
  deleteCatalogGroup,
  deleteCatalogItem,
  deleteCharacter400ForCredits,
  executePaymentGrantTx,
  executePurchaseGroupSetTx,
  executePurchaseSingleItemTx,
  executeRefundVaultItemTx,
  getAccountCharacters,
  getCatalogBundleCached,
  getDatabaseHealth,
  getEffectivePromotions,
  getMemoryAccount,
  getOpenMuAccountSummary,
  getPgPool,
  getPromotionConfig,
  getRecentCoinGrants,
  initializeDatabaseLayer,
  invalidateCatalogCache,
  listAdminAccounts,
  queryMembStatOnlineStatus,
  redeemAccountOnlineHours,
  reserveAuthoritativeItemOrder,
  completeAuthoritativeItemOrder,
  failAuthoritativeItemOrder,
  reserveCreditExchange,
  resetPromotionConfigToDefault,
  setMembStatConnectionState,
  updatePromotionConfig,
  upsertCatalogGroup,
  upsertCatalogItem,
} from './src/server/dbRepository';
import {
  getOpenMuCashShopCatalog,
  grantOpenMuInventoryItem,
  OpenMuInventoryApiError,
} from './src/server/openMuInventoryApi';
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
  MuClassCode,
  PromotionConfig,
  VaultItemInstance,
  WebShopItem,
} from './src/types/webshop';
import { quoteCreditExchange } from './src/utils/creditExchange';

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
  const PORT = 3000;

  app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);
  app.disable('x-powered-by');

  // Security Headers (compatible with iframe preview environments)
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '0');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (process.env.NODE_ENV === 'production' && process.env.FRAME_PROTECTION === 'strict') {
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    }
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "img-src 'self' data: blob: https:; " +
      "font-src 'self' data: https://fonts.gstatic.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "frame-src 'self'; " +
      "connect-src 'self' ws: wss: https: https://api-m.sandbox.paypal.com https://api-m.paypal.com; " +
      "base-uri 'self'; " +
      "form-action 'self'"
    );
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
    const decodedPath = (() => {
      try {
        return decodeURIComponent(req.path);
      } catch {
        return req.path;
      }
    })();
    if (decodedPath.includes('legacy-disabled') || decodedPath.startsWith('/api/openmu/memb-stat')) {
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
    const param = (req.params.loginName || '').toLowerCase();
    if (param === 'characters' || param === 'online-reward') {
      next();
      return;
    }
    if (!req.session?.admin && param !== req.session?.loginName.toLowerCase()) {
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
  app.use(['/api/shop/purchase-group', '/api/shop/refund'], (_req, res) => {
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
  // ==========================================================================
  // 2. MEMB_STAT Online Status Query & Sync Endpoints (Anti-Dupe Guard)
  // ==========================================================================
  app.get('/api/openmu/memb-stat/:loginName', requireSession, async (req: AuthenticatedRequest, res, next) => {
    try {
      const target = (req.params.loginName || '').trim();
      if (!req.session?.admin && target.toLowerCase() !== req.session?.loginName.toLowerCase()) {
        res.status(403).json({ ok: false, message: 'Account access denied.' });
        return;
      }
      const row = await queryMembStatOnlineStatus(target);
      res.json({ ok: true, membStat: row });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/openmu/memb-stat', requireSession, requireAdminSession, requireCsrf, async (req, res, next) => {
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
  app.post('/api/shop/purchase', purchaseLimiter, async (req: AuthenticatedRequest, res, next) => {
    try {
      const clientIp = extractClientIp(req);
      const headerIdem = req.headers['idempotency-key'];
      const body = req.body as {
        idempotencyKey?: string;
        currency?: 'credits' | 'WCoinC';
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
      if (!idempotencyKey || body.currency === 'WCoinC') {
        throw new TransactionDomainError(
          body.currency === 'WCoinC' ? 'WCOIN_PURCHASE_NOT_AUTHORITATIVE' : 'IDEMPOTENCY_KEY_REQUIRED',
          422,
          body.currency === 'WCoinC'
            ? 'WCoin purchases remain disabled until OpenMU can debit WCoin and deliver the item atomically.'
            : 'Idempotency-Key is required.'
        );
      }
      if (
        Number(body.level) !== 0 ||
        Number(body.option) !== 0 ||
        Boolean(body.luck) ||
        Boolean(body.skill) ||
        (Array.isArray(body.exlOptions) && body.exlOptions.some(Boolean)) ||
        body.ancientStamina === 5 ||
        body.ancientStamina === 10 ||
        body.fenrirVariant === 1 ||
        body.fenrirVariant === 2 ||
        body.fenrirVariant === 3
      ) {
        throw new TransactionDomainError(
          'CLIENT_ITEM_OPTIONS_REJECTED',
          422,
          'Item options are controlled by the authoritative OpenMU offer and cannot be selected by the browser.'
        );
      }

      const reference = `webshop:order:${idempotencyKey}`;
      const order = await reserveAuthoritativeItemOrder({
        accountLogin: req.session?.loginName || '',
        itemUid: Number(body.itemUid),
        reference,
      });
      if (order.status === 'delivered') {
        res.json({
          ok: true,
          idempotentReplay: true,
          orderStatus: order.status,
          reference,
          chargedCredits: order.chargedCredits,
          chargedWCoinC: 0,
          remainingCredits: order.remainingCredits,
          remainingWCoinC: 0,
          addedItems: [],
          message: 'The item was already delivered to your in-game Cash Shop storage.',
        });
        return;
      }
      if (order.status !== 'pending') {
        throw new TransactionDomainError(
          'ORDER_REQUIRES_REVIEW',
          409,
          `Order ${reference} is ${order.status} and cannot be submitted again.`
        );
      }

      try {
        const grant = await grantOpenMuInventoryItem({
          loginName: order.accountLogin,
          packageSequence: order.packageSequence,
          priceSequence: order.priceSequence,
          reference,
          reason: `WebShop Credits purchase, item UID ${order.itemUid}`,
        });
        await completeAuthoritativeItemOrder(reference, grant.id);
        await recordAuditLog(
          {
            accountId: order.accountLogin,
            ipAddress: clientIp,
            action: 'AUTHORITATIVE_ITEM_PURCHASE',
            status: 'COMMITTED',
            creditsDelta: -order.chargedCredits,
            idempotencyKey,
            details: `Delivered OpenMU package ${order.packageSequence}, price ${order.priceSequence ?? 'bundle'}, grant ${grant.id}, reference ${reference}`,
          },
          getPgPool()
        );
        res.status(201).json({
          ok: true,
          orderStatus: 'delivered',
          reference,
          openMuGrantId: grant.id,
          chargedCredits: order.chargedCredits,
          chargedWCoinC: 0,
          remainingCredits: order.remainingCredits,
          remainingWCoinC: 0,
          addedItems: [],
          message: 'Item delivered to your in-game Cash Shop storage.',
        });
      } catch (error) {
        if (!(error instanceof OpenMuInventoryApiError)) throw error;
        if (error.retryable) {
          res.status(503).json({
            ok: false,
            pending: true,
            reference,
            idempotencyKey,
            remainingCredits: order.remainingCredits,
            message: 'Delivery is pending. Retry the same purchase; do not create a new order.',
          });
          return;
        }
        const refund = error.code !== 'REFERENCE_CONFLICT';
        await failAuthoritativeItemOrder(reference, error.code, refund);
        throw new TransactionDomainError(
          error.code,
          error.status || 409,
          refund
            ? `${error.message} Reserved credits were returned.`
            : `${error.message} The order requires manual review; credits were not changed again.`
        );
      }
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/shop/purchase-group', purchaseLimiter, async (req: AuthenticatedRequest, res, next) => {
    try {
      const clientIp = extractClientIp(req);
      const headerIdem = req.headers['idempotency-key'];
      const body = req.body as {
        idempotencyKey?: string;
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
        accountId: req.session?.loginName || '',
        ipAddress: clientIp,
        idempotencyKey,
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

  app.post('/api/shop/refund', purchaseLimiter, async (req: AuthenticatedRequest, res, next) => {
    try {
      const clientIp = extractClientIp(req);
      const body = req.body as {
        instanceId?: string;
        serial?: string;
      };

      const result = await executeRefundVaultItemTx({
        accountId: req.session?.loginName || '',
        ipAddress: clientIp,
        instanceId: body.instanceId || '',
        serial: body.serial || '',
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
      const quote = quoteCreditExchange(req.body?.credits);
      const idempotencyKey = String(req.headers['idempotency-key'] ?? '').trim();
      if (!/^[a-zA-Z0-9:_-]{16,128}$/.test(idempotencyKey)) {
        res.status(400).json({ ok: false, message: 'A valid Idempotency-Key header is required.' }); return;
      }
      if (!quote) {
        res.status(400).json({ ok: false, message: 'Exchange 100-50,000 credits in multiples of 5.' }); return;
      }
      const { credits, wCoinC } = quote;
      const status = await reserveCreditExchange(req.session.loginName, credits, wCoinC, idempotencyKey);
      if (status === 'completed') {
        const wallet = await getOpenMuAccountSummary(req.session.loginName);
        res.json({ ok: true, idempotentReplay: true, creditsSpent: credits, wCoinC, wallet });
        return;
      }
      const reference = `credit-exchange:${idempotencyKey}`;
      const granted = await forwardGrantToExternalOpenMu(req.session.loginName, 'WCoinC', wCoinC, 'WebShop credit exchange', reference);
      if (!granted) {
        res.status(503).json({ ok: false, pending: true, idempotencyKey, message: 'Exchange is reserved and awaiting the OpenMU server. Retry this pending exchange.' });
        return;
      }
      await completeCreditExchange(idempotencyKey);
      const wallet = await getOpenMuAccountSummary(req.session.loginName);
      res.status(201).json({ ok: true, creditsSpent: credits, wCoinC, wallet });
    } catch (error) { next(error); }
  });

  app.post('/api/openmu/login', authLimiter, async (req, res, next) => {
    try {
      const {
        loginName,
        password,
      } = req.body as {
        loginName?: string;
        password?: string;
      };

      const clientIp = extractClientIp(req);

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

      const isAdmin = Boolean(acc.isAdmin);
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
          vaultMoney: acc.vaultMoney,
          onlineMinutes: acc.onlineMinutes,
          exchangedOnlineHours: acc.exchangedOnlineHours,
          vipUntil: acc.vipUntil,
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

  app.post('/api/openmu/logout', requireSession, requireCsrf, (_req, res) => {
    res.setHeader('Set-Cookie', clearSessionCookie());
    res.json({ ok: true });
  });

  app.get('/api/openmu/session', async (req, res) => {
    const session = readSession(req);
    if (!session) { res.status(401).json({ ok: false }); return; }
    const account = await getOpenMuAccountSummary(session.loginName);
    if (!account) { res.setHeader('Set-Cookie', clearSessionCookie()); res.status(401).json({ ok: false }); return; }
    const isAdmin = Boolean(session.admin || account.isAdmin);
    res.json({ ok: true, csrfToken: session.csrf, account: {
      id: account.id, loginName: account.loginName, email: account.email, state: account.state,
      role: isAdmin ? 'ADMIN' : 'USER', isAdmin, isMasterAdmin: isAdmin,
      credits: account.credits, vaultMoney: account.vaultMoney,
      onlineMinutes: account.onlineMinutes, exchangedOnlineHours: account.exchangedOnlineHours,
      vipUntil: account.vipUntil, vaultItems: [],
      wCoinC: account.wCoinC, wCoinP: account.wCoinP, goblinPoints: account.goblinPoints,
    } });
  });

  // ==========================================================================
  // 5b. Authenticated Account Characters & Online Time Reward Endpoints
  // ==========================================================================
  app.get('/api/accounts/characters', async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.session) {
        res.status(401).json({ ok: false, message: 'Authentication required.' });
        return;
      }
      const characters = await getAccountCharacters(req.session.loginName);
      res.json({ ok: true, characters });
    } catch (err) {
      next(err);
    }
  });

  app.post(
    '/api/accounts/online-reward/redeem',
    purchaseLimiter,
    async (req: AuthenticatedRequest, res, next) => {
      try {
        if (!req.session) {
          res.status(401).json({ ok: false, message: 'Authentication required.' });
          return;
        }
        const hoursToRedeem = Number(req.body?.hoursToRedeem);
        const result = await redeemAccountOnlineHours({
          loginName: req.session.loginName,
          hoursToRedeem,
          ipAddress: extractClientIp(req),
        });
        res.json(result);
      } catch (err) {
        next(err);
      }
    }
  );

  app.post(
    '/api/accounts/characters/buy-400',
    purchaseLimiter,
    async (req: AuthenticatedRequest, res, next) => {
      try {
        if (!req.session) {
          res.status(401).json({ ok: false, message: 'Authentication required.' });
          return;
        }
        const { characterName, classCode } = req.body as {
          characterName?: string;
          classCode?: MuClassCode;
        };
        const result = await buyCharacter400Tx({
          loginName: req.session.loginName,
          characterName: characterName || '',
          classCode: (classCode || 'bm') as MuClassCode,
          ipAddress: extractClientIp(req),
        });
        res.status(201).json(result);
      } catch (err) {
        next(err);
      }
    }
  );

  app.post(
    '/api/accounts/characters/delete-400',
    purchaseLimiter,
    async (req: AuthenticatedRequest, res, next) => {
      try {
        if (!req.session) {
          res.status(401).json({ ok: false, message: 'Authentication required.' });
          return;
        }
        const { characterName, deleteCode } = req.body as {
          characterName?: string;
          deleteCode?: string;
        };
        const result = await deleteCharacter400ForCredits({
          loginName: req.session.loginName,
          characterName: characterName || '',
          deleteCode: deleteCode || '',
          ipAddress: extractClientIp(req),
        });
        res.json(result);
      } catch (err) {
        next(err);
      }
    }
  );

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

  // ==========================================================================
  // 7. Admin Account Balance, Audit Logs & Redis Catalog Cache Management
  // ==========================================================================
  app.get('/api/admin/accounts', requireAdmin, async (req, res, next) => {
    try {
      const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 250));
      const accounts = await listAdminAccounts(limit);
      res.json({ ok: true, count: accounts.length, accounts });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/admin/accounts/adjust-balance', requireAdmin, async (req, res, next) => {
    try {
      const adminAcc = getRequesterAccount(req);
      const clientIp = extractClientIp(req);
      const { username, creditsDelta, vaultZenDelta } = req.body as {
        username?: string;
        creditsDelta?: number;
        vaultZenDelta?: number;
      };

      const updated = await adminAdjustAccountBalance({
        targetLoginName: username || '',
        creditsDelta: typeof creditsDelta === 'number' ? creditsDelta : undefined,
        vaultZenDelta: typeof vaultZenDelta === 'number' ? vaultZenDelta : undefined,
        adminLoginName: adminAcc?.loginName || 'admin',
        ipAddress: clientIp,
      });

      res.json({
        ok: true,
        account: updated,
      });
    } catch (err) {
      next(err);
    }
  });

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
      if (!item || !Number.isInteger(item.uid) || !item.name || !Number.isInteger(item.credits) || item.credits < 0) {
        res.status(400).json({ ok: false, message: 'Valid WebShopItem payload required.' });
        return;
      }
      if (item.openMuPackageSequence !== undefined) {
        if (!Number.isInteger(item.openMuPackageSequence) || item.openMuPackageSequence < 0) {
          throw new TransactionDomainError('INVALID_OPENMU_MAPPING', 422, 'OpenMU package sequence must be a non-negative integer.');
        }
        const catalog = await getOpenMuCashShopCatalog();
        const offer = catalog.find((entry) => entry.packageSequence === item.openMuPackageSequence);
        if (!offer) {
          throw new TransactionDomainError('INVALID_OPENMU_MAPPING', 422, 'The OpenMU package is not enabled in the authoritative catalog.');
        }
        if (offer.isBundle) {
          if (item.openMuPriceSequence !== undefined && item.openMuPriceSequence !== null) {
            throw new TransactionDomainError('INVALID_OPENMU_MAPPING', 422, 'An OpenMU bundle must not specify a price sequence.');
          }
          item.openMuPriceSequence = null;
        } else {
          if (!Number.isInteger(item.openMuPriceSequence)) {
            throw new TransactionDomainError('INVALID_OPENMU_MAPPING', 422, 'A non-bundle OpenMU package requires a price sequence.');
          }
          const product = offer.products.find((entry) => entry.priceSequence === item.openMuPriceSequence);
          if (!product || product.itemGroup !== item.type || product.itemNumber !== item.id) {
            throw new TransactionDomainError('INVALID_OPENMU_MAPPING', 422, 'The OpenMU product does not match this WebShop item type and number.');
          }
        }
      } else {
        delete item.openMuPriceSequence;
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
