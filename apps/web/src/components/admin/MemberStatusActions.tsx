'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { pickLanguage } from '@/lib/i18n';

interface MemberStatusActionsProps {
  memberId: string;
}

const copy = {
  en: {
    approve: 'Approve',
    reject: 'Reject',
    suspend: 'Suspend',
    error: 'Unable to update member status.',
  },
  hi: {
    approve: 'स्वीकृत करें',
    reject: 'अस्वीकृत करें',
    suspend: 'निलंबित करें',
    error: 'सदस्य स्थिति अपडेट नहीं हो सकी।',
  },
  mr: {
    approve: 'मंजूर करा',
    reject: 'नामंजूर करा',
    suspend: 'निलंबित करा',
    error: 'सदस्याची स्थिती अद्यतनित करता आली नाही.',
  },
} as const;

export default function MemberStatusActions({ memberId }: MemberStatusActionsProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(status: 'APPROVED' | 'REJECTED' | 'SUSPENDED') {
    setLoading(status);
    setError(null);

    const response = await fetch(`/api/admin/members/${memberId}/status`, {
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
          onClick={() => updateStatus('APPROVED')}
          disabled={loading !== null}
          className="rounded-xl bg-saffron px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {loading === 'APPROVED' ? '...' : text.approve}
        </button>
        <button
          type="button"
          onClick={() => updateStatus('REJECTED')}
          disabled={loading !== null}
          className="rounded-xl bg-sacred-red px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {loading === 'REJECTED' ? '...' : text.reject}
        </button>
        <button
          type="button"
          onClick={() => updateStatus('SUSPENDED')}
          disabled={loading !== null}
          className="rounded-xl bg-brown-dark px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {loading === 'SUSPENDED' ? '...' : text.suspend}
        </button>
      </div>
      {error ? <p className="text-xs text-sacred-red">{error}</p> : null}
    </div>
  );
}
