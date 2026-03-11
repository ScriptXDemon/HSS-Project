import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { requireAdminSession } from '@/lib/server-auth';
import { AppError } from '@/lib/errors';
import { assertAllowedOrigin } from '@/lib/security/origin';
import { updateMemberStatus } from '@/lib/services/admin-dashboard';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdminSession();
    assertAllowedOrigin(request);
    const body = (await request.json()) as { status?: string };
    const status = body.status;

    if (
      status !== 'PENDING' &&
      status !== 'APPROVED' &&
      status !== 'REJECTED' &&
      status !== 'SUSPENDED'
    ) {
      throw new AppError('Invalid member status', 400);
    }

    const member = await updateMemberStatus(id, status);
    return NextResponse.json({ member });
  } catch (error) {
    return createErrorResponse(error);
  }
}
