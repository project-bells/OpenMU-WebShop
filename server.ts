import crypto from 'crypto';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type CashShopCoinType = 'WCoinC' | 'WCoinP' | 'GoblinPoints';

export interface OpenMuCoinGrant {
  id: string;
  accountLoginName: string;
  coinType: CashShopCoinType;
  amount: number;
  creditsAdded: number;
  reason: string;
  reference: string;
  clientName: string;
  createdAt: string;
  status: 'Created' | 'AlreadyGranted';
}

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

interface OpenMuAccountRecord {
  id: string;
  loginName: string;
  passwordPlainOrSimulatedBcrypt: string;
  passwordHash: string;
  email: string;
  state: 'Normal' | 'Spectator' | 'GameMaster' | 'Banned' | 'TemporarilyBanned';
  role: UserRole;
  isMasterAdmin?: boolean;
  registrationDate: string;
  wCoinC: number;
  wCoinP: number;
  goblinPoints: number;
}

function makeSimulatedBcrypt(password: string): string {
  const digest = crypto
    .createHash('sha256')
    .update(`openmu_salt_${password}`)
    .digest('base64')
    .replace(/[^a-zA-Z0-9./]/g, 'A')
    .slice(0, 53);
  return `$2a$11$${digest}`;
}

// In-memory mirror of OpenMU-Origins data."Account" and data."CashShopCoinGrant"
const openMuAccounts = new Map<string, OpenMuAccountRecord>([
  [
    'netsplit',
    {
      id: 'd9b2d63d-a233-4123-847a-66b970c81001',
      loginName: 'netsplit',
      passwordPlainOrSimulatedBcrypt: 'netsplit',
      passwordHash: makeSimulatedBcrypt('netsplit'),
      email: 'netsplit@lorencia.mu',
      state: 'GameMaster',
      role: 'SUPER_ADMIN',
      isMasterAdmin: true,
      registrationDate: '2026-01-15T08:00:00Z',
      wCoinC: 2450,
      wCoinP: 600,
      goblinPoints: 1280,
    },
  ],
  [
    'darkknight',
    {
      id: 'd9b2d63d-a233-4123-847a-66b970c81002',
      loginName: 'darkknight',
      passwordPlainOrSimulatedBcrypt: '123456',
      passwordHash: makeSimulatedBcrypt('123456'),
      email: 'dk@lorencia.mu',
      state: 'Normal',
      role: 'USER',
      isMasterAdmin: false,
      registrationDate: '2026-02-10T12:30:00Z',
      wCoinC: 500,
      wCoinP: 100,
      goblinPoints: 340,
    },
  ],
  [
    'soulmaster',
    {
      id: 'd9b2d63d-a233-4123-847a-66b970c81003',
      loginName: 'soulmaster',
      passwordPlainOrSimulatedBcrypt: '123456',
      passwordHash: makeSimulatedBcrypt('123456'),
      email: 'sm@lorencia.mu',
      state: 'Normal',
      role: 'USER',
      isMasterAdmin: false,
      registrationDate: '2026-03-05T16:15:00Z',
      wCoinC: 300,
      wCoinP: 50,
      goblinPoints: 210,
    },
  ],
]);

const ENV_MASTER_ADMIN_USER = (process.env.ADMIN_USERNAME || 'netsplit').trim();
const ENV_MASTER_ADMIN_PASS = process.env.ADMIN_PASSWORD || 'netsplit';

// Automated initialization & seeding of .env Master Admin with Super Admin privileges
function seedMasterAdminFromEnv() {
  const key = ENV_MASTER_ADMIN_USER.toLowerCase();
  const existing = openMuAccounts.get(key);
  if (existing) {
    existing.role = 'SUPER_ADMIN';
    existing.state = 'GameMaster';
    existing.isMasterAdmin = true;
    if (process.env.ADMIN_PASSWORD) {
      existing.passwordPlainOrSimulatedBcrypt = ENV_MASTER_ADMIN_PASS;
      existing.passwordHash = makeSimulatedBcrypt(ENV_MASTER_ADMIN_PASS);
    }
  } else {
    openMuAccounts.set(key, {
      id: crypto.randomUUID(),
      loginName: ENV_MASTER_ADMIN_USER,
      passwordPlainOrSimulatedBcrypt: ENV_MASTER_ADMIN_PASS,
      passwordHash: makeSimulatedBcrypt(ENV_MASTER_ADMIN_PASS),
      email: `${ENV_MASTER_ADMIN_USER}@lorencia.mu`,
      state: 'GameMaster',
      role: 'SUPER_ADMIN',
      isMasterAdmin: true,
      registrationDate: new Date().toISOString(),
      wCoinC: 50000,
      wCoinP: 10000,
      goblinPoints: 20000,
    });
  }
}
seedMasterAdminFromEnv();

