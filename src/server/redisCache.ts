import Redis from 'ioredis';

interface MemoryCacheEntry {
  value: string;
  expiresAt: number;
}

const memoryStore = new Map<string, MemoryCacheEntry>();
const REDIS_URL = (process.env.REDIS_URL || '').trim();
export const CATALOG_CACHE_TTL_SECONDS = Math.max(
  30,
  Number(process.env.REDIS_CATALOG_TTL_SECONDS) || 300
);

let redisClient: Redis | null = null;
let redisReady = false;

if (REDIS_URL) {
  try {
    redisClient = new Redis(REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 2500,
      retryStrategy(times) {
        if (times > 5) return 10_000;
        return Math.min(times * 400, 3000);
      },
    });

    redisClient.on('ready', () => {
      redisReady = true;
      console.info('[RedisCache] Connected to Redis instance');
    });

    redisClient.on('error', (err) => {
      if (redisReady) {
        console.warn('[RedisCache] Redis degraded, falling back to memory:', err.message);
      }
      redisReady = false;
    });

    redisClient.on('end', () => {
      redisReady = false;
    });

    redisClient.connect().catch((err: Error) => {
      console.warn(
        `[RedisCache] Initial Redis connection unavailable (${err.message}); serving from in-memory L1 cache.`
      );
      redisReady = false;
    });
  } catch (err) {
    console.warn('[RedisCache] Failed to initialize ioredis client:', err);
    redisClient = null;
    redisReady = false;
  }
}

function purgeExpiredMemoryEntries(): void {
  if (memoryStore.size < 2000) return;
  const now = Date.now();
  for (const [k, entry] of memoryStore.entries()) {
    if (entry.expiresAt <= now) {
      memoryStore.delete(k);
    }
  }
}

export function getCacheBackendStatus(): {
  backend: 'redis' | 'memory-l1';
  redisConnected: boolean;
  ttlSeconds: number;
} {
  return {
    backend: redisClient && redisReady ? 'redis' : 'memory-l1',
    redisConnected: Boolean(redisClient && redisReady),
    ttlSeconds: CATALOG_CACHE_TTL_SECONDS,
  };
}

export async function cacheGetJson<T>(key: string): Promise<T | null> {
  if (redisClient && redisReady) {
    try {
      const raw = await redisClient.get(key);
      if (raw !== null) {
        return JSON.parse(raw) as T;
      }
      return null;
    } catch {
      // Fall through to L1 memory cache on transient Redis error
    }
  }

  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  try {
    return JSON.parse(entry.value) as T;
  } catch {
    memoryStore.delete(key);
    return null;
  }
}

export async function cacheSetJson<T>(
  key: string,
  payload: T,
  ttlSeconds: number = CATALOG_CACHE_TTL_SECONDS
): Promise<void> {
  const serialized = JSON.stringify(payload);
  purgeExpiredMemoryEntries();
  memoryStore.set(key, {
    value: serialized,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });

  if (redisClient && redisReady) {
    try {
      await redisClient.set(key, serialized, 'EX', ttlSeconds);
    } catch {
      // L1 memory already populated
    }
  }
}

export async function cacheDeleteKeys(keys: string[]): Promise<void> {
  for (const k of keys) {
    memoryStore.delete(k);
  }
  if (redisClient && redisReady && keys.length > 0) {
    try {
      await redisClient.del(...keys);
    } catch {
      // Ignore transient Redis error
    }
  }
}

export type IdempotencyClaimResult =
  | { state: 'CLAIMED' }
  | { state: 'IN_PROGRESS' }
  | { state: 'COMPLETED'; cachedResponse: unknown };

/**
 * Atomically claims an idempotency key using Redis `SET key value NX EX ttl`
 * (with L1 memory atomic fallback) to block concurrent replay attacks.
 */
