import { NextResponse } from 'next/server';
import { createErrorResponse, parsePagination } from '@/lib/api';
import { AppError } from '@/lib/errors';
import { getActivityById, getActivities } from '@/lib/services/public-content';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('activityId');

    if (activityId) {
      const activity = await getActivityById(activityId);

      if (!activity) {
        throw new AppError('Activity not found', 404);
      }

      return NextResponse.json(activity);
    }

    const { page, limit } = parsePagination(searchParams, { limit: 12 });
    const activities = await getActivities(page, limit);
    return NextResponse.json(activities);
  } catch (error) {
    return createErrorResponse(error);
  }
}
