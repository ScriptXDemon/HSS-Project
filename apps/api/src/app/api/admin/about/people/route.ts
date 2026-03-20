import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { requireAdminSession } from '@/lib/server-auth';
import { assertAllowedOrigin } from '@/lib/security/origin';
import { createOrganizationPerson } from '@/lib/services/admin-dashboard';

export const runtime = 'nodejs';

function getTextField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function getBooleanField(formData: FormData, key: string, fallback = false) {
  const values = formData.getAll(key).filter((value): value is string => typeof value === 'string');
  if (!values.length) {
    return fallback;
  }

  return values.includes('true');
}

function getNumberField(formData: FormData, key: string, fallback: number) {
  const value = Number(getTextField(formData, key));
  return Number.isFinite(value) ? value : fallback;
}

function getOptionalFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    assertAllowedOrigin(request);
    const formData = await request.formData();
    const person = await createOrganizationPerson({
      name: getTextField(formData, 'name'),
      role: getTextField(formData, 'role'),
      bio: getTextField(formData, 'bio'),
      showOnAbout: getBooleanField(formData, 'showOnAbout', true),
      showOnHome: getBooleanField(formData, 'showOnHome', true),
      aboutOrder: getNumberField(formData, 'aboutOrder', 1),
      homeOrder: getNumberField(formData, 'homeOrder', 1),
      photo: getOptionalFile(formData, 'photo'),
    });

    return NextResponse.json({ person, message: 'Person saved successfully.' }, { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
