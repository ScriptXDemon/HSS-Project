import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { requireAdminSession } from '@/lib/server-auth';
import { getAdminContactMessagesData } from '@/lib/services/admin-dashboard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdminSession();
    const messages = await getAdminContactMessagesData();
    return NextResponse.json({ messages });
  } catch (error) {
    return createErrorResponse(error);
  }
}
