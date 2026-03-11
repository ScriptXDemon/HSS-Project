'use client';

import { useLanguage } from '@/components/providers/LanguageProvider';
import type { Language } from '@/lib/i18n';

interface LanguageSwitcherProps {
  compact?: boolean;
  inverted?: boolean;
}

const languages: Language[] = ['en', 'hi', 'mr'];
const compactLabels: Record<Language, string> = {
  en: 'EN',
  hi: 'HI',
  mr: 'MR',
};

export default function LanguageSwitcher({
  compact = false,
  inverted = false,
}: LanguageSwitcherProps) {
  const { language, setLanguage, languageLabels } = useLanguage();

  return (
    <div
      className={`inline-flex items-center rounded-full border px-1 py-1 ${
        inverted
          ? 'border-white/30 bg-white/10 text-white'
          : 'border-stone-temple bg-white text-brown-dark'
      }`}
      aria-label="Language switcher"
    >
      {languages.map((item) => {
        const active = item === language;
        return (
          <button
            key={item}
            type="button"
            onClick={() => setLanguage(item)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              compact ? 'min-w-[3.25rem]' : 'min-w-[4.25rem]'
            } ${
              active
                ? inverted
                  ? 'bg-white text-brown-dark'
                  : 'bg-saffron text-white'
                : inverted
                  ? 'text-white/80 hover:bg-white/10'
                  : 'text-brown-dark/70 hover:bg-stone-temple'
            }`}
          >
            {compact ? compactLabels[item] : languageLabels[item]}
          </button>
        );
      })}
    </div>
  );
}
