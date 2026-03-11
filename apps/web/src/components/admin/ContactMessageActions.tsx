'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { pickLanguage } from '@/lib/i18n';

interface ContactMessageActionsProps {
  messageId: string;
  disabled?: boolean;
}

const copy = {
  en: {
    markRead: 'Mark as Read',
    error: 'Unable to mark message as read.',
  },
  hi: {
    markRead: 'पढ़ा हुआ चिन्हित करें',
    error: 'संदेश को पढ़ा हुआ चिन्हित नहीं किया जा सका।',
  },
  mr: {
    markRead: 'वाचलेले चिन्हांकित करा',
    error: 'संदेश वाचलेला म्हणून चिन्हांकित करता आला नाही.',
  },
} as const;

export default function ContactMessageActions({ messageId, disabled }: ContactMessageActionsProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleMarkRead() {
    setLoading(true);
    setError(null);

    const response = await fetch(`/api/admin/contact-messages/${messageId}/read`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result?.error || text.error);
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleMarkRead}
        disabled={disabled || loading}
        className="rounded-xl bg-saffron px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
      >
        {loading ? '...' : text.markRead}
      </button>
      {error ? <p className="text-xs text-sacred-red">{error}</p> : null}
    </div>
  );
}
