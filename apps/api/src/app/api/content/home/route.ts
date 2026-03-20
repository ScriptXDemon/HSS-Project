import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { isLanguage } from '@/lib/i18n';
import { getHomePageContent } from '@/lib/services/public-content';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedLanguage = searchParams.get('lang');
    const language = isLanguage(requestedLanguage) ? requestedLanguage : 'en';
    const content = await getHomePageContent(language);
    return NextResponse.json(content);
  } catch (error) {
    return createErrorResponse(error);
  }
}
