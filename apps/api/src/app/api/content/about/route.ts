import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { getAboutPageContent } from '@/lib/services/public-content';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('lang') === 'hi' ? 'hi' : 'en';
    const content = await getAboutPageContent(language);
    return NextResponse.json(content);
  } catch (error) {
    return createErrorResponse(error);
  }
}
