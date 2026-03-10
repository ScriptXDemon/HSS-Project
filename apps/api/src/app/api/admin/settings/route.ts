import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { requireAdminSession } from '@/lib/server-auth';
import { getAdminSettingsData } from '@/lib/services/admin-dashboard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdminSession();
    const settings = await getAdminSettingsData();
    return NextResponse.json({ settings });
  } catch (error) {
    return createErrorResponse(error);
  }
}
