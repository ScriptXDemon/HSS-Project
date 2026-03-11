import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { AppError } from '@/lib/errors';
import { requireAdminSession } from '@/lib/server-auth';
import { readUploadedFile } from '@/lib/upload';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      throw new AppError('File key is required', 400);
    }

    const file = await readUploadedFile(key);

    return new NextResponse(new Uint8Array(file.body), {
      status: 200,
      headers: {
        'Content-Type': file.contentType,
        'Content-Disposition': `inline; filename="${file.fileName}"`,
        'Cache-Control': 'private, no-store',
        'Cross-Origin-Resource-Policy': 'same-origin',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
