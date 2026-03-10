import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { auth } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { deleteUserAccount } from '@/lib/services/admin-dashboard';

export const runtime = 'nodejs';

function assertAdminRole(role?: string) {
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    throw new AppError('Unauthorized', 401);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string; id?: string } | undefined)?.role;
    const sessionUserId = (session?.user as { role?: string; id?: string } | undefined)?.id;
    assertAdminRole(role);

    if (sessionUserId && sessionUserId === params.id) {
      throw new AppError('You cannot deactivate the account currently signed in.', 400);
    }

    await deleteUserAccount(params.id);
    return NextResponse.json({ success: true, message: 'User deactivated successfully.' });
  } catch (error) {
    return createErrorResponse(error);
  }
}
