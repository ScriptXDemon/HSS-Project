import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { getImportantLinks } from '@/lib/services/public-content';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const links = await getImportantLinks();
    return NextResponse.json(links);
  } catch (error) {
    return createErrorResponse(error);
  }
}
