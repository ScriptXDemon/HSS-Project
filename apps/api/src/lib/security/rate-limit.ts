import { AppError } from '@/lib/errors';
import { incrementExpiringCounter } from './shared-store';

interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  return request.headers.get('x-real-ip') || 'unknown';
}

export function buildRateLimitKey(request: Request, scope: string, suffix?: string) {
  const ip = getClientIp(request);
  return `${scope}:${suffix || ip}`;
}

export async function enforceRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const count = await incrementExpiringCounter(key, windowMs);

  if (count > limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil(windowMs / 1000));
    throw new AppError('Too many requests. Please try again later.', 429, {
      retryAfterSeconds,
    });
  }
}

export const rateLimitProfiles = {
  auth: { limit: 5, windowMs: 15 * 60 * 1000 },
  generalWrite: { limit: 100, windowMs: 15 * 60 * 1000 },
};
