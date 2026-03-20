'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ActivityDeleteButtonProps {
  activityId: string;
}

export default function ActivityDeleteButton({ activityId }: ActivityDeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm('Remove this activity album?')) {
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch(`/api/admin/activity/${activityId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result?.error || 'Unable to remove activity.');
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded-xl bg-sacred-red px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
      >
        {loading ? '...' : 'Remove'}
      </button>
      {error ? <p className="text-xs text-sacred-red">{error}</p> : null}
    </div>
  );
}
