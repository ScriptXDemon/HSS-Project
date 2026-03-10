import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { AppError } from '@/lib/errors';
import { getPublishedEventBySlug } from '@/lib/services/public-content';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const event = await getPublishedEventBySlug(params.slug);
    if (!event) {
      throw new AppError('Event not found', 404);
    }
    return NextResponse.json(event);
  } catch (error) {
    return createErrorResponse(error);
  }
}
