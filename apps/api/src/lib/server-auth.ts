import type { Session } from 'next-auth';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { AppError } from '@/lib/errors';

export async function requireAdminSession(): Promise<Session> {
  const session = await auth();
  const sessionUser = session?.user as
    | {
        id?: string;
        role?: string;
        isApproved?: boolean;
        isActive?: boolean;
      }
    | undefined;

  if (!session?.user || !sessionUser?.id) {
    throw new AppError('Unauthorized', 401);
  }

  const db = await getDb();
  const user = await db.user.findById(sessionUser.id);

  if (!user || user.isActive === false) {
    throw new AppError('Unauthorized', 401);
  }

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    throw new AppError('Forbidden', 403);
  }

  sessionUser.role = user.role;
  sessionUser.isApproved = user.isApproved;
  sessionUser.isActive = user.isActive ?? true;

  return session;
}
