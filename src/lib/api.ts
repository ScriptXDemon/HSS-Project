import { NextResponse } from 'next/server';
import { AppError, getErrorMessage } from './errors';
import { paginationSchema } from './validators';

export function createErrorResponse(error: unknown, fallbackMessage = 'Internal server error') {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  return NextResponse.json(
    {
      error: getErrorMessage(error, fallbackMessage),
    },
    { status: 500 }
  );
}

export function parsePagination(searchParams: URLSearchParams, defaults?: { limit?: number }) {
  const parsed = paginationSchema.safeParse({
    page: searchParams.get('page') ?? 1,
    limit: searchParams.get('limit') ?? defaults?.limit ?? 12,
  });

  if (!parsed.success) {
    throw new AppError('Invalid pagination parameters', 400, parsed.error.flatten().fieldErrors);
  }

  return parsed.data;
}
