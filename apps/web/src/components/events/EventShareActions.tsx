'use client';

import { useMemo, useState } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { pickLanguage } from '@/lib/i18n';

interface EventShareActionsProps {
  title: string;
  shareUrl: string;
}

const copy = {
  en: {
    share: 'Share Event',
    copy: 'Copy Link',
    copied: 'Link Copied',
    whatsapp: 'WhatsApp',
  },
  hi: {
    share: 'साझा करें',
    copy: 'लिंक कॉपी करें',
    copied: 'लिंक कॉपी हो गया',
    whatsapp: 'व्हाट्सऐप',
  },
} as const;

export default function EventShareActions({ title, shareUrl }: EventShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title,
        url: shareUrl,
      });
      return;
    }

    await handleCopy();
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} - ${shareUrl}`)}`;

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={handleShare}
        className="rounded-xl bg-saffron px-4 py-3 text-sm font-semibold text-white transition hover:bg-saffron-deep"
      >
        {text.share}
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-xl border border-saffron/30 px-4 py-3 text-sm font-semibold text-saffron transition hover:bg-saffron hover:text-white"
      >
        {copied ? text.copied : text.copy}
      </button>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="rounded-xl border border-brown-dark/20 px-4 py-3 text-sm font-semibold text-brown-dark transition hover:border-brown-dark hover:bg-brown-dark hover:text-white"
      >
        {text.whatsapp}
      </a>
    </div>
  );
}
