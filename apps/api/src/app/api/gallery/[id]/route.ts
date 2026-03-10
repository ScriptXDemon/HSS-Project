import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { AppError } from '@/lib/errors';
import { getGalleryAlbumById } from '@/lib/services/public-content';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const album = await getGalleryAlbumById(params.id);
    if (!album) {
      throw new AppError('Gallery album not found', 404);
    }
    return NextResponse.json(album);
  } catch (error) {
    return createErrorResponse(error);
  }
}
