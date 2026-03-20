import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { requireAdminSession } from '@/lib/server-auth';
import { assertAllowedOrigin } from '@/lib/security/origin';
import { deleteAdminActivity } from '@/lib/services/admin-dashboard';

export const runtime = 'nodejs';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    assertAllowedOrigin(request);
    const { id } = await params;
    await deleteAdminActivity(id);
    return NextResponse.json({ success: true, message: 'Activity removed successfully.' });
  } catch (error) {
    return createErrorResponse(error);
  }
}
