'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { BannerDTO } from '@hss/domain';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { pickLanguage } from '@/lib/i18n';

interface HomeBannerCarouselProps {
  banners: BannerDTO[];
}

const copy = {
  en: {
    eyebrow: 'Jai Shri Ram',
    next: 'Next banner',
    previous: 'Previous banner',
    fallbackTitle: 'Hindu Shuraksha Seva Sangh',
    fallbackSubtitle: 'Seva, organisation, and dharmic public service.',
    fallbackCta: 'Join Us',
  },
  hi: {
    eyebrow: 'जय श्री राम',
    next: 'अगला बैनर',
    previous: 'पिछला बैनर',
    fallbackTitle: 'हिंदू सुरक्षा सेवा संघ',
    fallbackSubtitle: 'सेवा, संगठन और धर्म आधारित लोककार्य का संकल्प।',
    fallbackCta: 'हमसे जुड़ें',
  },
  mr: {
    eyebrow: 'जय श्री राम',
    next: 'पुढील बॅनर',
    previous: 'मागील बॅनर',
    fallbackTitle: 'हिंदू सुरक्षा सेवा संघ',
    fallbackSubtitle: 'सेवा, संघटन आणि धर्माधिष्ठित लोककार्यासाठी बांधिलकी.',
    fallbackCta: 'जोडा',
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
    <section className="page-shell pt-6">
      <div className="page-content">
        <div className="relative overflow-hidden rounded-[2rem] border border-saffron/20 bg-brown-dark shadow-2xl shadow-saffron/10">
          <div className="relative aspect-[16/8] min-h-[320px] w-full sm:aspect-[16/7] lg:aspect-[16/6]">
            {safeBanners.map((banner, index) => {
              const active = index === activeIndex;
              return (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-opacity duration-700 ${active ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                >
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title || text.fallbackTitle}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-brown-dark/85 via-brown-dark/45 to-brown-dark/10" />
                </div>
              );
            })}

            <div className="relative z-10 flex h-full flex-col justify-end p-6 sm:p-8 lg:p-12">
              <span className="eyebrow text-white/85">{text.eyebrow}</span>
              <h1 className="mt-4 max-w-3xl font-heading text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
                {safeBanners[activeIndex]?.title || text.fallbackTitle}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
                {safeBanners[activeIndex]?.subtitle || text.fallbackSubtitle}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href={safeBanners[activeIndex]?.ctaHref || '/member-apply'}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-saffron transition hover:bg-cream"
                >
                  {safeBanners[activeIndex]?.ctaLabel || text.fallbackCta}
                </Link>
                <div className="flex items-center gap-2">
                  {safeBanners.map((banner, index) => (
                    <button
                      key={banner.id}
                      type="button"
                      onClick={() => goTo(index)}
                      className={`h-2.5 rounded-full transition ${index === activeIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/45'}`}
                      aria-label={`${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {safeBanners.length > 1 ? (
              <>
                <button
                  type="button"
                  aria-label={text.previous}
                  onClick={goPrevious}
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/25 bg-white/10 p-3 text-white backdrop-blur transition hover:bg-white/20"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M15 18L9 12L15 6" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label={text.next}
                  onClick={goNext}
                  className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/25 bg-white/10 p-3 text-white backdrop-blur transition hover:bg-white/20"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 18L15 12L9 6" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
