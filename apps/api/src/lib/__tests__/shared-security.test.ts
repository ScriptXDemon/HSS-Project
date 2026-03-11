import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../errors';
import { clearFailedLogins, assertLoginAllowed, recordFailedLogin } from '../security/auth-lockout';
import { assertAllowedOrigin } from '../security/origin';
import { enforceRateLimit } from '../security/rate-limit';
import {
  deleteExpiringValues,
  getExpiringValue,
  incrementExpiringCounter,
  resetSharedSecurityStoreForTests,
  setExpiringValue,
} from '../security/shared-store';

type RedisEntry = {
  value: string;
  expiresAt?: number;
};

function createMockUpstashFetch() {
  const redis = new Map<string, RedisEntry>();

  return vi.fn(async (_input: unknown, init?: RequestInit) => {
    const commands = JSON.parse(String(init?.body ?? '[]')) as Array<Array<string | number>>;
    const now = Date.now();

    for (const [key, entry] of redis.entries()) {
      if (entry.expiresAt && entry.expiresAt <= now) {
        redis.delete(key);
      }
    }

    const results = commands.map((command) => {
      const [operation, ...args] = command;

      switch (String(operation).toUpperCase()) {
        case 'INCR': {
          const key = String(args[0]);
          const current = redis.get(key);
          const nextValue = current ? Number(current.value) + 1 : 1;
          redis.set(key, { value: String(nextValue), expiresAt: current?.expiresAt });
          return { result: nextValue };
        }
        case 'PEXPIRE': {
          const key = String(args[0]);
          const ttlMs = Number(args[1]);
          const current = redis.get(key);
          if (current) {
            redis.set(key, { ...current, expiresAt: now + ttlMs });
          }
          return { result: 1 };
        }
        case 'GET': {
          const key = String(args[0]);
          return { result: redis.get(key)?.value ?? null };
        }
        case 'SET': {
          const key = String(args[0]);
          const value = String(args[1]);
          const ttlMs = Number(args[3]);
          redis.set(key, { value, expiresAt: Number.isFinite(ttlMs) ? now + ttlMs : undefined });
          return { result: 'OK' };
        }
        case 'DEL': {
          let deleted = 0;
          for (const rawKey of args) {
            const key = String(rawKey);
            if (redis.delete(key)) {
              deleted += 1;
            }
          }
          return { result: deleted };
        }
        default:
          return { error: `Unsupported command: ${operation}` };
      }
    });

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

const originalEnv = { ...process.env };

describe('shared security store', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    resetSharedSecurityStoreForTests();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    resetSharedSecurityStoreForTests();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('uses in-memory fallback during tests', async () => {
    await setExpiringValue('sample', 'one', 1_000);
    expect(await getExpiringValue('sample')).toBe('one');
    expect(await incrementExpiringCounter('counter', 1_000)).toBe(1);
    expect(await incrementExpiringCounter('counter', 1_000)).toBe(2);
    await deleteExpiringValues('sample', 'counter');
    expect(await getExpiringValue('sample')).toBeNull();
  });

  it('uses Upstash-compatible storage in production mode', async () => {
    const fetchMock = createMockUpstashFetch();
    vi.stubGlobal('fetch', fetchMock);
    process.env = {
      ...process.env,
      NODE_ENV: 'production',
      UPSTASH_REDIS_REST_URL: 'https://redis.example',
      UPSTASH_REDIS_REST_TOKEN: 'secret',
    };
    delete process.env.VITEST;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await recordFailedLogin('hari@example.com');
    }

    await expect(assertLoginAllowed('hari@example.com')).rejects.toMatchObject({
      statusCode: 429,
    });

    await clearFailedLogins('hari@example.com');
    await expect(assertLoginAllowed('hari@example.com')).resolves.toBeUndefined();

    await enforceRateLimit({ key: 'contact:127.0.0.1', limit: 1, windowMs: 60_000 });
    await expect(
      enforceRateLimit({ key: 'contact:127.0.0.1', limit: 1, windowMs: 60_000 })
    ).rejects.toMatchObject({ statusCode: 429 });

    expect(fetchMock).toHaveBeenCalled();
  });
});

describe('origin protection', () => {
  const envSnapshot = { ...process.env };

  beforeEach(() => {
    process.env = { ...envSnapshot };
  });

  afterEach(() => {
    process.env = { ...envSnapshot };
  });

  it('allows trusted origins for state-changing requests', () => {
    process.env = {
      ...process.env,
      NODE_ENV: 'production',
      APP_ORIGIN: 'https://hsss-project.netlify.app',
      ALLOWED_APP_ORIGINS: 'https://admin.example.com',
    };

    expect(() =>
      assertAllowedOrigin(
        new Request('https://example.com/api/contact', {
          method: 'POST',
          headers: { origin: 'https://admin.example.com' },
        })
      )
    ).not.toThrow();
  });

  it('rejects untrusted origins for state-changing requests', () => {
    process.env = {
      ...process.env,
      NODE_ENV: 'production',
      APP_ORIGIN: 'https://hsss-project.netlify.app',
    };

    expect(() =>
      assertAllowedOrigin(
        new Request('https://example.com/api/contact', {
          method: 'POST',
          headers: { origin: 'https://evil.example.com' },
        })
      )
    ).toThrowError(AppError);
  });
});
