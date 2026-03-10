import { NextResponse } from 'next/server';
import { createErrorResponse, parsePagination } from '@/lib/api';
import { AppError } from '@/lib/errors';
import { getGalleryAlbumById, getGalleryAlbums } from '@/lib/services/public-content';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get('albumId');

    if (albumId) {
      const album = await getGalleryAlbumById(albumId);

      if (!album) {
        throw new AppError('Gallery album not found', 404);
      }

      return NextResponse.json(album);
    }

    const { page, limit } = parsePagination(searchParams, { limit: 12 });
    const albums = await getGalleryAlbums(page, limit);

    return NextResponse.json(albums);
  } catch (error) {
    if (!(error instanceof AppError)) {
      console.error('Gallery API error:', error);
    }

    return createErrorResponse(error);
  }
}
