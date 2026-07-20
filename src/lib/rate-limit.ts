import 'server-only';

import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

const rateLogger = logger.createScoped('rate-limit');

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  maxAttempts?: number;
  windowMs?: number;
  lockoutMs?: number;
}

const DEFAULT_CONFIG: Required<RateLimitConfig> = {
  maxAttempts: 5,
  windowMs: 60 * 1000,
  lockoutMs: 15 * 60 * 1000,
};

const store = new Map<string, RateLimitEntry>();

let redisClient: { incr: (key: string) => Promise<number>; expire: (key: string, seconds: number) => Promise<number>; del: (key: string) => Promise<number> } | null = null;
let redisAvailable = false;

async function getRedisClient() {
  if (redisClient || redisAvailable) return redisClient;
  if (!env.REDIS_URL) return null;

  try {
    const { createClient } = await import('redis');
    const client = createClient({ url: env.REDIS_URL });
    client.on('error', (err: Error) => {
      rateLogger.warn('Redis error, falling back to in-memory', { error: err.message });
      redisAvailable = false;
    });
    await client.connect();
    redisClient = {
      incr: (key: string) => client.incr(key),
      expire: (key: string, seconds: number) => client.expire(key, seconds),
      del: (key: string) => client.del(key),
    };
    redisAvailable = true;
    rateLogger.info('Redis connected for rate limiting');
    return redisClient;
  } catch (err) {
    rateLogger.warn('Redis unavailable, using in-memory', { error: String(err) });
    redisAvailable = false;
    return null;
  }
}

export async function checkRateLimit(
  identifier: string,
  namespace: string = 'login',
  config: RateLimitConfig = {},
): Promise<{ allowed: boolean; retryAfterMs: number; remaining: number }> {
  const { maxAttempts, windowMs, lockoutMs } = { ...DEFAULT_CONFIG, ...config };
  const now = Date.now();
  const key = `${namespace}:${identifier}`;

  const redis = await getRedisClient();
  if (redis) {
    try {
      const lockoutKey = `${key}:lockout`;
      const lockoutTtl = await redis.incr(lockoutKey);
      if (lockoutTtl === 1) {
        await redis.expire(lockoutKey, Math.ceil(lockoutMs / 1000));
      }
      if (lockoutTtl > 1) {
        return { allowed: false, retryAfterMs: lockoutMs, remaining: 0 };
      }

      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, Math.ceil(windowMs / 1000));
      }
      if (count >= maxAttempts) {
        const lockoutCount = await redis.incr(lockoutKey);
        if (lockoutCount === 1) {
          await redis.expire(lockoutKey, Math.ceil(lockoutMs / 1000));
        }
        return { allowed: false, retryAfterMs: lockoutMs, remaining: 0 };
      }
      return { allowed: true, retryAfterMs: 0, remaining: maxAttempts - count };
    } catch {
      rateLogger.warn('Redis error, falling back to in-memory');
    }
  }

  const entry = store.get(key);

  if (entry && entry.resetAt > now && entry.count >= maxAttempts) {
    return { allowed: false, retryAfterMs: entry.resetAt - now, remaining: 0 };
  }

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0, remaining: maxAttempts - 1 };
  }

  entry.count++;
  if (entry.count >= maxAttempts) {
    store.set(key, { count: entry.count, resetAt: now + lockoutMs });
    return { allowed: false, retryAfterMs: lockoutMs, remaining: 0 };
  }

  return { allowed: true, retryAfterMs: 0, remaining: maxAttempts - entry.count };
}

export async function resetRateLimit(identifier: string, namespace: string = 'login') {
  const key = `${namespace}:${identifier}`;
  const redis = await getRedisClient();
  if (redis) {
    try {
      await redis.del(key);
      await redis.del(`${key}:lockout`);
      return;
    } catch {
      // fall through to in-memory
    }
  }
  store.delete(key);
}

export function clearExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}
