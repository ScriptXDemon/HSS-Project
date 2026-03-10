import { NextResponse } from 'next/server';
import { createUserAccount } from '@/lib/services/users';
import { registerSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, phone, password } = parsed.data;
    const user = await createUserAccount({
      name,
      email,
      phone,
      password,
      role: 'MEMBER',
      isApproved: false,
      emailVerified: false,
    });

    return NextResponse.json(
      { message: 'Registration successful', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    if (typeof error === 'object' && error && 'statusCode' in error) {
      const appError = error as { statusCode: number; message: string };
      return NextResponse.json({ error: appError.message }, { status: appError.statusCode });
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
