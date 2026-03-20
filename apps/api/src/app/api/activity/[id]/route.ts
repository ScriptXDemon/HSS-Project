import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { AppError } from '@/lib/errors';
import { getActivityById } from '@/lib/services/public-content';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activity = await getActivityById(id);

    if (!activity) {
      throw new AppError('Activity not found', 404);
    }

    return NextResponse.json(activity);
  } catch (error) {
    return createErrorResponse(error);
  }
}
