import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { requireAdminSession } from '@/lib/server-auth';
import { getAdminUsersData } from '@/lib/services/admin-dashboard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdminSession();
    const users = await getAdminUsersData();
    return NextResponse.json({ users });
  } catch (error) {
    return createErrorResponse(error);
  }
}
