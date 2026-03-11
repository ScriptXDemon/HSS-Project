'use client';

import { useMemo } from 'react';
import { signOut } from 'next-auth/react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { pickLanguage } from '@/lib/i18n';

const copy = {
  en: { signOut: 'Sign Out' },
  hi: { signOut: 'साइन आउट' },
  mr: { signOut: 'साइन आऊट' },
} as const;

export default function AdminSignOutButton() {
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="w-full rounded-2xl bg-brown-dark px-4 py-3 text-sm font-semibold text-white transition hover:bg-maroon-deep"
    >
      {text.signOut}
    </button>
  );
}
