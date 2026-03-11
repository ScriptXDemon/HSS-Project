'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import SiteLogo from '@/components/shared/SiteLogo';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { pickLanguage } from '@/lib/i18n';

const copy = {
  en: {
    brand: 'Hindu Suraksha Sangh',
    tagline: 'Seva and Sangathan',
    description:
      'Dedicated to the protection and promotion of Hindu culture, values, and community welfare across the state.',
    quickLinks: 'Quick Links',
    contact: 'Contact Us',
    office: 'State Office, India',
    rights: 'All rights reserved.',
    salutation: 'Jai Shri Ram',
    about: 'About Us',
    events: 'Events',
    gallery: 'Gallery',
    donate: 'Donate',
    join: 'Join Us',
    contactLink: 'Contact',
    importantLinks: 'Important Links',
    donors: 'Our Donors',
  },
  hi: {
    brand: 'हिंदू सुरक्षा संघ',
    tagline: 'सेवा और संगठन',
    description:
      'राज्यभर में हिंदू संस्कृति, मूल्यों और समाज कल्याण की रक्षा और संवर्धन के लिए समर्पित।',
    quickLinks: 'त्वरित लिंक',
    contact: 'संपर्क करें',
    office: 'राज्य कार्यालय, भारत',
    rights: 'सर्वाधिकार सुरक्षित।',
    salutation: 'जय श्री राम',
    about: 'हमारे बारे में',
    events: 'कार्यक्रम',
    gallery: 'गैलरी',
    donate: 'दान',
    join: 'सदस्य बनें',
    contactLink: 'संपर्क',
    importantLinks: 'महत्वपूर्ण लिंक',
    donors: 'दाता सूची',
  },
  mr: {
    brand: 'हिंदू सुरक्षा संघ',
    tagline: 'सेवा आणि संघटन',
    description:
      'राज्यभर हिंदू संस्कृती, मूल्ये आणि समाजकल्याणाच्या संरक्षण व संवर्धनासाठी समर्पित.',
    quickLinks: 'त्वरित दुवे',
    contact: 'संपर्क',
    office: 'राज्य कार्यालय, भारत',
    rights: 'सर्व हक्क राखीव.',
    salutation: 'जय श्री राम',
    about: 'आमच्याविषयी',
    events: 'कार्यक्रम',
    gallery: 'गॅलरी',
    donate: 'दान',
    join: 'सदस्य व्हा',
    contactLink: 'संपर्क',
    importantLinks: 'महत्त्वाचे दुवे',
    donors: 'दाता सूची',
  },
} as const;

export default function Footer() {
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);

  const quickLinks = [
    { href: '/about', label: text.about },
    { href: '/events', label: text.events },
    { href: '/gallery', label: text.gallery },
    { href: '/donate', label: text.donate },
    { href: '/member-apply', label: text.join },
    { href: '/contact', label: text.contactLink },
    { href: '/important-links', label: text.importantLinks },
    { href: '/donors', label: text.donors },
  ];

  return (
    <footer className="gradient-maroon text-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 text-[20rem] font-accent select-none pointer-events-none">
        Om
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <SiteLogo size={58} framed />
              <div>
                <p className="font-heading text-xl">{text.brand}</p>
                <p className="text-sm opacity-75 font-accent">{text.tagline}</p>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{text.description}</p>
          </div>

          <div>
            <h3 className="font-heading text-gold-temple text-lg mb-4">{text.quickLinks}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-saffron transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-gold-temple text-lg mb-4">{text.contact}</h3>
            <div className="space-y-3 text-sm text-white/70">
              <p>{text.brand}</p>
              <p>{text.office}</p>
              <p>
                Email:{' '}
                <a href="mailto:info@hindusuraksha.org" className="hover:text-saffron transition-colors">
                  info@hindusuraksha.org
                </a>
              </p>
              <p>
                Phone:{' '}
                <a href="tel:+911234567890" className="hover:text-saffron transition-colors">
                  +91 12345 67890
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/50">
            &copy; {new Date().getFullYear()} {text.brand}. {text.rights}
          </p>
          <p className="text-sm text-white/50 font-accent">{text.salutation}</p>
        </div>
      </div>
    </footer>
  );
}
