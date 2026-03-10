import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { getDb } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { contactSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const db = await getDb();
    const message = await db.contactMessage.create({
      name: parsed.data.name.trim(),
      email: parsed.data.email.trim().toLowerCase(),
      phone: parsed.data.phone?.trim() || undefined,
      subject: parsed.data.subject.trim(),
      message: parsed.data.message.trim(),
      isRead: false,
    });

    return NextResponse.json(
      {
        message: 'Your message has been received',
        id: message.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (!(error instanceof AppError)) {
      console.error('Contact form error:', error);
    }

    return createErrorResponse(error);
  }
}
