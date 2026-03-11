import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../errors';

const requireAdminSessionMock = vi.fn();
const updateDonationStatusMock = vi.fn();
const getDbMock = vi.fn();

vi.mock('@/lib/server-auth', () => ({
  requireAdminSession: requireAdminSessionMock,
}));

vi.mock('@/lib/services/admin-dashboard', () => ({
  updateDonationStatus: updateDonationStatusMock,
}));

vi.mock('@/lib/db', () => ({
  getDb: getDbMock,
}));

describe('admin routes and readiness', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    requireAdminSessionMock.mockReset();
    updateDonationStatusMock.mockReset();
    getDbMock.mockReset();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  it('rejects admin donation status updates without an authenticated admin session', async () => {
    requireAdminSessionMock.mockRejectedValue(new AppError('Unauthorized', 401));
    const { PATCH } = await import('@/app/api/admin/donations/[id]/status/route');

    const response = await PATCH(
      new Request('https://example.com/api/admin/donations/donation-1/status', {
        method: 'PATCH',
        headers: {
          origin: 'https://hsss-project.netlify.app',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ status: 'SUCCESS' }),
      }),
      { params: Promise.resolve({ id: 'donation-1' }) }
    );

    expect(response.status).toBe(401);
  });

  it('rejects admin donation status updates from an untrusted origin', async () => {
    process.env = {
      ...process.env,
      NODE_ENV: 'production',
      APP_ORIGIN: 'https://hsss-project.netlify.app',
    };
    requireAdminSessionMock.mockResolvedValue({ user: { id: 'admin-1', role: 'SUPER_ADMIN' } });
    const { PATCH } = await import('@/app/api/admin/donations/[id]/status/route');

    const response = await PATCH(
      new Request('https://example.com/api/admin/donations/donation-1/status', {
        method: 'PATCH',
        headers: {
          origin: 'https://evil.example.com',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ status: 'SUCCESS' }),
      }),
      { params: Promise.resolve({ id: 'donation-1' }) }
    );

    expect(response.status).toBe(403);
  });

  it('fails readiness in production when Redis security configuration is missing', async () => {
    process.env = {
      ...process.env,
      NODE_ENV: 'production',
      MONGODB_URI: 'mongodb+srv://example',
      APP_ORIGIN: 'https://hsss-project.netlify.app',
    };
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const { GET } = await import('@/app/api/health/ready/route');

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.reason).toContain('Upstash Redis');
  });

  it('fails readiness when MongoDB is not configured', async () => {
    delete process.env.MONGODB_URI;
    const { GET } = await import('@/app/api/health/ready/route');

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.reason).toContain('MONGODB_URI');
  });
});
