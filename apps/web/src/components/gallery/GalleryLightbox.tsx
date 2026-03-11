'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import type { GalleryItemDTO } from '@hss/domain';
import { formatTemplate, pickLanguage } from '@/lib/i18n';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface GalleryLightboxProps {
  items: GalleryItemDTO[];
}

const copy = {
  en: {
    imageAlt: 'Gallery image',
    playVideo: 'Play Video',
    itemLabel: 'Gallery item {index}',
    closePreview: 'Close gallery preview',
    previousItem: 'Previous item',
    nextItem: 'Next item',
    itemCounter: 'Item {current} of {total}',
  },
  hi: {
    imageAlt: 'गैलरी छवि',
    playVideo: 'वीडियो चलाएँ',
    itemLabel: 'गैलरी आइटम {index}',
    closePreview: 'पूर्वावलोकन बंद करें',
    previousItem: 'पिछला आइटम',
    nextItem: 'अगला आइटम',
    itemCounter: 'आइटम {current} / {total}',
  },
  mr: {
    imageAlt: 'गॅलरी प्रतिमा',
    playVideo: 'व्हिडिओ चालवा',
    itemLabel: 'गॅलरी आयटम {index}',
    closePreview: 'पूर्वावलोकन बंद करा',
    previousItem: 'मागील आयटम',
    nextItem: 'पुढील आयटम',
    itemCounter: 'आयटम {current} / {total}',
  },
} as const;

function renderMedia(item: GalleryItemDTO, priority = false, imageAlt: string) {
  if (item.type === 'VIDEO') {
    return (
      <video controls className="h-full w-full rounded-2xl bg-black object-cover" preload="metadata">
        <source src={item.url} />
      </video>
    );
  }

  return (
    <Image
      src={item.thumbnail || item.url}
      alt={item.caption || imageAlt}
      fill
      priority={priority}
      className="object-cover"
      sizes="(max-width: 768px) 100vw, 33vw"
    />
  );
}

export default function GalleryLightbox({ items }: GalleryLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActiveIndex(null);
      }

      if (event.key === 'ArrowRight') {
        setActiveIndex((current) => (current === null ? null : (current + 1) % items.length));
      }

      if (event.key === 'ArrowLeft') {
        setActiveIndex((current) =>
          current === null ? null : (current - 1 + items.length) % items.length
        );
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, items.length]);

  const activeItem = activeIndex !== null ? items[activeIndex] : null;
  const activePosition = activeIndex ?? 0;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative overflow-hidden rounded-3xl border border-stone-temple bg-white text-left shadow-md transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-stone-temple">
              {renderMedia(item, index < 3, text.imageAlt)}
              {item.type === 'VIDEO' ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
                  <span className="rounded-full border border-white/40 bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
                    {text.playVideo}
                  </span>
                </div>
              ) : null}
            </div>
            <div className="px-4 py-4">
              <p className="text-sm font-medium text-brown-dark">
                {item.caption || formatTemplate(text.itemLabel, { index: index + 1 })}
              </p>
            </div>
          </button>
        ))}
      </div>

      {activeItem ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-brown-dark/90 px-4 py-6">
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            aria-label={text.closePreview}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M6 6L18 18M6 18L18 6" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveIndex((current) =>
                current === null ? null : (current - 1 + items.length) % items.length
              )
            }
            aria-label={text.previousItem}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M15 18L9 12L15 6" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          <div className="w-full max-w-5xl">
            <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-black">
              {activeItem.type === 'VIDEO' ? (
                <video controls autoPlay className="h-full w-full object-contain">
                  <source src={activeItem.url} />
                </video>
              ) : (
                <Image
                  src={activeItem.url}
                  alt={activeItem.caption || text.imageAlt}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              )}
            </div>
            <div className="mt-4 rounded-2xl bg-white/10 px-5 py-4 text-white backdrop-blur">
              <p className="text-base font-semibold">
                {activeItem.caption || formatTemplate(text.itemLabel, { index: activePosition + 1 })}
              </p>
              <p className="mt-1 text-sm text-white/70">
                {formatTemplate(text.itemCounter, {
                  current: activePosition + 1,
                  total: items.length,
                })}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setActiveIndex((current) => (current === null ? null : (current + 1) % items.length))
            }
            aria-label={text.nextItem}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 18L15 12L9 6" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ) : null}
    </>
  );
}