export async function claimIdempotencyKey(
  scope: string,
  idempotencyKey: string,
  ttlSeconds: number = 86_400
): Promise<IdempotencyClaimResult> {
  const fullKey = `webshop:idem:${scope}:${idempotencyKey}`;
  const inProgressPayload = JSON.stringify({ status: 'IN_PROGRESS', ts: Date.now() });

  if (redisClient && redisReady) {
    try {
      const setRes = await redisClient.set(
        fullKey,
        inProgressPayload,
        'EX',
        ttlSeconds,
        'NX'
      );
      if (setRes === 'OK') {
        memoryStore.set(fullKey, {
          value: inProgressPayload,
          expiresAt: Date.now() + ttlSeconds * 1000,
        });
        return { state: 'CLAIMED' };
      }
      const existingRaw = await redisClient.get(fullKey);
      if (existingRaw) {
        const parsed = JSON.parse(existingRaw) as {
          status: string;
          response?: unknown;
        };
        if (parsed.status === 'COMPLETED') {
          return { state: 'COMPLETED', cachedResponse: parsed.response };
        }
      }
      return { state: 'IN_PROGRESS' };
    } catch {
      // Fall back to L1 memory lock
    }
  }

  const now = Date.now();
  const existing = memoryStore.get(fullKey);
  if (existing && existing.expiresAt > now) {
    try {
      const parsed = JSON.parse(existing.value) as {
        status: string;
        response?: unknown;
      };
      if (parsed.status === 'COMPLETED') {
        return { state: 'COMPLETED', cachedResponse: parsed.response };
      }
    } catch {
      // Treat malformed entry as in-progress
    }
    return { state: 'IN_PROGRESS' };
  }

  memoryStore.set(fullKey, {
    value: inProgressPayload,
    expiresAt: now + ttlSeconds * 1000,
  });
  return { state: 'CLAIMED' };
}

export async function finalizeIdempotencyKey(
  scope: string,
  idempotencyKey: string,
  responsePayload: unknown,
  ttlSeconds: number = 86_400
): Promise<void> {
  const fullKey = `webshop:idem:${scope}:${idempotencyKey}`;
  const completedPayload = JSON.stringify({
    status: 'COMPLETED',
    ts: Date.now(),
    response: responsePayload,
  });

  memoryStore.set(fullKey, {
    value: completedPayload,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });

  if (redisClient && redisReady) {
    try {
      await redisClient.set(fullKey, completedPayload, 'EX', ttlSeconds);
    } catch {
      // L1 memory already updated
    }
  }
}

export async function releaseIdempotencyKey(
  scope: string,
  idempotencyKey: string
): Promise<void> {
  const fullKey = `webshop:idem:${scope}:${idempotencyKey}`;
  memoryStore.delete(fullKey);
  if (redisClient && redisReady) {
    try {
      await redisClient.del(fullKey);
    } catch {
      // Ignore
    }
  }
}

/**
 * Atomic fixed-window counter for distributed Rate Limiting across containers.
 */
export async function incrementRateWindow(
  bucketKey: string,
  windowMs: number
): Promise<{ count: number; resetAtMs: number }> {
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const fullKey = `webshop:rl:${bucketKey}`;

  if (redisClient && redisReady) {
    try {
      const multi = redisClient.multi();
      multi.incr(fullKey);
      multi.pttl(fullKey);
      const results = await multi.exec();
      const count = Number(results?.[0]?.[1] ?? 1);
      let pttl = Number(results?.[1]?.[1] ?? -1);
      if (count === 1 || pttl < 0) {
        await redisClient.pexpire(fullKey, windowMs);
        pttl = windowMs;
      }
      return { count, resetAtMs: Date.now() + pttl };
    } catch {
      // Fall through to memory counter
    }
  }

  const now = Date.now();
  const existing = memoryStore.get(fullKey);
  if (!existing || now >= existing.expiresAt) {
    const expiresAt = now + windowSec * 1000;
    memoryStore.set(fullKey, { value: '1', expiresAt });
    return { count: 1, resetAtMs: expiresAt };
  }
  const nextCount = (Number(existing.value) || 0) + 1;
  existing.value = String(nextCount);
  return { count: nextCount, resetAtMs: existing.expiresAt };
}

export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
    } catch {
      redisClient.disconnect();
    }
  }
}
