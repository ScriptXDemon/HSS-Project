import { AppError } from '@/lib/errors';
import {
  deleteExpiringValues,
  getExpiringValue,
  incrementExpiringCounter,
  setExpiringValue,
} from './shared-store';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const COUNTER_WINDOW_MS = 15 * 60 * 1000;

function buildFailedCountKey(identifier: string) {
  return `auth:failed:${identifier}`;
}

function buildLockKey(identifier: string) {
  return `auth:locked:${identifier}`;
}

export async function assertLoginAllowed(identifier: string) {
  const lockedUntilRaw = await getExpiringValue(buildLockKey(identifier));
  if (!lockedUntilRaw) {
    return;
  }

  const lockedUntil = Number(lockedUntilRaw);
  if (!Number.isFinite(lockedUntil) || lockedUntil <= Date.now()) {
    await deleteExpiringValues(buildLockKey(identifier));
    return;
  }

  const retryAfterSeconds = Math.max(1, Math.ceil((lockedUntil - Date.now()) / 1000));
  throw new AppError('Account temporarily locked. Please try again later.', 429, {
    retryAfterSeconds,
  });
}

export async function recordFailedLogin(identifier: string) {
  const failedAttempts = await incrementExpiringCounter(
    buildFailedCountKey(identifier),
    COUNTER_WINDOW_MS
  );

  if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
    const lockedUntil = Date.now() + LOCKOUT_MS;
    await setExpiringValue(buildLockKey(identifier), String(lockedUntil), LOCKOUT_MS);
  }
}

export async function clearFailedLogins(identifier: string) {
  await deleteExpiringValues(buildFailedCountKey(identifier), buildLockKey(identifier));
}
