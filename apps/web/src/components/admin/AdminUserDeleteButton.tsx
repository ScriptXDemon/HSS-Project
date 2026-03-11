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
    remove: 'Deactivate',
    removing: 'Deactivating...',
    confirm: 'Deactivate this user account? The account will be blocked from signing in and any linked member profile will be suspended.',
    success: 'User deactivated successfully.',
    error: 'Unable to deactivate user.',
  },
  hi: {
    remove: 'निष्क्रिय करें',
    removing: 'निष्क्रिय किया जा रहा है...',
    confirm: 'क्या इस उपयोगकर्ता खाते को निष्क्रिय करना है? खाते का साइन-इन बंद कर दिया जाएगा और जुड़ी सदस्य प्रोफ़ाइल निलंबित कर दी जाएगी।',
    success: 'उपयोगकर्ता सफलतापूर्वक निष्क्रिय किया गया।',
    error: 'उपयोगकर्ता को निष्क्रिय नहीं किया जा सका।',
  },
  mr: {
    remove: 'निष्क्रिय करा',
    removing: 'निष्क्रिय करत आहे...',
    confirm: 'हे वापरकर्ता खाते निष्क्रिय करायचे आहे का? या खात्याला साइन-इन करता येणार नाही आणि जोडलेली सदस्य प्रोफाइल निलंबित केली जाईल.',
    success: 'वापरकर्ता यशस्वीपणे निष्क्रिय केला.',
    error: 'वापरकर्त्याला निष्क्रिय करता आले नाही.',
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
