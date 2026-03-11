import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { requireAdminSession } from '@/lib/server-auth';
import { assertAllowedOrigin } from '@/lib/security/origin';
import { markContactMessageRead } from '@/lib/services/admin-dashboard';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdminSession();
    assertAllowedOrigin(request);
    await markContactMessageRead(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return createErrorResponse(error);
  }
}
