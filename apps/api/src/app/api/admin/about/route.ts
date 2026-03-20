import { NextResponse } from 'next/server';
import type { LocalizedAboutContentDTO } from '@hss/domain';
import { createErrorResponse } from '@/lib/api';
import { requireAdminSession } from '@/lib/server-auth';
import { assertAllowedOrigin } from '@/lib/security/origin';
import {
  getAdminAboutContentData,
  updateAdminAboutContent,
} from '@/lib/services/admin-dashboard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdminSession();
    const data = await getAdminAboutContentData();
    return NextResponse.json(data);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdminSession();
    assertAllowedOrigin(request);
    const body = (await request.json()) as { about: LocalizedAboutContentDTO };
    await updateAdminAboutContent(body.about);
    return NextResponse.json({ success: true, message: 'About Us content updated successfully.' });
  } catch (error) {
    return createErrorResponse(error);
  }
}
