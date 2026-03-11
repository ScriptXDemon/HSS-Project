import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { requireAdminSession } from '@/lib/server-auth';
import { AppError } from '@/lib/errors';
import { assertAllowedOrigin } from '@/lib/security/origin';
import { updateDonationStatus } from '@/lib/services/admin-dashboard';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAdminSession();
    assertAllowedOrigin(request);
    const body = (await request.json()) as { status?: string; verificationNotes?: string };
    const status = body.status;

    if (
      status !== 'PENDING' &&
      status !== 'SUCCESS' &&
      status !== 'FAILED' &&
      status !== 'REFUNDED'
    ) {
      throw new AppError('Invalid donation status', 400);
    }

    const donation = await updateDonationStatus(id, {
      status,
      verificationNotes: body.verificationNotes,
      verifiedBy: (session.user as { id?: string } | undefined)?.id,
    });
    return NextResponse.json({ donation });
  } catch (error) {
    return createErrorResponse(error);
  }
}
