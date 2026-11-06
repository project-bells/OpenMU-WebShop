import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';

const SESSION_COOKIE = '__Host-openmu_shop';
const SESSION_LIFETIME_SECONDS = 60 * 60;

interface SessionPayload {
  loginName: string;
  admin: boolean;
  csrf: string;
  expiresAt: number;
}

export interface AuthenticatedRequest extends Request {
  session?: SessionPayload;
}

function secret(): string {
  const value = process.env.SESSION_SECRET ?? '';
  if (value.length < 64) throw new Error('SESSION_SECRET must contain at least 64 characters.');
  return value;
}

function signature(payload: string): string {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createSession(loginName: string, admin: boolean): { cookie: string; csrfToken: string } {
  const session: SessionPayload = {
    loginName,
    admin,
    csrf: crypto.randomBytes(24).toString('base64url'),
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_LIFETIME_SECONDS,
  };
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return {
    cookie: `${SESSION_COOKIE}=${payload}.${signature(payload)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_LIFETIME_SECONDS}`,
    csrfToken: session.csrf,
  };
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function readSession(request: Request): SessionPayload | null {
  const cookie = request.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  if (!cookie) return null;
  const token = cookie.slice(SESSION_COOKIE.length + 1);
  const [payload, providedSignature] = token.split('.');
  if (!payload || !providedSignature) return null;
  const expected = signature(payload);
  const a = Buffer.from(providedSignature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SessionPayload;
    if (!value.loginName || !value.csrf || value.expiresAt <= Math.floor(Date.now() / 1000)) return null;
    return value;
  } catch { return null; }
}

export function requireSession(request: AuthenticatedRequest, response: Response, next: NextFunction): void {
  const session = readSession(request);
  if (!session) { response.status(401).json({ ok: false, message: 'Authentication required.' }); return; }
  request.session = session;
  next();
}

export function requireCsrf(request: AuthenticatedRequest, response: Response, next: NextFunction): void {
  const expectedOrigin = process.env.PUBLIC_ORIGIN;
  if (!expectedOrigin || request.headers.origin !== expectedOrigin) {
    response.status(403).json({ ok: false, message: 'Invalid request origin.' }); return;
  }
  const token = request.headers['x-csrf-token'];
  if (!request.session || typeof token !== 'string') {
    response.status(403).json({ ok: false, message: 'CSRF verification failed.' }); return;
  }
  const a = Buffer.from(token);
  const b = Buffer.from(request.session.csrf);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    response.status(403).json({ ok: false, message: 'CSRF verification failed.' }); return;
  }
  next();
}

export function requireAdminSession(request: AuthenticatedRequest, response: Response, next: NextFunction): void {
  if (!request.session?.admin) { response.status(403).json({ ok: false, message: 'Administrator access required.' }); return; }
  next();
}

export function validateProductionConfiguration(): void {
  const required = ['OPENMU_DATABASE_URL', 'OPENMU_API_URL', 'OPENMU_API_KEY', 'PUBLIC_ORIGIN', 'SESSION_SECRET'];
  const missing = required.filter((name) => !(process.env[name] ?? '').trim());
  if (missing.length) throw new Error(`Missing required settings: ${missing.join(', ')}`);
  secret();
  if ((process.env.OPENMU_API_KEY ?? '').length < 32) throw new Error('OPENMU_API_KEY must contain at least 32 characters.');
  new URL(process.env.OPENMU_API_URL!);
  new URL(process.env.OPENMU_DATABASE_URL!);
  const origin = new URL(process.env.PUBLIC_ORIGIN!);
  if (process.env.NODE_ENV === 'production' && origin.protocol !== 'https:') throw new Error('PUBLIC_ORIGIN must use HTTPS in production.');
  if (process.env.PAYMENTS_ENABLED === 'true' && !process.env.CF_TURNSTILE_SECRET_KEY) throw new Error('CF_TURNSTILE_SECRET_KEY is required when payments are enabled.');
  if (process.env.PAYMENTS_ENABLED === 'true' && process.env.PAYPAL_CLIENT_ID && !process.env.PAYPAL_WEBHOOK_ID) throw new Error('PAYPAL_WEBHOOK_ID is required when PayPal is enabled.');
  if (process.env.PAYPAL_USE_SANDBOX === 'false' && process.env.PAYPAL_LIVE_ENABLED !== 'true') throw new Error('Set PAYPAL_LIVE_ENABLED=true only after completing the sandbox activation gates.');
  if (process.env.TRUEMONEY_ENABLED === 'true') throw new Error('TrueMoney must remain disabled until an authenticated provider adapter is implemented.');
  if (process.env.CARDS_ENABLED === 'true') throw new Error('Cards must remain disabled until a PCI-compliant hosted-fields adapter is implemented.');
}
