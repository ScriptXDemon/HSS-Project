'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SiteLogo from '@/components/shared/SiteLogo';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { pickLanguage } from '@/lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import MobileMenu from './MobileMenu';

const copy = {
  en: {
    brand: 'Hindu Shuraksha Seva Sangh',
    tagline: 'Seva and Sangathan',
    home: 'Home',
    about: 'About Us',
    events: 'Events',
    activity: 'Activity',
    donate: 'Donate',
    join: 'Join Us',
    contact: 'Contact',
    login: 'Login',
    openMenu: 'Open menu',
  },
  hi: {
    brand: 'हिंदू सुरक्षा सेवा संघ',
    tagline: 'सेवा और संगठन',
    home: 'होम',
    about: 'हमारे बारे में',
    events: 'कार्यक्रम',
    activity: 'गतिविधि',
    donate: 'दान',
    join: 'सदस्य बनें',
    contact: 'संपर्क',
    login: 'लॉगिन',
    openMenu: 'मेनू खोलें',
  },
  mr: {
    brand: 'हिंदू सुरक्षा सेवा संघ',
    tagline: 'सेवा आणि संघटन',
    home: 'मुख्यपृष्ठ',
    about: 'आमच्याविषयी',
    events: 'कार्यक्रम',
    activity: 'उपक्रम',
    donate: 'दान',
    join: 'सदस्य व्हा',
    contact: 'संपर्क',
    login: 'लॉगिन',
    openMenu: 'मेनू उघडा',
  },
} as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);

  const navLinks = useMemo(
    () => [
      { href: '/', label: text.home },
      { href: '/about', label: text.about },
      { href: '/events', label: text.events },
      { href: '/activity', label: text.activity },
      { href: '/donate', label: text.donate },
      { href: '/member-apply', label: text.join },
      { href: '/contact', label: text.contact },
    ],
    [text]
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const bgClass = scrolled || !isHome ? 'bg-white shadow-md' : 'bg-transparent';
  const textClass = scrolled || !isHome ? 'text-brown-dark' : 'text-white';

  return (
    <>
      <nav className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${bgClass}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-20">
            <Link href="/" className="flex items-center space-x-3">
              <SiteLogo
                size={isHome && !scrolled ? 54 : 48}
                priority
                framed={isHome && !scrolled}
                className="transition-all duration-300"
              />
              <div className={`hidden sm:block ${textClass}`}>
                <p className="font-heading text-lg leading-tight lg:text-xl">{text.brand}</p>
                <p className="text-xs opacity-75">{text.tagline}</p>
              </div>
            </Link>

            <div className="hidden items-center space-x-1 lg:flex">
              <LanguageSwitcher inverted={isHome && !scrolled} />
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'font-bold text-saffron'
                      : `${textClass} hover:text-saffron`
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/login" className="btn-primary ml-4 px-4 py-2 text-sm">
                {text.login}
              </Link>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <LanguageSwitcher compact inverted={isHome && !scrolled} />
              <button
                onClick={() => setMobileOpen(true)}
                className={`rounded-md p-2 ${textClass}`}
                aria-label={text.openMenu}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={navLinks}
        pathname={pathname}
      />
    </>
  );
}