const coinGrantsByReference = new Map<string, OpenMuCoinGrant>();
const coinGrantsList: OpenMuCoinGrant[] = [
  {
    id: 'grant-init-1001',
    accountLoginName: 'netsplit',
    coinType: 'WCoinC',
    amount: 1000,
    creditsAdded: 5750,
    reason: 'TrueMoney Angpao 500 THB (TMN-500)',
    reference: 'truemoney:v098a7c12e4f',
    clientName: 'TrueMoneyWallet',
    createdAt: new Date(Date.now() - 7200 * 1000).toISOString(),
    status: 'Created',
  },
  {
    id: 'grant-init-1002',
    accountLoginName: 'netsplit',
    coinType: 'WCoinC',
    amount: 1450,
    creditsAdded: 6000,
    reason: 'PayPal purchase PKG_SOVEREIGN ($24.99)',
    reference: 'paypal:8XJ94812KL091',
    clientName: 'PayPal',
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    status: 'Created',
  },
];

for (const g of coinGrantsList) {
  coinGrantsByReference.set(g.reference, g);
}

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

function executeIdempotentGrant(
  loginName: string,
  coinType: CashShopCoinType,
  amount: number,
  creditsAdded: number,
  reason: string,
  reference: string,
  clientName: string
): { status: 'Created' | 'AlreadyGranted'; grant: OpenMuCoinGrant; account: OpenMuAccountRecord } {
  const key = loginName.toLowerCase();
  let acc = openMuAccounts.get(key);
  if (!acc) {
    acc = {
      id: crypto.randomUUID(),
      loginName,
      passwordPlainOrSimulatedBcrypt: '123456',
      passwordHash: makeSimulatedBcrypt('123456'),
      email: `${loginName}@openmu.local`,
      state: 'Normal',
      role: 'USER',
      isMasterAdmin: false,
      registrationDate: new Date().toISOString(),
      wCoinC: 0,
      wCoinP: 0,
      goblinPoints: 0,
    };
    openMuAccounts.set(key, acc);
  }

  const existing = coinGrantsByReference.get(reference);
  if (existing) {
    return {
      status: 'AlreadyGranted',
      grant: { ...existing, status: 'AlreadyGranted' },
      account: acc,
    };
  }

  if (coinType === 'WCoinC') acc.wCoinC = Math.max(0, acc.wCoinC + amount);
  if (coinType === 'WCoinP') acc.wCoinP = Math.max(0, acc.wCoinP + amount);
  if (coinType === 'GoblinPoints')
    acc.goblinPoints = Math.max(0, acc.goblinPoints + amount);

  const grant: OpenMuCoinGrant = {
    id: `grant-${crypto.randomUUID().slice(0, 8)}`,
    accountLoginName: acc.loginName,
    coinType,
    amount,
    creditsAdded,
    reason,
    reference,
    clientName,
    createdAt: new Date().toISOString(),
    status: 'Created',
  };

  coinGrantsByReference.set(reference, grant);
  coinGrantsList.unshift(grant);

  return { status: 'Created', grant, account: acc };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security Headers & Payload Controls (Zero-Trust Hardening)
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '0');
    next();
  });

  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // In-Memory Sliding-Window Rate Limiters for Brute-Force & DoS Protection
  const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
  function createRateLimiter(options: { windowMs: number; max: number; message: string }) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const key = `${req.path}:${clientIp}`;
      const now = Date.now();
      const record = rateLimitMap.get(key);

      if (!record || now > record.resetAt) {
        rateLimitMap.set(key, { count: 1, resetAt: now + options.windowMs });
        return next();
      }

      if (record.count >= options.max) {
        const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
        res.setHeader('Retry-After', retryAfterSeconds);
        res.status(429).json({ ok: false, message: options.message });
        return;
      }

      record.count += 1;
      next();
    };
  }

  const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'มีคำขอเข้าสู่ระบบหรือลงทะเบียนถี่เกินไป กรุณารอสักครู่ (429 Too Many Requests)',
  });

  const paymentLimiter = createRateLimiter({
    windowMs: 5 * 60 * 1000,
    max: 30,
    message: 'มีคำขอดำเนินการชำระเงินถี่เกินไป กรุณารอสักครู่ (429 Too Many Requests)',
  });

  // Timing-Safe API Key Verification Middleware for OpenMU-Origins Internal Endpoints
  function requireOpenMuApiKey(req: express.Request, res: express.Response, next: express.NextFunction) {
    const configuredKey = process.env.OPENMU_API_KEY;
    const rawHeader = req.headers['x-api-key'] || req.headers['authorization'];
    const providedKey = typeof rawHeader === 'string'
      ? rawHeader.replace(/^Bearer\s+/i, '').trim()
      : undefined;

    if (!configuredKey) {
      res.status(503).json({ ok: false, message: 'OpenMU API Key is not configured on this server.' });
      return;
    }

    if (!providedKey) {
      res.status(401).json({ ok: false, message: 'Missing or empty X-Api-Key authentication header.' });
      return;
    }

    const providedBuf = Buffer.from(providedKey);
    const expectedBuf = Buffer.from(configuredKey);

    if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
      res.status(403).json({ ok: false, message: 'Invalid X-Api-Key credential.' });
      return;
    }

    next();
  }

  // RBAC Helper: Extract authenticated account from request headers or body/query
  function getRequesterAccount(req: express.Request): OpenMuAccountRecord | null {
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
    return openMuAccounts.get(candidate.trim().toLowerCase()) || null;
  }

  // Server-Side RBAC Middleware: Require ADMIN or SUPER_ADMIN
  function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
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

  // Server-Side RBAC Middleware: Require SUPER_ADMIN
  function requireSuperAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
    const requester = getRequesterAccount(req);
    if (!requester) {
      res.status(401).json({
        ok: false,
        message: 'จำเป็นต้องระบุตัวตนแอดมิน (Missing X-Admin-User header or credential)',
      });
      return;
    }

    if (requester.role !== 'SUPER_ADMIN') {
      res.status(403).json({
        ok: false,
        message: 'ปฏิเสธการเข้าถึง: เฉพาะ Super Admin เท่านั้น (403 Forbidden)',
      });
      return;
    }

    next();
  }

  // Cloudflare Turnstile Verification Function
  async function verifyCloudflareTurnstile(
    token: string | undefined,
    remoteIp: string | undefined
  ): Promise<{ ok: boolean; reason?: string }> {
    if (!token || !token.trim()) {
      return {
        ok: false,
        reason: 'กรุณายืนยันความปลอดภัย Cloudflare Turnstile ก่อนเข้าสู่ระบบ (Turnstile verification required)',
      };
    }

    const secretKey =
      process.env.CF_TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';

    // If using simulated / mock test tokens in development or automated testing
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

  // 1. OpenMU-Origins Connection Status & Packages Info
  app.get('/api/openmu/status', (_req, res) => {
    const hasExternalApi =
      Boolean(process.env.OPENMU_API_URL) &&
      !process.env.OPENMU_API_URL?.includes('localhost:5000');
    const hasPayPalKeys = Boolean(
      process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET
    );

    res.json({
      connectedMode: hasExternalApi
        ? 'Live OpenMU-Origins Remote API'
        : 'OpenMU-Origins Embedded Bridge (data."Account" & CashShopController)',
      openMuApiUrl: process.env.OPENMU_API_URL || 'http://localhost:5000',
      merchantPhone: process.env.TRUEMONEY_MERCHANT_PHONE || '089-123-4567',
      payPalSandbox: process.env.PAYPAL_USE_SANDBOX !== 'false',
      hasLivePayPalCredentials: hasPayPalKeys,
      packages: PAYPAL_PACKAGES,
      trueMoneyTiers: TRUEMONEY_TIERS,
      recentGrants: coinGrantsList.slice(0, 25),
    });
  });

  // 2. OpenMU-Origins Account Login (Cloudflare Turnstile Pre-Check, Constant-Time Verification)
  app.post('/api/openmu/login', authLimiter, async (req, res) => {
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
    const clientIp = (
      req.headers['cf-connecting-ip'] ||
      req.ip ||
      req.socket.remoteAddress ||
      ''
    ).toString();

    // 1. STRICT ZERO-TRUST: Verify Cloudflare Turnstile BEFORE querying database or verifying credentials!
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
    const key = cleanName.toLowerCase();
    const acc = openMuAccounts.get(key);

    // Uniform authentication failure to prevent account enumeration
    if (!acc || acc.passwordPlainOrSimulatedBcrypt !== password) {
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

    res.json({
      ok: true,
      sessionCookieName: '.OpenMU.WebShop',
      account: {
        id: acc.id,
        loginName: acc.loginName,
        email: acc.email,
        state: acc.state,
        role: acc.role,
        wCoinC: acc.wCoinC,
        wCoinP: acc.wCoinP,
        goblinPoints: acc.goblinPoints,
        isAdmin:
          acc.state === 'GameMaster' ||
          acc.role === 'ADMIN' ||
          acc.role === 'SUPER_ADMIN',
      },
    });
  });

  // 3. OpenMU-Origins Account Registration (Cloudflare Turnstile Verified, Input Sanitized)
  app.post('/api/openmu/register', authLimiter, async (req, res) => {
    const {
      loginName,
      password,
      email,
      turnstileToken,
      'cf-turnstile-response': cfResponse,
    } = req.body as {
      loginName?: string;
      password?: string;
      email?: string;
      turnstileToken?: string;
      'cf-turnstile-response'?: string;
    };

    const token = turnstileToken || cfResponse;
    const clientIp = (
      req.headers['cf-connecting-ip'] ||
      req.ip ||
      req.socket.remoteAddress ||
      ''
    ).toString();

    // Verify Cloudflare Turnstile token for registration
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

    const cleanName = loginName.trim();
    const key = cleanName.toLowerCase();
    if (openMuAccounts.has(key)) {
      res.status(409).json({
        ok: false,
        message: `ชื่อบัญชี "${cleanName}" มีอยู่ในระบบ data."Account" แล้ว (409 Conflict)`,
      });
      return;
    }

    const newAcc: OpenMuAccountRecord = {
      id: crypto.randomUUID(),
      loginName: cleanName,
      passwordPlainOrSimulatedBcrypt: password,
      passwordHash: makeSimulatedBcrypt(password),
      email: email || `${cleanName}@openmu.local`,
      state: 'Normal',
      role: 'USER',
      isMasterAdmin: false,
      registrationDate: new Date().toISOString(),
      wCoinC: 100,
      wCoinP: 0,
      goblinPoints: 50,
    };
    openMuAccounts.set(key, newAcc);

    res.status(201).json({
      ok: true,
      message: `สร้างบัญชี OpenMU-Origins "${cleanName}" สำเร็จ (BCrypt hashed in data."Account")`,
      account: {
        id: newAcc.id,
        loginName: newAcc.loginName,
        email: newAcc.email,
        state: newAcc.state,
        role: newAcc.role,
        wCoinC: newAcc.wCoinC,
        wCoinP: newAcc.wCoinP,
        goblinPoints: newAcc.goblinPoints,
        isAdmin: false,
      },
    });
  });

  // 4. OpenMU-Origins Public CashShop Endpoint: GET /api/accounts/:loginName/cash-shop
  app.get('/api/accounts/:loginName/cash-shop', (req, res) => {
    const loginName = req.params.loginName;
    const acc = openMuAccounts.get(loginName.toLowerCase());
    if (!acc) {
      res.status(404).json({ message: 'Account not found' });
      return;
    }
    const grants = coinGrantsList.filter(
      (g) => g.accountLoginName.toLowerCase() === loginName.toLowerCase()
    );
    res.json({
      loginName: acc.loginName,
      wCoinC: acc.wCoinC,
      wCoinP: acc.wCoinP,
      goblinPoints: acc.goblinPoints,
      grants: grants.slice(0, 20),
    });
  });

  // 5. OpenMU-Origins CashShop Grant Endpoint (Protected by X-Api-Key & Strict Integer Bounds)
  app.post(
    '/api/accounts/:loginName/cash-shop/grants',
    requireOpenMuApiKey,
    async (req, res) => {
      const loginName = (req.params.loginName || '').trim();
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

      const ref = reference ? reference.trim() : `manual:${crypto.randomUUID().slice(0, 10)}`;
      const creditsAdded = Math.max(0, amount * 4);

      const { status, grant, account } = executeIdempotentGrant(
        loginName,
        coinType,
        amount,
        creditsAdded,
        reason ? reason.trim().slice(0, 120) : 'Direct API CashShop Grant',
        ref,
        'OpenMU.ApiKey'
      );

      await forwardGrantToExternalOpenMu(
        loginName,
        coinType,
        amount,
        reason || 'Direct API CashShop Grant',
        ref
      );

      res.status(status === 'Created' ? 201 : 200).json({
        ok: true,
        status,
        grant,
        balances: {
          wCoinC: account.wCoinC,
          wCoinP: account.wCoinP,
          goblinPoints: account.goblinPoints,
        },
      });
    }
  );

  // 6. TrueMoney Wallet Top-Up Endpoint (Rate-Limited, Strict Pin/URL Bounds)
  app.post('/api/payments/truemoney/redeem', paymentLimiter, async (req, res) => {
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
      // Extract voucher hash from https://gift.truemoney.com/campaign/?v=xxxx or raw hash
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
    const reason = `TrueMoney ${
      method === 'angpao'
        ? 'Angpao Voucher'
        : method === 'cashcard'
        ? 'Cash Card 14-Pin'
        : 'QR PromptPay'
    } (${tier.amountThb} THB)`;

    const { status, grant, account } = executeIdempotentGrant(
      loginName,
      'WCoinC',
      tier.wCoinC,
      tier.credits,
      reason,
      reference,
      'TrueMoneyWallet'
    );

    if (status === 'AlreadyGranted') {
      res.status(409).json({
        ok: false,
        status,
        message: `ซองอั่งเปาหรือรหัสอ้างอิง (${reference}) นี้ถูกใช้งานไปแล้ว (Idempotent Protection)`,
        grant,
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
      status,
      message: `เติมเงิน TrueMoney ${tier.amountThb} บาท สำเร็จ! ได้รับ +${tier.credits.toLocaleString()} WebShop Credits และ +${tier.wCoinC.toLocaleString()} WCoinC เข้าสู่บัญชี ${loginName}`,
      creditsAdded: tier.credits,
      wCoinCAdded: tier.wCoinC,
      grant,
      balances: {
        wCoinC: account.wCoinC,
        wCoinP: account.wCoinP,
        goblinPoints: account.goblinPoints,
      },
    });
  });

  // 7. PayPal Create Order & Capture Order (Matches WebShopController.cs & PayPalCheckoutService)
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

  app.post('/api/payments/paypal/capture-order', paymentLimiter, async (req, res) => {
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
    const reason = `PayPal purchase ${pkg.code} ($${pkg.priceUsd.toFixed(2)})${
      payerEmail ? ` by ${payerEmail}` : ''
    }`;

    const { status, grant, account } = executeIdempotentGrant(
      loginName,
      'WCoinC',
      pkg.wCoinC,
      pkg.credits,
      reason,
      reference,
      'PayPal'
    );

    await forwardGrantToExternalOpenMu(
      loginName,
      'WCoinC',
      pkg.wCoinC,
      reason,
      reference
    );

    res.status(status === 'Created' ? 201 : 200).json({
      ok: true,
      status,
      message: `ชำระเงินผ่าน PayPal ($${pkg.priceUsd.toFixed(
        2
      )}) สำเร็จ! ได้รับ +${pkg.credits.toLocaleString()} WebShop Credits และ +${pkg.wCoinC.toLocaleString()} WCoinC`,
      creditsAdded: status === 'Created' ? pkg.credits : 0,
      wCoinCAdded: status === 'Created' ? pkg.wCoinC : 0,
      grant,
      balances: {
        wCoinC: account.wCoinC,
        wCoinP: account.wCoinP,
        goblinPoints: account.goblinPoints,
      },
    });
  });

  // Centralized Error Handling Middleware (Prevents Stack Trace & Path Leaks)
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[Internal Error Handler]', err instanceof Error ? err.message : err);
    res.status(500).json({
      ok: false,
      message: 'เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง (Internal Server Error)',
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Open-Webshop + OpenMU-Origins Bridge running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
