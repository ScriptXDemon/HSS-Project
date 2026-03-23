import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getDbMock = vi.fn();
const uploadImageFileMock = vi.fn();
const uploadMediaFileMock = vi.fn();
const deleteUploadedFileMock = vi.fn();
const extractUploadKeyFromUrlMock = vi.fn();

vi.mock('@/lib/db', () => ({
  getDb: getDbMock,
}));

vi.mock('@/lib/upload', () => ({
  uploadImageFile: uploadImageFileMock,
  uploadMediaFile: uploadMediaFileMock,
  deleteUploadedFile: deleteUploadedFileMock,
  extractUploadKeyFromUrl: extractUploadKeyFromUrlMock,
  uploadLimits: {
    galleryAsset: 5 * 1024 * 1024,
    eventVideo: 25 * 1024 * 1024,
    memberPhoto: 2 * 1024 * 1024,
  },
}));

describe('admin dashboard gallery media', () => {
  beforeEach(() => {
    vi.resetModules();
    getDbMock.mockReset();
    uploadImageFileMock.mockReset();
    uploadMediaFileMock.mockReset();
    deleteUploadedFileMock.mockReset();
    extractUploadKeyFromUrlMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates mixed image and video activity items in upload order groups', async () => {
    const galleryAlbumCreate = vi.fn().mockResolvedValue({ id: 'album-1' });
    const galleryItemCreate = vi.fn().mockResolvedValue({});

    getDbMock.mockResolvedValue({
      galleryAlbum: { create: galleryAlbumCreate },
      galleryItem: { create: galleryItemCreate },
    });

    uploadImageFileMock.mockResolvedValueOnce({
      key: 'public/gallery/items/image-1.jpg',
      url: '/uploads/gallery/items/image-1.jpg',
    });
    uploadMediaFileMock.mockResolvedValueOnce({
      key: 'public/gallery/items/video-1.mp4',
      url: '/uploads/gallery/items/video-1.mp4',
    });

    const { createAdminActivity } = await import('../services/admin-dashboard');
    await createAdminActivity({
      title: 'Hanuman Jayanti Seva',
      description: 'Mixed media album',
      coverImage: null,
      images: [new File(['image'], 'image-1.jpg', { type: 'image/jpeg' })],
      videos: [new File(['video'], 'video-1.mp4', { type: 'video/mp4' })],
    });

    expect(galleryAlbumCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Hanuman Jayanti Seva',
        coverImage: '/uploads/gallery/items/image-1.jpg',
      })
    );
    expect(galleryItemCreate.mock.calls.map((call) => call[0])).toEqual([
      expect.objectContaining({
        albumId: 'album-1',
        type: 'IMAGE',
        url: '/uploads/gallery/items/image-1.jpg',
        thumbnail: '/uploads/gallery/items/image-1.jpg',
        sortOrder: 0,
      }),
      expect.objectContaining({
        albumId: 'album-1',
        type: 'VIDEO',
        url: '/uploads/gallery/items/video-1.mp4',
        thumbnail: undefined,
        sortOrder: 1,
      }),
    ]);
  });

  it('appends uploaded videos to an existing activity album', async () => {
    const galleryAlbumUpdate = vi.fn().mockResolvedValue({ id: 'album-1' });
    const galleryItemCreate = vi.fn().mockResolvedValue({});

    getDbMock.mockResolvedValue({
      galleryAlbum: {
        findWithItems: vi.fn().mockResolvedValue({
          id: 'album-1',
          title: 'Existing album',
          coverImage: '/uploads/gallery/covers/cover-1.jpg',
          items: [
            {
              id: 'item-1',
              albumId: 'album-1',
              type: 'IMAGE',
              url: '/uploads/gallery/items/image-1.jpg',
              thumbnail: '/uploads/gallery/items/image-1.jpg',
              caption: undefined,
              sortOrder: 0,
            },
          ],
        }),
        update: galleryAlbumUpdate,
      },
      galleryItem: { create: galleryItemCreate },
    });

    uploadMediaFileMock.mockResolvedValueOnce({
      key: 'public/gallery/items/video-2.webm',
      url: '/uploads/gallery/items/video-2.webm',
    });

    const { updateAdminActivity } = await import('../services/admin-dashboard');
    await updateAdminActivity('album-1', {
      title: 'Existing album',
      description: 'Updated activity album',
      images: [],
      videos: [new File(['video'], 'video-2.webm', { type: 'video/webm' })],
    });

    expect(galleryAlbumUpdate).toHaveBeenCalledWith(
      'album-1',
      expect.objectContaining({
        title: 'Existing album',
      })
    );
    expect(galleryItemCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        albumId: 'album-1',
        type: 'VIDEO',
        url: '/uploads/gallery/items/video-2.webm',
        thumbnail: undefined,
        sortOrder: 1,
      })
    );
  });
});
