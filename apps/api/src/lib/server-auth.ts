import { auth } from '@/lib/auth';
import { AppError } from '@/lib/errors';

export async function requireAdminSession() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) {
    throw new AppError('Unauthorized', 401);
  }

  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    throw new AppError('Forbidden', 403);
  }

  return session;
}
