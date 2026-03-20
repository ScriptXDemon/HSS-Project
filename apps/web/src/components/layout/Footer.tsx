'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import SiteLogo from '@/components/shared/SiteLogo';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { pickLanguage } from '@/lib/i18n';

const copy = {
  en: {
    brand: 'Hindu Shuraksha Seva Sangh',
    tagline: 'Seva and Sangathan',
    description:
      'Dedicated to the protection, service, and organisation of Hindu society through social action, dharmic awareness, and cultural commitment.',
    quickLinks: 'Quick Links',
    contact: 'Contact Us',
    office: 'State Office, India',
    rights: 'All rights reserved.',
    salutation: 'Jai Shri Ram',
    about: 'About Us',
    events: 'Events',
    activity: 'Activity',
    donate: 'Donate',
    join: 'Join Us',
    contactLink: 'Contact',
    importantLinks: 'Important Links',
    donors: 'Our Donors',
  },
  hi: {
    brand: 'हिंदू सुरक्षा सेवा संघ',
    tagline: 'सेवा और संगठन',
    description:
      'सामाजिक कार्य, धर्म जागरण और संस्कृति संरक्षण के माध्यम से हिंदू समाज की रक्षा, सेवा और संगठन के लिए समर्पित।',
    quickLinks: 'त्वरित लिंक',
    contact: 'संपर्क करें',
    office: 'राज्य कार्यालय, भारत',
    rights: 'सर्वाधिकार सुरक्षित।',
    salutation: 'जय श्री राम',
    about: 'हमारे बारे में',
    events: 'कार्यक्रम',
    activity: 'गतिविधि',
    donate: 'दान',
    join: 'सदस्य बनें',
    contactLink: 'संपर्क',
    importantLinks: 'महत्वपूर्ण लिंक',
    donors: 'दाता सूची',
  },
  mr: {
    brand: 'हिंदू सुरक्षा सेवा संघ',
    tagline: 'सेवा आणि संघटन',
    description:
      'सामाजिक कार्य, धर्मजागृती आणि संस्कृती संरक्षणाच्या माध्यमातून हिंदू समाजाच्या रक्षण, सेवेसाठी आणि संघटनासाठी समर्पित.',
    quickLinks: 'त्वरित दुवे',
    contact: 'संपर्क',
    office: 'राज्य कार्यालय, भारत',
    rights: 'सर्व हक्क राखीव.',
    salutation: 'जय श्री राम',
    about: 'आमच्याविषयी',
    events: 'कार्यक्रम',
    activity: 'उपक्रम',
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
    { href: '/activity', label: text.activity },
    { href: '/donate', label: text.donate },
    { href: '/member-apply', label: text.join },
    { href: '/contact', label: text.contactLink },
    { href: '/important-links', label: text.importantLinks },
    { href: '/donors', label: text.donors },
  ];

  return (
    <footer className="gradient-maroon relative overflow-hidden text-white">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-accent text-[20rem] opacity-5">
        Om
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center space-x-3">
              <SiteLogo size={58} framed />
              <div>
                <p className="font-heading text-xl">{text.brand}</p>
                <p className="font-accent text-sm opacity-75">{text.tagline}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/70">{text.description}</p>
          </div>

          <div>
            <h3 className="mb-4 font-heading text-lg text-gold-temple">{text.quickLinks}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/70 transition-colors hover:text-saffron">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-heading text-lg text-gold-temple">{text.contact}</h3>
            <div className="space-y-3 text-sm text-white/70">
              <p>{text.brand}</p>
              <p>{text.office}</p>
              <p>
                Email:{' '}
                <a href="mailto:info@hindushurakshasevasangh.org" className="transition-colors hover:text-saffron">
                  info@hindushurakshasevasangh.org
                </a>
              </p>
              <p>
                Phone:{' '}
                <a href="tel:+918793895012" className="transition-colors hover:text-saffron">
                  +91 87938 95012
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-white/50">
            &copy; {new Date().getFullYear()} {text.brand}. {text.rights}
          </p>
          <p className="font-accent text-sm text-white/50">{text.salutation}</p>
        </div>
      </div>
    </footer>
  );
}
