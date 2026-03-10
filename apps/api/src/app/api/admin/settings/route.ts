import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { getAdminSettingsData } from '@/lib/services/admin-dashboard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getAdminSettingsData();
    return NextResponse.json({ settings });
  } catch (error) {
    return createErrorResponse(error);
  }
}
