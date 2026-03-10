import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

const hardcodedAdmin = {
  id: 'demo-admin-hari',
  name: 'Hari',
  email: 'hari@local.admin',
  role: 'SUPER_ADMIN',
  isApproved: true,
} as const;

function getIdentifier(credentials: Record<string, unknown> | undefined) {
  const identifier = credentials?.identifier ?? credentials?.email;
  return typeof identifier === 'string' ? identifier.trim() : '';
}

function getPassword(credentials: Record<string, unknown> | undefined) {
  return typeof credentials?.password === 'string' ? credentials.password : '';
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const identifier = getIdentifier(credentials as Record<string, unknown> | undefined);
        const password = getPassword(credentials as Record<string, unknown> | undefined);

        if (!identifier || !password) {
          return null;
        }

        if (identifier.toLowerCase() === 'hari' && password === 'Admin') {
          return hardcodedAdmin;
        }

        const normalizedEmail = identifier.toLowerCase();

        const bcrypt = (await import('bcryptjs')).default;
        const { getDb } = await import('@/lib/db');

        const db = await getDb();
        const user = await db.user.findByEmail(normalizedEmail);
        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: string }).role;
        token.isApproved = (user as { isApproved: boolean }).isApproved;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role: string }).role = token.role as string;
        (session.user as { isApproved: boolean }).isApproved = token.isApproved as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60,
  },
});
