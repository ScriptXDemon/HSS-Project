import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import type { Role, IUser } from '@/lib/db/types';
import { AppError } from '@/lib/errors';

export interface CreateUserAccountInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: Role;
  isApproved?: boolean;
  emailVerified?: boolean;
  avatar?: string;
}

export function normalizeOptionalString(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export async function ensureUserIdentityAvailable(email: string, phone?: string) {
  const db = await getDb();
  const normalizedPhone = normalizeOptionalString(phone);

  const existingUser = await db.user.findByEmail(email);
  if (existingUser) {
    throw new AppError('An account with this email already exists', 409);
  }

  if (normalizedPhone) {
    const existingPhone = await db.user.findByPhone(normalizedPhone);
    if (existingPhone) {
      throw new AppError('An account with this phone number already exists', 409);
    }
  }
}

export async function prepareUserAccountData(
  input: CreateUserAccountInput
): Promise<Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>> {
  const passwordHash = await bcrypt.hash(input.password, 12);

  return {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: normalizeOptionalString(input.phone),
    passwordHash,
    role: input.role || 'MEMBER',
    isApproved: input.isApproved ?? false,
    emailVerified: input.emailVerified ?? false,
    avatar: normalizeOptionalString(input.avatar),
  };
}

export async function createUserAccount(input: CreateUserAccountInput) {
  await ensureUserIdentityAvailable(input.email.trim().toLowerCase(), input.phone);

  const db = await getDb();
  const userData = await prepareUserAccountData(input);

  return db.user.create(userData);
}
