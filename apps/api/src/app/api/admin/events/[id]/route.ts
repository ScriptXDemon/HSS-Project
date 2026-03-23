import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { requireAdminSession } from '@/lib/server-auth';
import { assertAllowedOrigin } from '@/lib/security/origin';
import { deleteAdminEvent, updateAdminEvent } from '@/lib/services/admin-dashboard';

export const runtime = 'nodejs';

function getTextField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
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
    const event = await updateAdminEvent(id, {
      title: getTextField(formData, 'title'),
      description: getTextField(formData, 'description'),
      date: getTextField(formData, 'date'),
      venue: getTextField(formData, 'venue'),
      isPublished: getTextField(formData, 'isPublished') !== 'false',
      coverImage: getOptionalFile(formData, 'coverImage'),
      video: getOptionalFile(formData, 'video'),
    });

    return NextResponse.json({ event, message: 'Event updated successfully.' });
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
    await deleteAdminEvent(id);
    return NextResponse.json({ success: true, message: 'Event removed successfully.' });
  } catch (error) {
    return createErrorResponse(error);
  }
}
