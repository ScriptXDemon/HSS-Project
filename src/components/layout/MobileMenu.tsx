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
    brand: 'Hindu Suraksha Sangh',
    tagline: 'Seva and Sangathan',
    closeMenu: 'Close menu',
    login: 'Login',
  },
  hi: {
    brand: 'हिंदू सुरक्षा संघ',
    tagline: 'सेवा और संगठन',
    closeMenu: 'मेनू बंद करें',
    login: 'लॉगिन',
  },
} as const;

export default function MobileMenu({ isOpen, onClose, links, pathname }: MobileMenuProps) {
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl animate-slide-in">
        <div className="flex items-center justify-between p-4 border-b border-stone-temple">
          <div className="flex items-center gap-3">
            <SiteLogo size={44} />
            <div>
              <p className="font-heading text-lg text-brown-dark">{text.brand}</p>
              <p className="text-xs text-brown-dark/60">{text.tagline}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-brown-dark" aria-label={text.closeMenu}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 pt-4">
          <LanguageSwitcher />
        </div>

        <nav className="p-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-saffron/10 text-saffron font-bold'
                  : 'text-brown-dark hover:bg-stone-temple'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-stone-temple">
          <Link href="/login" onClick={onClose} className="btn-primary block text-center w-full">
            {text.login}
          </Link>
        </div>
      </div>
    </div>
  );
}
