import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { requireAdminSession } from '@/lib/server-auth';
import { getAdminContentData } from '@/lib/services/admin-dashboard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdminSession();
    const blocks = await getAdminContentData();
    return NextResponse.json({ blocks });
  } catch (error) {
    return createErrorResponse(error);
  }
}
