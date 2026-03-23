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
    thumbnails: 'Banner thumbnails',
  },
  hi: {
    next: 'अगला बैनर',
    previous: 'पिछला बैनर',
    fallbackTitle: 'हिंदू सुरक्षा सेवा संघ',
    thumbnails: 'बैनर थंबनेल',
  },
  mr: {
    next: 'पुढील बॅनर',
    previous: 'मागील बॅनर',
    fallbackTitle: 'हिंदू सुरक्षा सेवा संघ',
    thumbnails: 'बॅनर थंबनेल',
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
    }, 6000);

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
    <section className="relative overflow-hidden bg-[#120804] pt-16 lg:pt-20">
      <div className="relative min-h-[48vh] md:min-h-[60vh] xl:min-h-[72vh]">
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
                className="object-contain object-center"
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_28%)]" />
              <div className="absolute inset-0 bg-gradient-to-r from-brown-dark/18 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/26 via-transparent to-transparent" />
            </div>
          );
        })}

        {safeBanners.length > 1 ? (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8">
              <button
                type="button"
                aria-label={text.previous}
                onClick={goPrevious}
                className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/20 text-white backdrop-blur transition hover:border-white/45 hover:bg-black/35"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M15 18L9 12L15 6" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>

              <button
                type="button"
                aria-label={text.next}
                onClick={goNext}
                className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/20 text-white backdrop-blur transition hover:border-white/45 hover:bg-black/35"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 18L15 12L9 6" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4 sm:px-6 sm:pb-5 lg:px-8 lg:pb-6">
              <div className="mx-auto flex max-w-7xl justify-end">
                <div
                  className="flex max-w-full items-center gap-2 overflow-x-auto rounded-[1.25rem] border border-white/10 bg-black/14 px-2 py-2 backdrop-blur"
                  aria-label={text.thumbnails}
                >
                  {safeBanners.map((banner, index) => (
                    <button
                      key={banner.id}
                      type="button"
                      onClick={() => goTo(index)}
                      className={`relative h-12 w-20 shrink-0 overflow-hidden rounded-lg border transition sm:h-14 sm:w-24 ${
                        index === activeIndex
                          ? 'border-gold-temple shadow-lg shadow-gold-temple/20'
                          : 'border-white/15 opacity-70 hover:opacity-100'
                      }`}
                      aria-label={`${index + 1}`}
                    >
                      <Image
                        src={banner.imageUrl}
                        alt={banner.title || `${text.fallbackTitle} ${index + 1}`}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                      <div
                        className={`absolute inset-0 ${
                          index === activeIndex ? 'bg-transparent' : 'bg-brown-dark/18'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
