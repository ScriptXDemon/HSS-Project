import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { requireAdminSession } from '@/lib/server-auth';
import { AppError } from '@/lib/errors';
import { updateDonationStatus } from '@/lib/services/admin-dashboard';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminSession();
    const body = (await request.json()) as { status?: string };
    const status = body.status;

    if (
      status !== 'PENDING' &&
      status !== 'SUCCESS' &&
      status !== 'FAILED' &&
      status !== 'REFUNDED'
    ) {
      throw new AppError('Invalid donation status', 400);
    }

    const donation = await updateDonationStatus(params.id, status);
    return NextResponse.json({ donation });
  } catch (error) {
    return createErrorResponse(error);
  }
}
