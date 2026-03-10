import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { getAdminDashboardData } from '@/lib/services/admin-dashboard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getAdminDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    return createErrorResponse(error);
  }
}