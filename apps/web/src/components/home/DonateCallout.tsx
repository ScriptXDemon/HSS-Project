'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { pickLanguage } from '@/lib/i18n';

const copy = {
  en: {
    title: 'Support Our Cause',
    description:
      'Your generous donations help us organize events, support community programs, and protect Hindu culture and heritage.',
    primary: 'Donate Now',
    secondary: 'View Our Donors',
  },
  hi: {
    title: 'हमारे उद्देश्य का समर्थन करें',
    description:
      'आपका उदार दान कार्यक्रमों, समाज सेवा योजनाओं और हिंदू संस्कृति व विरासत की रक्षा में सहायक है।',
    primary: 'अभी दान करें',
    secondary: 'दाता सूची देखें',
  },
  mr: {
    title: 'आमच्या ध्येयाला पाठिंबा द्या',
    description:
      'आपली उदार देणगी कार्यक्रम, समाजसेवा उपक्रम आणि हिंदू संस्कृती व वारसा संरक्षणासाठी मदत करते.',
    primary: 'आता देणगी द्या',
    secondary: 'दाता सूची पहा',
  },
} as const;

export default function DonateCallout() {
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);

  return (
    <section className="section-padding bg-stone-temple">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-heading text-3xl sm:text-4xl text-brown-dark mb-4">{text.title}</h2>
        <div className="w-24 h-1 bg-gold-temple mx-auto rounded-full mb-6" />
        <p className="text-brown-dark/70 mb-8 text-lg leading-relaxed max-w-2xl mx-auto">
          {text.description}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/donate" className="btn-primary py-3 px-8 text-lg">
            {text.primary}
          </Link>
          <Link href="/donors" className="btn-secondary py-3 px-8 text-lg">
            {text.secondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
