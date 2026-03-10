import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { markContactMessageRead } from '@/lib/services/admin-dashboard';

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await markContactMessageRead(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return createErrorResponse(error);
  }
}
