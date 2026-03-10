'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  LANGUAGE_COOKIE_NAME,
  languageLabels,
  normalizeLanguage,
  type Language,
} from '@/lib/i18n';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  languageLabels: Record<Language, string>;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  initialLanguage: Language;
  children: ReactNode;
}

export default function LanguageProvider({
  initialLanguage,
  children,
}: LanguageProviderProps) {
  const router = useRouter();
  const [language, setLanguageState] = useState<Language>(normalizeLanguage(initialLanguage));

  const setLanguage = useCallback(
    (nextLanguage: Language) => {
      setLanguageState(nextLanguage);
      document.cookie = `${LANGUAGE_COOKIE_NAME}=${nextLanguage}; path=/; max-age=31536000; samesite=lax`;
      window.localStorage.setItem(LANGUAGE_COOKIE_NAME, nextLanguage);
      router.refresh();
    },
    [router]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      languageLabels,
    }),
    [language, setLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return context;
}
