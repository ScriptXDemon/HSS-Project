import { NextResponse } from 'next/server';
import { createErrorResponse, parsePagination } from '@/lib/api';
import { AppError } from '@/lib/errors';
import { getEvents } from '@/lib/services/public-content';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'published';

    if (!['upcoming', 'past', 'published'].includes(scope)) {
      throw new AppError('Invalid event scope', 400);
    }

    const { page, limit } = parsePagination(searchParams, { limit: 9 });
    const events = await getEvents(scope as 'upcoming' | 'past' | 'published', page, limit);

    return NextResponse.json(events);
  } catch (error) {
    if (!(error instanceof AppError)) {
      console.error('Events API error:', error);
    }

    return createErrorResponse(error);
  }
}
