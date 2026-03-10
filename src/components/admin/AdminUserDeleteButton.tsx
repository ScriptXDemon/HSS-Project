'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { pickLanguage } from '@/lib/i18n';

interface AdminUserDeleteButtonProps {
  userId: string;
  userName: string;
}

const copy = {
  en: {
    remove: 'Remove',
    removing: 'Removing...',
    confirm: 'Remove this user account? This action deletes the member profile linked with the account as well.',
    success: 'User removed successfully.',
    error: 'Unable to remove user.',
  },
  hi: {
    remove: 'Remove',
    removing: 'Removing...',
    confirm: 'Remove this user account? This action deletes the member profile linked with the account as well.',
    success: 'User removed successfully.',
    error: 'Unable to remove user.',
  },
} as const;

export default function AdminUserDeleteButton({ userId, userName }: AdminUserDeleteButtonProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(`${text.confirm}\n\n${userName}`);
    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      setError(result?.error || text.error);
      setLoading(false);
      return;
    }

    setMessage(result?.message || text.success);
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded-xl bg-sacred-red px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
      >
        {loading ? text.removing : text.remove}
      </button>
      {error ? <p className="text-xs text-sacred-red">{error}</p> : null}
      {message ? <p className="text-xs text-green-700">{message}</p> : null}
    </div>
  );
}
