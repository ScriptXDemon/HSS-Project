import { headers } from 'next/headers';
import type { ApiErrorResponse } from '@hss/domain';

function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, '');
}

export function getBrowserApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE || '/api';
}

function getServerApiBase() {
  const internal = process.env.BACKEND_INTERNAL_URL;
  if (internal) {
    return trimTrailingSlash(internal);
  }

  const publicBase = process.env.NEXT_PUBLIC_SITE_URL;
  if (publicBase) {
    return `${trimTrailingSlash(publicBase)}${getBrowserApiBase()}`;
  }

  return 'http://localhost:3000/api';
}

export async function serverApiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const cookieHeader = (await headers()).get('cookie');
  const response = await fetch(`${getServerApiBase()}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    throw new Error(error?.error || `API request failed for ${path}`);
  }

  return response.json() as Promise<T>;
}
