'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import SiteLogo from '@/components/shared/SiteLogo';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { pickLanguage } from '@/lib/i18n';

const copy = {
  en: {
    badge: 'Jai Shri Ram',
    title: 'Hindu Shuraksha Seva Sangh',
    subtitle: 'Seva, Suraksha, Sangathan',
    description:
      'Dedicated to the protection and promotion of Hindu culture, values, and community welfare across the state.',
    primary: 'Become a Member',
    secondary: 'Donate Now',
  },
  hi: {
    badge: 'जय श्री राम',
    title: 'हिंदू सुरक्षा सेवा संघ',
    subtitle: 'सेवा, सुरक्षा, संगठन',
    description:
      'राज्यभर में हिंदू संस्कृति, मूल्यों और समाज कल्याण की रक्षा और संवर्धन के लिए समर्पित।',
    primary: 'सदस्य बनें',
    secondary: 'अभी दान करें',
  },
  mr: {
    badge: 'जय श्री राम',
    title: 'हिंदू सुरक्षा सेवा संघ',
    subtitle: 'सेवा, सुरक्षा, संघटन',
    description:
      'राज्यभर हिंदू संस्कृती, मूल्ये आणि समाजकल्याणाच्या संरक्षण व संवर्धनासाठी समर्पित.',
    primary: 'सदस्य बना',
    secondary: 'आता देणगी द्या',
  },
} as const;

export default function HeroSection() {
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);

  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-saffron via-saffron-deep to-maroon-deep" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-accent text-[40rem] text-white">
          Om
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
        <div className="mb-6 flex justify-center">
          <SiteLogo
            size={132}
            priority
            framed
            className="rounded-[2rem] bg-white/92 p-3 shadow-2xl shadow-brown-dark/20"
          />
        </div>

        <div className="mb-6">
          <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            {text.badge}
          </span>
        </div>

        <h1 className="mb-6 font-heading text-4xl leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          {text.title}
        </h1>

        <p className="mb-4 font-accent text-xl text-gold-temple sm:text-2xl">{text.subtitle}</p>

        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/90 sm:text-xl">
          {text.description}
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/member-apply"
            className="rounded-lg bg-white px-8 py-3 text-lg font-semibold text-saffron-deep shadow-lg transition-colors hover:bg-cream"
          >
            {text.primary}
          </Link>
          <Link href="/donate" className="btn-gold px-8 py-3 text-lg shadow-lg">
            {text.secondary}
          </Link>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 110C120 100 240 80 360 75C480 70 600 80 720 85C840 90 960 90 1080 85C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="#FFF8F0"
          />
        </svg>
      </div>
    </section>
  );
}
