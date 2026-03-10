'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { pickLanguage } from '@/lib/i18n';

interface DonationStatusActionsProps {
  donationId: string;
  proofUrl?: string;
}

const copy = {
  en: {
    verify: 'Mark Verified',
    fail: 'Mark Failed',
    refund: 'Mark Refunded',
    proof: 'View proof',
    error: 'Unable to update donation status.',
  },
  hi: {
    verify: 'सत्यापित करें',
    fail: 'असफल चिन्हित करें',
    refund: 'रिफंड चिन्हित करें',
    proof: 'प्रमाण देखें',
    error: 'दान स्थिति अपडेट नहीं हो सकी।',
  },
} as const;

export default function DonationStatusActions({ donationId, proofUrl }: DonationStatusActionsProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(status: 'SUCCESS' | 'FAILED' | 'REFUNDED') {
    setLoading(status);
    setError(null);

    const response = await fetch(`/api/admin/donations/${donationId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result?.error || text.error);
      setLoading(null);
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => updateStatus('SUCCESS')}
          disabled={loading !== null}
          className="rounded-xl bg-saffron px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {loading === 'SUCCESS' ? '...' : text.verify}
        </button>
        <button
          type="button"
          onClick={() => updateStatus('FAILED')}
          disabled={loading !== null}
          className="rounded-xl bg-sacred-red px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {loading === 'FAILED' ? '...' : text.fail}
        </button>
        <button
          type="button"
          onClick={() => updateStatus('REFUNDED')}
          disabled={loading !== null}
          className="rounded-xl bg-brown-dark px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {loading === 'REFUNDED' ? '...' : text.refund}
        </button>
        {proofUrl ? (
          <a
            href={proofUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-saffron/30 px-3 py-2 text-xs font-semibold text-saffron"
          >
            {text.proof}
          </a>
        ) : null}
      </div>
      {error ? <p className="text-xs text-sacred-red">{error}</p> : null}
    </div>
  );
}
