import { AppError } from '@/lib/errors';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

const globalStore = globalThis as typeof globalThis & {
  __hssRateLimitStore__?: Map<string, RateLimitEntry>;
};

const store = globalStore.__hssRateLimitStore__ ?? new Map<string, RateLimitEntry>();
globalStore.__hssRateLimitStore__ = store;

function now() {
  return Date.now();
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  return request.headers.get('x-real-ip') || 'unknown';
}

function cleanupExpiredEntries(currentTime: number) {
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= currentTime) {
      store.delete(key);
    }
  }
}

export function buildRateLimitKey(request: Request, scope: string, suffix?: string) {
  const ip = getClientIp(request);
  return `${scope}:${suffix || ip}`;
}

export function enforceRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const currentTime = now();
  cleanupExpiredEntries(currentTime);

  const existing = store.get(key);
  if (!existing || existing.resetAt <= currentTime) {
    store.set(key, {
      count: 1,
      resetAt: currentTime + windowMs,
    });
    return;
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - currentTime) / 1000));
    throw new AppError('Too many requests. Please try again later.', 429, {
      retryAfterSeconds,
    });
  }

  existing.count += 1;
  store.set(key, existing);
}

export const rateLimitProfiles = {
  auth: { limit: 5, windowMs: 15 * 60 * 1000 },
  generalWrite: { limit: 100, windowMs: 15 * 60 * 1000 },
};