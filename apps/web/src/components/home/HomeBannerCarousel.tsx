'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import type { BannerDTO } from '@hss/domain';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { pickLanguage } from '@/lib/i18n';

interface HomeBannerCarouselProps {
  banners: BannerDTO[];
}

const copy = {
  en: {
    next: 'Next banner',
    previous: 'Previous banner',
    fallbackTitle: 'Hindu Shuraksha Seva Sangh',
  },
  hi: {
    next: 'अगला बैनर',
    previous: 'पिछला बैनर',
    fallbackTitle: 'हिंदू सुरक्षा सेवा संघ',
  },
  mr: {
    next: 'पुढील बॅनर',
    previous: 'मागील बॅनर',
    fallbackTitle: 'हिंदू सुरक्षा सेवा संघ',
  },
} as const;

export default function HomeBannerCarousel({ banners }: HomeBannerCarouselProps) {
  const safeBanners = banners.slice(0, 3);
  const [activeIndex, setActiveIndex] = useState(0);
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);

  useEffect(() => {
    if (safeBanners.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % safeBanners.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [safeBanners.length]);

  if (!safeBanners.length) {
    return null;
  }

  function goTo(index: number) {
    setActiveIndex(index);
  }

  function goPrevious() {
    setActiveIndex((current) => (current - 1 + safeBanners.length) % safeBanners.length);
  }

  function goNext() {
    setActiveIndex((current) => (current + 1) % safeBanners.length);
  }

  return (
    <section className="page-shell pt-10 sm:pt-12">
      <div className="page-content">
        <div className="overflow-hidden rounded-[2.25rem] border border-stone-temple/70 bg-white/95 p-3 shadow-2xl shadow-saffron/10 sm:p-4">
          <div className="relative min-h-[320px] w-full overflow-hidden rounded-[1.8rem] border border-stone-temple/40 bg-gradient-to-br from-cream via-stone-temple/25 to-gold-temple/10 sm:min-h-[400px] lg:min-h-[500px] xl:min-h-[560px]">
            {safeBanners.map((banner, index) => {
              const active = index === activeIndex;

              return (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    active ? 'opacity-100' : 'pointer-events-none opacity-0'
                  }`}
                >
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title || text.fallbackTitle}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className="object-contain"
                  />
                </div>
              );
            })}
          </div>

          {safeBanners.length > 1 ? (
            <div className="flex flex-col gap-4 border-t border-stone-temple/40 bg-white/90 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                {safeBanners.map((banner, index) => (
                  <button
                    key={banner.id}
                    type="button"
                    onClick={() => goTo(index)}
                    className={`h-2.5 rounded-full transition ${
                      index === activeIndex ? 'w-10 bg-saffron' : 'w-2.5 bg-stone-temple/70'
                    }`}
                    aria-label={`${index + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-center gap-3 sm:justify-end">
                <button
                  type="button"
                  aria-label={text.previous}
                  onClick={goPrevious}
                  className="inline-flex items-center justify-center rounded-full border border-stone-temple bg-white p-3 text-brown-dark transition hover:border-saffron hover:text-saffron"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M15 18L9 12L15 6" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label={text.next}
                  onClick={goNext}
                  className="inline-flex items-center justify-center rounded-full border border-stone-temple bg-white p-3 text-brown-dark transition hover:border-saffron hover:text-saffron"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 18L15 12L9 6" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
