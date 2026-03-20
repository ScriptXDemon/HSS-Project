'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import SiteLogo from '@/components/shared/SiteLogo';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { pickLanguage } from '@/lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links: { href: string; label: string }[];
  pathname: string;
}

const copy = {
  en: {
    brand: 'Hindu Shuraksha Seva Sangh',
    tagline: 'Seva and Sangathan',
    closeMenu: 'Close menu',
    login: 'Login',
  },
  hi: {
    brand: 'हिंदू सुरक्षा सेवा संघ',
    tagline: 'सेवा और संगठन',
    closeMenu: 'मेनू बंद करें',
    login: 'लॉगिन',
  },
  mr: {
    brand: 'हिंदू सुरक्षा सेवा संघ',
    tagline: 'सेवा आणि संघटन',
    closeMenu: 'मेनू बंद करा',
    login: 'लॉगिन',
  },
} as const;

export default function MobileMenu({ isOpen, onClose, links, pathname }: MobileMenuProps) {
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="animate-slide-in absolute right-0 top-0 h-full w-72 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-temple p-4">
          <div className="flex items-center gap-3">
            <SiteLogo size={44} />
            <div>
              <p className="font-heading text-lg text-brown-dark">{text.brand}</p>
              <p className="text-xs text-brown-dark/60">{text.tagline}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-brown-dark" aria-label={text.closeMenu}>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 pt-4">
          <LanguageSwitcher />
        </div>

        <nav className="space-y-1 p-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-saffron/10 font-bold text-saffron'
                  : 'text-brown-dark hover:bg-stone-temple'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-stone-temple p-4">
          <Link href="/login" onClick={onClose} className="btn-primary block w-full text-center">
            {text.login}
          </Link>
        </div>
      </div>
    </div>
  );
}
