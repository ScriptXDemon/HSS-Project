import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../errors';

const requireAdminSessionMock = vi.fn();
const updateDonationStatusMock = vi.fn();
const updateOrganizationPersonMock = vi.fn();
const createAdminActivityMock = vi.fn();
const updateAdminActivityMock = vi.fn();
const getDbMock = vi.fn();

vi.mock('@/lib/server-auth', () => ({
  requireAdminSession: requireAdminSessionMock,
}));

vi.mock('@/lib/services/admin-dashboard', () => ({
  createAdminActivity: createAdminActivityMock,
  updateAdminActivity: updateAdminActivityMock,
  updateDonationStatus: updateDonationStatusMock,
  updateOrganizationPerson: updateOrganizationPersonMock,
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
    updateOrganizationPersonMock.mockReset();
    createAdminActivityMock.mockReset();
    updateAdminActivityMock.mockReset();
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

  it('treats unchecked roster visibility boxes as false', async () => {
    process.env = {
      ...process.env,
      APP_ORIGIN: 'https://hsss-project.netlify.app',
    };
    requireAdminSessionMock.mockResolvedValue({ user: { id: 'admin-1', role: 'SUPER_ADMIN' } });
    updateOrganizationPersonMock.mockResolvedValue({ id: 'person-1' });
    const { PUT } = await import('@/app/api/admin/about/people/[id]/route');

    const formData = new FormData();
    formData.set('nameEn', 'Aditi Sharma');
    formData.set('roleEn', 'State Convenor');
    formData.set('aboutOrder', '1');
    formData.set('homeOrder', '1');

    const response = await PUT(
      new Request('https://example.com/api/admin/about/people/person-1', {
        method: 'PUT',
        headers: {
          origin: 'https://hsss-project.netlify.app',
        },
        body: formData,
      }),
      { params: Promise.resolve({ id: 'person-1' }) }
    );

    expect(response.status).toBe(200);
    expect(updateOrganizationPersonMock).toHaveBeenCalledWith(
      'person-1',
      expect.objectContaining({
        showOnAbout: false,
        showOnHome: false,
      })
    );
  });

  it('passes repeated activity video uploads through the create route', async () => {
    process.env = {
      ...process.env,
      APP_ORIGIN: 'https://hsss-project.netlify.app',
    };
    requireAdminSessionMock.mockResolvedValue({ user: { id: 'admin-1', role: 'SUPER_ADMIN' } });
    createAdminActivityMock.mockResolvedValue({ id: 'activity-1' });
    const { POST } = await import('@/app/api/admin/activity/route');

    const image = new File(['image'], 'photo.jpg', { type: 'image/jpeg' });
    const videoOne = new File(['video-1'], 'clip-1.mp4', { type: 'video/mp4' });
    const videoTwo = new File(['video-2'], 'clip-2.webm', { type: 'video/webm' });
    const formData = new FormData();
    formData.set('title', 'Hanuman Jayanti');
    formData.set('description', 'Album with image and video uploads');
    formData.append('images', image);
    formData.append('videos', videoOne);
    formData.append('videos', videoTwo);

    const response = await POST(
      new Request('https://example.com/api/admin/activity', {
        method: 'POST',
        headers: {
          origin: 'https://hsss-project.netlify.app',
        },
        body: formData,
      })
    );

    expect(response.status).toBe(201);
    expect(createAdminActivityMock).toHaveBeenCalledWith(
      expect.objectContaining({
        images: expect.any(Array),
        videos: expect.any(Array),
      })
    );

    const createInput = createAdminActivityMock.mock.calls[0]?.[0];
    expect(createInput.images.map((file: File) => file.name)).toEqual(['photo.jpg']);
    expect(createInput.videos.map((file: File) => file.name)).toEqual(['clip-1.mp4', 'clip-2.webm']);
  });

  it('passes repeated activity video uploads through the update route', async () => {
    process.env = {
      ...process.env,
      APP_ORIGIN: 'https://hsss-project.netlify.app',
    };
    requireAdminSessionMock.mockResolvedValue({ user: { id: 'admin-1', role: 'SUPER_ADMIN' } });
    updateAdminActivityMock.mockResolvedValue({ id: 'activity-1' });
    const { PUT } = await import('@/app/api/admin/activity/[id]/route');

    const image = new File(['image'], 'cover.jpg', { type: 'image/jpeg' });
    const video = new File(['video'], 'clip-3.mov', { type: 'video/quicktime' });
    const formData = new FormData();
    formData.set('title', 'Updated album');
    formData.set('description', 'Album with appended video upload');
    formData.append('images', image);
    formData.append('videos', video);

    const response = await PUT(
      new Request('https://example.com/api/admin/activity/activity-1', {
        method: 'PUT',
        headers: {
          origin: 'https://hsss-project.netlify.app',
        },
        body: formData,
      }),
      { params: Promise.resolve({ id: 'activity-1' }) }
    );

    expect(response.status).toBe(200);
    expect(updateAdminActivityMock).toHaveBeenCalledWith(
      'activity-1',
      expect.objectContaining({
        images: expect.any(Array),
        videos: expect.any(Array),
      })
    );

    const updateInput = updateAdminActivityMock.mock.calls[0]?.[1];
    expect(updateInput.images.map((file: File) => file.name)).toEqual(['cover.jpg']);
    expect(updateInput.videos.map((file: File) => file.name)).toEqual(['clip-3.mov']);
  });
});
