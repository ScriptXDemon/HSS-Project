'use client';

import { useEffect, useId } from 'react';
import type { ReactNode } from 'react';

interface AdminDrawerProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

export default function AdminDrawer({
  open,
  title,
  description,
  onClose,
  children,
}: AdminDrawerProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        className="absolute inset-0 bg-brown-dark/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close drawer"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="absolute right-0 top-0 h-full w-full max-w-3xl overflow-hidden border-l border-stone-temple/60 bg-cream shadow-2xl shadow-brown-dark/20"
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-stone-temple/60 bg-white/90 px-5 py-4 backdrop-blur sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className="text-2xl font-heading text-brown-dark">
                  {title}
                </h2>
                {description ? (
                  <p id={descriptionId} className="mt-2 max-w-2xl text-sm leading-6 text-brown-dark/70">
                    {description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-temple/70 bg-white text-brown-dark transition hover:border-saffron hover:text-saffron"
                aria-label="Close drawer"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M6 6L18 18M6 18L18 6" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">{children}</div>
        </div>
      </aside>
    </div>
  );
}
