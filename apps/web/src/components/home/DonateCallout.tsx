'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { pickLanguage } from '@/lib/i18n';

const copy = {
  en: {
    title: 'Support the Sangh',
    description:
      'Choose a seva cause or make a direct contribution to strengthen events, outreach, bhandhara, and community welfare.',
    primary: 'Donate Now',
    secondary: 'View Donors',
  },
  hi: {
    title: 'संघ को सहयोग दें',
    description:
      'सेवा के किसी उद्देश्य को चुनें या कार्यक्रम, जनसंपर्क, भंडारा और समाज कल्याण के लिए प्रत्यक्ष दान करें।',
    primary: 'अभी दान करें',
    secondary: 'दाता सूची देखें',
  },
  mr: {
    title: 'संघाला सहकार्य करा',
    description:
      'सेवेचे कारण निवडा किंवा कार्यक्रम, जनसंपर्क, भंडारा आणि समाजकल्याणासाठी थेट देणगी द्या.',
    primary: 'आता दान करा',
    secondary: 'दाता सूची पहा',
  },
} as const;

export default function DonateCallout() {
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);

  return (
    <section className="section-padding bg-stone-temple">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="font-heading text-3xl text-brown-dark sm:text-4xl">{text.title}</h2>
        <div className="mx-auto mb-6 mt-4 h-1 w-24 rounded-full bg-gold-temple" />
        <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-brown-dark/70">{text.description}</p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/donate" className="btn-primary px-8 py-3 text-lg">
            {text.primary}
          </Link>
          <Link href="/donors" className="btn-secondary px-8 py-3 text-lg">
            {text.secondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
