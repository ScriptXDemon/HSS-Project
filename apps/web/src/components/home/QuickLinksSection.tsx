'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { pickLanguage } from '@/lib/i18n';

const copy = {
  en: {
    title: 'Quick Access',
    items: [
      { href: '/member-apply', label: 'Join as Member', icon: 'Join', color: 'bg-saffron' },
      { href: '/events', label: 'Upcoming Events', icon: 'Events', color: 'bg-sacred-red' },
      { href: '/gallery', label: 'Photo Gallery', icon: 'Gallery', color: 'bg-gold-temple' },
      { href: '/id-card', label: 'Download ID Card', icon: 'ID', color: 'bg-maroon-deep' },
      { href: '/important-links', label: 'Important Links', icon: 'Links', color: 'bg-saffron-deep' },
      { href: '/contact', label: 'Contact Us', icon: 'Help', color: 'bg-brown-dark' },
    ],
  },
  hi: {
    title: 'त्वरित पहुँच',
    items: [
      { href: '/member-apply', label: 'सदस्यता लें', icon: 'जुड़ें', color: 'bg-saffron' },
      { href: '/events', label: 'आगामी कार्यक्रम', icon: 'कार्य', color: 'bg-sacred-red' },
      { href: '/gallery', label: 'फोटो गैलरी', icon: 'गैलरी', color: 'bg-gold-temple' },
      { href: '/id-card', label: 'आईडी कार्ड डाउनलोड', icon: 'आईडी', color: 'bg-maroon-deep' },
      { href: '/important-links', label: 'महत्वपूर्ण लिंक', icon: 'लिंक', color: 'bg-saffron-deep' },
      { href: '/contact', label: 'संपर्क करें', icon: 'सहायता', color: 'bg-brown-dark' },
    ],
  },
  mr: {
    title: 'त्वरित प्रवेश',
    items: [
      { href: '/member-apply', label: 'सदस्य व्हा', icon: 'जॉईन', color: 'bg-saffron' },
      { href: '/events', label: 'आगामी कार्यक्रम', icon: 'कार्यक्रम', color: 'bg-sacred-red' },
      { href: '/gallery', label: 'फोटो गॅलरी', icon: 'गॅलरी', color: 'bg-gold-temple' },
      { href: '/id-card', label: 'ओळखपत्र डाउनलोड', icon: 'आयडी', color: 'bg-maroon-deep' },
      { href: '/important-links', label: 'महत्त्वाचे दुवे', icon: 'दुवे', color: 'bg-saffron-deep' },
      { href: '/contact', label: 'संपर्क करा', icon: 'मदत', color: 'bg-brown-dark' },
    ],
  },
} as const;

export default function QuickLinksSection() {
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl text-brown-dark mb-4">{text.title}</h2>
          <div className="w-24 h-1 bg-saffron mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {text.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card p-4 text-center hover:shadow-lg transition-all hover:-translate-y-1 group"
            >
              <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <span className="text-xs font-semibold text-white uppercase tracking-[0.16em]">
                  {item.icon}
                </span>
              </div>
              <p className="text-sm font-medium text-brown-dark">{item.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
