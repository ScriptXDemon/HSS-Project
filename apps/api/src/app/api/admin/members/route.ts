import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { getAdminMembersData } from '@/lib/services/admin-dashboard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const members = await getAdminMembersData();
    return NextResponse.json({ members });
  } catch (error) {
    return createErrorResponse(error);
  }
}
