import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { auth } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { createAdminGallery } from '@/lib/services/admin-dashboard';

export const runtime = 'nodejs';

function assertAdminRole(role?: string) {
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    throw new AppError('Unauthorized', 401);
  }
}

function getTextField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function getOptionalFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function getFiles(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is File => value instanceof File && value.size > 0);
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    assertAdminRole(role);

    const formData = await request.formData();
    const album = await createAdminGallery({
      title: getTextField(formData, 'title'),
      description: getTextField(formData, 'description'),
      coverImage: getOptionalFile(formData, 'coverImage'),
      images: getFiles(formData, 'images'),
    });

    return NextResponse.json(
      {
        album,
        message: 'Gallery album created successfully.',
      },
      { status: 201 }
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
