'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { formatTemplate, pickLanguage } from '@/lib/i18n';

interface PaginationControlsProps {
  pathname: string;
  page: number;
  totalPages: number;
  query?: Record<string, string | number | undefined>;
}

const copy = {
  en: {
    previous: 'Previous',
    next: 'Next',
    summary: 'Page {page} of {total}',
  },
  hi: {
    previous: 'पिछला',
    next: 'अगला',
    summary: 'पृष्ठ {page} / {total}',
  },
} as const;

function buildHref(
  pathname: string,
  page: number,
  query?: Record<string, string | number | undefined>
) {
  const params = new URLSearchParams();

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });

  params.set('page', String(page));
  const queryString = params.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
}

export default function PaginationControls({
  pathname,
  page,
  totalPages,
  query,
}: PaginationControlsProps) {
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-8 flex items-center justify-between rounded-2xl border border-stone-temple bg-white px-4 py-3 text-sm">
      <Link
        href={buildHref(pathname, Math.max(page - 1, 1), query)}
        aria-disabled={page <= 1}
        className={`rounded-lg px-4 py-2 font-medium transition ${
          page <= 1
            ? 'pointer-events-none bg-stone-temple/60 text-brown-dark/40'
            : 'bg-stone-temple text-brown-dark hover:bg-saffron hover:text-white'
        }`}
      >
        {text.previous}
      </Link>
      <span className="text-brown-dark/70">
        {formatTemplate(text.summary, { page, total: totalPages })}
      </span>
      <Link
        href={buildHref(pathname, Math.min(page + 1, totalPages), query)}
        aria-disabled={page >= totalPages}
        className={`rounded-lg px-4 py-2 font-medium transition ${
          page >= totalPages
            ? 'pointer-events-none bg-stone-temple/60 text-brown-dark/40'
            : 'bg-stone-temple text-brown-dark hover:bg-saffron hover:text-white'
        }`}
      >
        {text.next}
      </Link>
    </div>
  );
}
