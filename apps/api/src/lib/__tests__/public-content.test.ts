import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getDbMock = vi.fn();

vi.mock('@/lib/db', () => ({
  getDb: getDbMock,
}));

describe('public activity previews', () => {
  beforeEach(() => {
    vi.resetModules();
    getDbMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('does not expose a video url as the activity card image preview', async () => {
    getDbMock.mockResolvedValue({
      galleryAlbum: {
        findAll: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'album-1',
              title: 'Video-first album',
              description: 'Public activity album',
              coverImage: undefined,
              createdAt: new Date('2026-01-01T00:00:00.000Z'),
            },
          ],
          total: 1,
          page: 1,
          limit: 12,
          totalPages: 1,
        }),
      },
      galleryItem: {
        count: vi.fn().mockResolvedValue(1),
        findByAlbum: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'item-1',
              albumId: 'album-1',
              type: 'VIDEO',
              url: '/uploads/gallery/items/video-1.mp4',
              thumbnail: undefined,
              caption: undefined,
              sortOrder: 0,
              createdAt: new Date('2026-01-01T00:00:00.000Z'),
            },
          ],
          total: 1,
          page: 1,
          limit: 1,
          totalPages: 1,
        }),
      },
    });

    const { getActivities } = await import('../services/public-content');
    const activities = await getActivities();

    expect(activities.data[0]).toMatchObject({
      id: 'album-1',
      itemCount: 1,
      previewUrl: undefined,
    });
  });
});
