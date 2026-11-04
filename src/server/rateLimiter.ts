import type express from 'express';
import { incrementRateWindow } from './redisCache';

export function extractClientIp(req: express.Request): string {
  const cfIp = req.headers['cf-connecting-ip'];
  if (typeof cfIp === 'string' && cfIp.trim()) {
    return cfIp.trim();
  }
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return (req.ip || req.socket.remoteAddress || '0.0.0.0').replace(/^::ffff:/, '');
}

export interface RateLimiterConfig {
  prefix: string;
  windowMs: number;
  max: number;
  message: string;
  includeAccountKey?: boolean;
}

/**
 * Distributed Redis-backed (with automatic in-memory fallback) rate limiter middleware.
 * Protects purchase, authentication, payment webhook, and general API routes against spam/floods.
 */
export function createDistributedRateLimiter(config: RateLimiterConfig): express.RequestHandler {
  return async (req, res, next) => {
    try {
      const ip = extractClientIp(req);
      let compositeSuffix = ip;

      if (config.includeAccountKey) {
        const bodyUser =
          req.body && typeof req.body === 'object'
            ? (req.body.accountId || req.body.loginName || req.body.username || '')
            : '';
        const headerUser = req.headers['x-username'] || '';
        const acct = String(bodyUser || headerUser || '')
          .trim()
          .toLowerCase()
          .slice(0, 20);
        if (acct) {
          compositeSuffix = `${ip}:${acct}`;
        }
      }

      const { count, resetAtMs } = await incrementRateWindow(
        `${config.prefix}:${compositeSuffix}`,
        config.windowMs
      );

      const remaining = Math.max(0, config.max - count);
      const resetEpochSec = Math.ceil(resetAtMs / 1000);

      res.setHeader('X-RateLimit-Limit', String(config.max));
      res.setHeader('X-RateLimit-Remaining', String(remaining));
      res.setHeader('X-RateLimit-Reset', String(resetEpochSec));

      if (count > config.max) {
        const retryAfterSeconds = Math.max(1, Math.ceil((resetAtMs - Date.now()) / 1000));
        res.setHeader('Retry-After', String(retryAfterSeconds));
        res.status(429).json({
          ok: false,
          code: 'RATE_LIMIT_EXCEEDED',
          message: config.message,
          retryAfterSeconds,
        });
        return;
      }

      next();
    } catch (err) {
      console.error('[RateLimiter] Unexpected error:', err);
      next();
    }
  };
}
