import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { AppError } from '@/lib/errors';
import { buildRateLimitKey, enforceRateLimit, rateLimitProfiles } from '@/lib/security/rate-limit';
import { submitManualDonationService } from '@/lib/services/donations';

function getRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function POST(request: Request) {
  try {
    enforceRateLimit({
      key: buildRateLimitKey(request, 'donation-submit'),
      ...rateLimitProfiles.generalWrite,
    });

    const formData = await request.formData();
    const screenshotValue = formData.get('screenshot');
    const screenshot =
      screenshotValue instanceof File && screenshotValue.size > 0 ? screenshotValue : null;

    const donation = await submitManualDonationService({
      donorName: getRequiredString(formData, 'donorName'),
      donorEmail: getRequiredString(formData, 'donorEmail'),
      donorPhone: getRequiredString(formData, 'donorPhone'),
      amount: Number(getRequiredString(formData, 'amount') || 0),
      isAnonymous: getRequiredString(formData, 'isAnonymous') === 'true',
      screenshot: screenshot as File,
    });

    return NextResponse.json(donation, { status: 201 });
  } catch (error) {
    if (!(error instanceof AppError)) {
      console.error('Manual donation submission error:', error);
    }

    return createErrorResponse(error);
  }
}