import type express from 'express';
import { incrementRateWindow } from './redisCache';

export function extractClientIp(req: express.Request): string {
  // Express derives req.ip from the explicitly configured trust-proxy setting.
  // Never trust forwarding headers directly; clients can forge them.
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

      // IP is intentionally the only unauthenticated key. User-controlled account
      // names would let an attacker evade the limiter by changing the name.

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
