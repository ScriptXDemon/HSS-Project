import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createErrorResponse } from '@/lib/api';
import { getDb } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { enforceRateLimit, buildRateLimitKey, rateLimitProfiles } from '@/lib/security/rate-limit';
import { createUserAccount } from '@/lib/services/users';

const bootstrapAdminSchema = z.object({
  token: z.string().min(1, 'Bootstrap token is required'),
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number').optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
});

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await enforceRateLimit({
      key: buildRateLimitKey(request, 'auth-bootstrap'),
      ...rateLimitProfiles.auth,
    });

    const configuredToken = process.env.ADMIN_BOOTSTRAP_TOKEN;
    if (!configuredToken) {
      throw new AppError('ADMIN_BOOTSTRAP_TOKEN is not configured', 503);
    }

    const body = await request.json();
    const parsed = bootstrapAdminSchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    if (parsed.data.token !== configuredToken) {
      throw new AppError('Invalid bootstrap token', 403);
    }

    const db = await getDb();
    const [superAdminCount, adminCount] = await Promise.all([
      db.user.count({ role: 'SUPER_ADMIN' }),
      db.user.count({ role: 'ADMIN' }),
    ]);

    if (superAdminCount + adminCount > 0) {
      throw new AppError('An admin user already exists. Bootstrap is disabled.', 409);
    }

    const user = await createUserAccount({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      password: parsed.data.password,
      role: 'SUPER_ADMIN',
      isActive: true,
      isApproved: true,
      emailVerified: true,
    });

    return NextResponse.json(
      {
        message: 'Bootstrap admin created successfully.',
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
