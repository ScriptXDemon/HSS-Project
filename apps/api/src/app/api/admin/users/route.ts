import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { getAdminUsersData } from '@/lib/services/admin-dashboard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await getAdminUsersData();
    return NextResponse.json({ users });
  } catch (error) {
    return createErrorResponse(error);
  }
}
