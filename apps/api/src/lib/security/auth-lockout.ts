import { AppError } from '@/lib/errors';

interface LockoutEntry {
  failedAttempts: number;
  lockedUntil?: number;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const globalStore = globalThis as typeof globalThis & {
  __hssAuthLockoutStore__?: Map<string, LockoutEntry>;
};

const store = globalStore.__hssAuthLockoutStore__ ?? new Map<string, LockoutEntry>();
globalStore.__hssAuthLockoutStore__ = store;

function getEntry(identifier: string) {
  return store.get(identifier) ?? { failedAttempts: 0 };
}

export function assertLoginAllowed(identifier: string) {
  const entry = getEntry(identifier);
  if (!entry.lockedUntil) {
    return;
  }

  if (entry.lockedUntil <= Date.now()) {
    store.delete(identifier);
    return;
  }

  const retryAfterSeconds = Math.max(1, Math.ceil((entry.lockedUntil - Date.now()) / 1000));
  throw new AppError('Account temporarily locked. Please try again later.', 429, {
    retryAfterSeconds,
  });
}

export function recordFailedLogin(identifier: string) {
  const entry = getEntry(identifier);
  const failedAttempts = entry.failedAttempts + 1;

  if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
    store.set(identifier, {
      failedAttempts,
      lockedUntil: Date.now() + LOCKOUT_MS,
    });
    return;
  }

  store.set(identifier, {
    failedAttempts,
  });
}

export function clearFailedLogins(identifier: string) {
  store.delete(identifier);
}