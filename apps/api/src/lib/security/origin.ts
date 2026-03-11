import { AppError } from '@/lib/errors';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function normalizeOrigin(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function getAllowedOrigins() {
  const configured = [
    process.env.APP_ORIGIN,
    ...(process.env.ALLOWED_APP_ORIGINS ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  ]
    .map((value) => normalizeOrigin(value))
    .filter((value): value is string => Boolean(value));

  return new Set(configured);
}

export function assertAllowedOrigin(request: Request) {
  if (SAFE_METHODS.has(request.method.toUpperCase())) {
    return;
  }

  const allowedOrigins = getAllowedOrigins();
  if (!allowedOrigins.size) {
    if (isProduction()) {
      throw new AppError('Allowed application origins are not configured', 503);
    }
    return;
  }

  const origin =
    normalizeOrigin(request.headers.get('origin')) ??
    normalizeOrigin(request.headers.get('referer'));

  if (!origin) {
    if (isProduction()) {
      throw new AppError('Missing request origin', 403);
    }
    return;
  }

  if (!allowedOrigins.has(origin)) {
    throw new AppError('Forbidden origin', 403, { origin });
  }
}
