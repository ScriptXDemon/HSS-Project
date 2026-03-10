import { NextResponse } from 'next/server';
import { createErrorResponse, parsePagination } from '@/lib/api';
import { getPublicDonors } from '@/lib/services/public-content';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit } = parsePagination(searchParams, { limit: 20 });
    const donors = await getPublicDonors(page, limit);
    return NextResponse.json(donors);
  } catch (error) {
    return createErrorResponse(error);
  }
}
