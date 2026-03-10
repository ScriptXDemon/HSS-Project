import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { requireAdminSession } from '@/lib/server-auth';
import { createAdminEvent, getAdminEventsData } from '@/lib/services/admin-dashboard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getTextField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function getOptionalFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

export async function GET() {
  try {
    await requireAdminSession();
    const events = await getAdminEventsData();
    return NextResponse.json({ events });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const formData = await request.formData();
    const event = await createAdminEvent({
      title: getTextField(formData, 'title'),
      description: getTextField(formData, 'description'),
      date: getTextField(formData, 'date'),
      venue: getTextField(formData, 'venue'),
      isPublished: getTextField(formData, 'isPublished') !== 'false',
      coverImage: getOptionalFile(formData, 'coverImage'),
      video: getOptionalFile(formData, 'video'),
    });

    return NextResponse.json({ event, message: 'Event created successfully.' }, { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
