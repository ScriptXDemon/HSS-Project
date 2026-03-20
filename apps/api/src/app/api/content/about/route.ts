import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { getAboutPageContent } from '@/lib/services/public-content';
import { isLanguage } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedLanguage = searchParams.get('lang');
    const language = isLanguage(requestedLanguage) ? requestedLanguage : 'en';
    const content = await getAboutPageContent(language);
    return NextResponse.json(content);
  } catch (error) {
    return createErrorResponse(error);
  }
}
