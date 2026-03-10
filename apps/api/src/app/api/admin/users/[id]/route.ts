import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { requireAdminSession } from '@/lib/server-auth';
import { AppError } from '@/lib/errors';
import { deleteUserAccount } from '@/lib/services/admin-dashboard';

export const runtime = 'nodejs';

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdminSession();
    const sessionUserId = (session.user as { id?: string } | undefined)?.id;

    if (sessionUserId && sessionUserId === params.id) {
      throw new AppError('You cannot deactivate the account currently signed in.', 400);
    }

    await deleteUserAccount(params.id);
    return NextResponse.json({ success: true, message: 'User deactivated successfully.' });
  } catch (error) {
    return createErrorResponse(error);
  }
}