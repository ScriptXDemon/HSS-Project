import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { getAdminDonationsData } from '@/lib/services/admin-dashboard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const donations = await getAdminDonationsData();
    return NextResponse.json({ donations });
  } catch (error) {
    return createErrorResponse(error);
  }
}
