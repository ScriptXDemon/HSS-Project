import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { AppError } from '@/lib/errors';
import { handleRazorpayWebhook } from '@/lib/services/donations';

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      throw new AppError('Missing Razorpay signature', 401);
    }

    const payload = await request.text();
    const result = await handleRazorpayWebhook(payload, signature);

    return NextResponse.json(result);
  } catch (error) {
    if (!(error instanceof AppError)) {
      console.error('Donation webhook error:', error);
    }

    return createErrorResponse(error);
  }
}
