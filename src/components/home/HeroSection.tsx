'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import SiteLogo from '@/components/shared/SiteLogo';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { pickLanguage } from '@/lib/i18n';

const copy = {
  en: {
    badge: 'Jai Shri Ram',
    title: 'Hindu Suraksha Sangh',
    subtitle: 'Seva, Suraksha, Sangathan',
    description:
      'Dedicated to the protection and promotion of Hindu culture, values, and community welfare across the state.',
    primary: 'Become a Member',
    secondary: 'Donate Now',
  },
  hi: {
    badge: 'जय श्री राम',
    title: 'हिंदू सुरक्षा संघ',
    subtitle: 'सेवा, सुरक्षा, संगठन',
    description:
      'राज्यभर में हिंदू संस्कृति, मूल्यों और समाज कल्याण की रक्षा और संवर्धन के लिए समर्पित।',
    primary: 'सदस्य बनें',
    secondary: 'अभी दान करें',
  },
} as const;

export default function HeroSection() {
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-saffron via-saffron-deep to-maroon-deep" />

      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40rem] text-white font-accent select-none">
          Om
        </div>
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="mb-6 flex justify-center">
          <SiteLogo
            size={132}
            priority
            framed
            className="rounded-[2rem] bg-white/92 p-3 shadow-2xl shadow-brown-dark/20"
          />
        </div>

        <div className="mb-6">
          <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium">
            {text.badge}
          </span>
        </div>

        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight">
          {text.title}
        </h1>

        <p className="font-accent text-xl sm:text-2xl text-gold-temple mb-4">{text.subtitle}</p>

        <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
          {text.description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/member-apply"
            className="bg-white text-saffron-deep font-semibold py-3 px-8 rounded-lg hover:bg-cream transition-colors text-lg shadow-lg"
          >
            {text.primary}
          </Link>
          <Link href="/donate" className="btn-gold py-3 px-8 text-lg shadow-lg">
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
