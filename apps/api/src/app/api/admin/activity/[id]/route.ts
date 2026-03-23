import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { requireAdminSession } from '@/lib/server-auth';
import { assertAllowedOrigin } from '@/lib/security/origin';
import { deleteAdminActivity, updateAdminActivity } from '@/lib/services/admin-dashboard';

export const runtime = 'nodejs';

function getTextField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function getOptionalFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function getFiles(formData: FormData, key: string) {
  return formData.getAll(key).filter((value): value is File => value instanceof File && value.size > 0);
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
    const activity = await updateAdminActivity(id, {
      title: getTextField(formData, 'title'),
      description: getTextField(formData, 'description'),
      coverImage: getOptionalFile(formData, 'coverImage'),
      images: getFiles(formData, 'images'),
      videos: getFiles(formData, 'videos'),
    });

    return NextResponse.json({ activity, message: 'Activity updated successfully.' });
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
    await deleteAdminActivity(id);
    return NextResponse.json({ success: true, message: 'Activity removed successfully.' });
  } catch (error) {
    return createErrorResponse(error);
  }
}
