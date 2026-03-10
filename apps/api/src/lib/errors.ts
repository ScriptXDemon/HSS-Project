export class AppError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function getErrorMessage(error: unknown, fallback = 'Unexpected error') {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
