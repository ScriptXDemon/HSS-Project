import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { requireAdminSession } from '@/lib/server-auth';
import { assertAllowedOrigin } from '@/lib/security/origin';
import {
  deleteOrganizationPerson,
  updateOrganizationPerson,
} from '@/lib/services/admin-dashboard';

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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    assertAllowedOrigin(request);
    const { id } = await params;
    const formData = await request.formData();
    const person = await updateOrganizationPerson(id, {
      name: getTextField(formData, 'name'),
      role: getTextField(formData, 'role'),
      bio: getTextField(formData, 'bio'),
      showOnAbout: getBooleanField(formData, 'showOnAbout', false),
      showOnHome: getBooleanField(formData, 'showOnHome', false),
      aboutOrder: getNumberField(formData, 'aboutOrder', 1),
      homeOrder: getNumberField(formData, 'homeOrder', 1),
      photo: getOptionalFile(formData, 'photo'),
    });

    return NextResponse.json({ person, message: 'Person updated successfully.' });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    assertAllowedOrigin(request);
    const { id } = await params;
    await deleteOrganizationPerson(id);
    return NextResponse.json({ success: true, message: 'Person removed successfully.' });
  } catch (error) {
    return createErrorResponse(error);
  }
}
