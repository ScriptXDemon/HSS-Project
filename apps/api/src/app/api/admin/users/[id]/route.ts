import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { requireAdminSession } from '@/lib/server-auth';
import { AppError } from '@/lib/errors';
import { assertAllowedOrigin } from '@/lib/security/origin';
import { deleteUserAccount } from '@/lib/services/admin-dashboard';

export const runtime = 'nodejs';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAdminSession();
    const sessionUserId = (session.user as { id?: string } | undefined)?.id;
    assertAllowedOrigin(request);

    if (sessionUserId && sessionUserId === id) {
      throw new AppError('You cannot deactivate the account currently signed in.', 400);
    }

    await deleteUserAccount(id);
    return NextResponse.json({ success: true, message: 'User deactivated successfully.' });
  } catch (error) {
    return createErrorResponse(error);
  }
}
