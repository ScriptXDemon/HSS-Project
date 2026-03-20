import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { requireAdminSession } from '@/lib/server-auth';
import { assertAllowedOrigin } from '@/lib/security/origin';
import {
  createAdminBanner,
  getAdminBannersData,
} from '@/lib/services/admin-dashboard';

export const runtime = 'nodejs';

function getTextField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function getOptionalFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function getNumberField(formData: FormData, key: string, fallback: number) {
  const value = Number(getTextField(formData, key));
  return Number.isFinite(value) ? value : fallback;
}

export async function GET() {
  try {
    await requireAdminSession();
    const banners = await getAdminBannersData();
    return NextResponse.json({ banners });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    assertAllowedOrigin(request);
    const formData = await request.formData();
    const banner = await createAdminBanner({
      title: getTextField(formData, 'title'),
      subtitle: getTextField(formData, 'subtitle'),
      ctaLabel: getTextField(formData, 'ctaLabel'),
      ctaHref: getTextField(formData, 'ctaHref'),
      image: getOptionalFile(formData, 'image'),
      sortOrder: getNumberField(formData, 'sortOrder', 1),
    });

    return NextResponse.json({ banner, message: 'Banner created successfully.' }, { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
