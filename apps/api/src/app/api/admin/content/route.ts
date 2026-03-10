import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { getAdminContentData } from '@/lib/services/admin-dashboard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const blocks = await getAdminContentData();
    return NextResponse.json({ blocks });
  } catch (error) {
    return createErrorResponse(error);
  }
}
