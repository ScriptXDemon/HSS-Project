import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { requireAdminSession } from '@/lib/server-auth';
import { createAdminGallery, getAdminGalleryData } from '@/lib/services/admin-dashboard';

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

function getFiles(formData: FormData, key: string) {
  return formData.getAll(key).filter((value): value is File => value instanceof File && value.size > 0);
}

export async function GET() {
  try {
    await requireAdminSession();
    const albums = await getAdminGalleryData();
    return NextResponse.json({ albums });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const formData = await request.formData();
    const album = await createAdminGallery({
      title: getTextField(formData, 'title'),
      description: getTextField(formData, 'description'),
      coverImage: getOptionalFile(formData, 'coverImage'),
      images: getFiles(formData, 'images'),
    });

    return NextResponse.json({ album, message: 'Gallery album created successfully.' }, { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
