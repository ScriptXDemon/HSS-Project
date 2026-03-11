import { AppError } from '@/lib/errors';

interface MemoryEntry {
  value: string;
  expiresAt: number;
}

interface PipelineResult {
  result?: unknown;
  error?: string;
}

const globalStore = globalThis as typeof globalThis & {
  __hssSharedSecurityStore__?: Map<string, MemoryEntry>;
};

const memoryStore = globalStore.__hssSharedSecurityStore__ ?? new Map<string, MemoryEntry>();
globalStore.__hssSharedSecurityStore__ = memoryStore;

function now() {
  return Date.now();
}

function isTest() {
  return process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
}

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function shouldUseMemoryFallback() {
  return !isProduction() || isTest();
}

function cleanupExpiredEntries(currentTime = now()) {
  for (const [key, entry] of memoryStore.entries()) {
    if (entry.expiresAt <= currentTime) {
      memoryStore.delete(key);
    }
  }
}

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, '');
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (shouldUseMemoryFallback()) {
      return null;
    }

    throw new AppError('Upstash Redis is not configured', 503);
  }

  return { url, token };
}

async function runPipeline(commands: Array<Array<string | number>>) {
  const config = getRedisConfig();
  if (!config) {
    throw new AppError('Upstash Redis is not configured', 503);
  }

  const response = await fetch(`${config.url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
    cache: 'no-store',
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new AppError('Upstash Redis request failed', 503, {
      status: response.status,
      detail,
    });
  }

  const results = (await response.json()) as PipelineResult[];
  const failed = results.find((entry) => entry.error);
  if (failed) {
    throw new AppError('Upstash Redis command failed', 503, { detail: failed.error });
  }

  return results.map((entry) => entry.result);
}

export async function incrementExpiringCounter(key: string, ttlMs: number) {
  if (shouldUseMemoryFallback()) {
    cleanupExpiredEntries();
    const existing = memoryStore.get(key);
    const nextValue = existing && existing.expiresAt > now() ? Number(existing.value) + 1 : 1;
    memoryStore.set(key, {
      value: String(nextValue),
      expiresAt: now() + ttlMs,
    });
    return nextValue;
  }

  const [countResult] = await runPipeline([
    ['INCR', key],
    ['PEXPIRE', key, ttlMs],
  ]);

  return Number(countResult ?? 0);
}

export async function getExpiringValue(key: string) {
  if (shouldUseMemoryFallback()) {
    cleanupExpiredEntries();
    return memoryStore.get(key)?.value ?? null;
  }

  const [value] = await runPipeline([['GET', key]]);
  return value == null ? null : String(value);
}

export async function setExpiringValue(key: string, value: string, ttlMs: number) {
  if (shouldUseMemoryFallback()) {
    cleanupExpiredEntries();
    memoryStore.set(key, {
      value,
      expiresAt: now() + ttlMs,
    });
    return;
  }

  await runPipeline([['SET', key, value, 'PX', ttlMs]]);
}

export async function deleteExpiringValues(...keys: string[]) {
  if (!keys.length) {
    return;
  }

  if (shouldUseMemoryFallback()) {
    for (const key of keys) {
      memoryStore.delete(key);
    }
    return;
  }

  await runPipeline([['DEL', ...keys]]);
}

export function resetSharedSecurityStoreForTests() {
  memoryStore.clear();
}
