'use client';

import { useLanguage } from '@/components/providers/LanguageProvider';
import type { Language } from '@/lib/i18n';

interface LanguageSwitcherProps {
  compact?: boolean;
  inverted?: boolean;
}

const languages: Language[] = ['en', 'hi', 'mr'];

export default function LanguageSwitcher({
  compact = false,
  inverted = false,
}: LanguageSwitcherProps) {
  const { language, setLanguage, languageLabels } = useLanguage();

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Select language</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        className={`appearance-none rounded-full border py-2 pl-4 pr-10 text-sm font-semibold outline-none transition focus:border-saffron focus:ring-2 focus:ring-saffron/20 ${
          compact ? 'min-w-[7rem]' : 'min-w-[9rem]'
        } ${
          inverted
            ? 'border-white/35 bg-white/15 text-white'
            : 'border-stone-temple/70 bg-white text-brown-dark'
        }`}
        aria-label="Language switcher"
      >
        {languages.map((item) => (
          <option key={item} value={item}>
            {languageLabels[item]}
          </option>
        ))}
      </select>

      <span
        className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${
          inverted ? 'text-white' : 'text-brown-dark/70'
        }`}
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor">
          <path d="M5 7.5L10 12.5L15 7.5" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
    </label>
  );
}
