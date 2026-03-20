'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { pickLanguage } from '@/lib/i18n';
import AdminSignOutButton from './AdminSignOutButton';

const copy = {
  en: {
    title: 'Admin Console',
    subtitle: 'Operations and review',
    dashboard: 'Dashboard',
    members: 'Members',
    donations: 'Donations',
    contact: 'Contact Messages',
    users: 'Users',
    aboutUs: 'About Us',
    banners: 'Banners',
    events: 'Events',
    activity: 'Activity',
    settings: 'Settings',
  },
  hi: {
    title: 'एडमिन कंसोल',
    subtitle: 'संचालन और समीक्षा',
    dashboard: 'डैशबोर्ड',
    members: 'सदस्य',
    donations: 'दान',
    contact: 'संपर्क संदेश',
    users: 'उपयोगकर्ता',
    aboutUs: 'हमारे बारे में',
    banners: 'बैनर',
    events: 'कार्यक्रम',
    activity: 'गतिविधि',
    settings: 'सेटिंग्स',
  },
  mr: {
    title: 'अॅडमिन कन्सोल',
    subtitle: 'संचालन आणि पुनरावलोकन',
    dashboard: 'डॅशबोर्ड',
    members: 'सदस्य',
    donations: 'देणग्या',
    contact: 'संपर्क संदेश',
    users: 'वापरकर्ते',
    aboutUs: 'आमच्याविषयी',
    banners: 'बॅनर',
    events: 'कार्यक्रम',
    activity: 'उपक्रम',
    settings: 'सेटिंग्ज',
  },
} as const;

interface AdminSidebarProps {
  userName: string;
}

export default function AdminSidebar({ userName }: AdminSidebarProps) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);

  const links = [
    { href: '/admin', label: text.dashboard },
    { href: '/admin/members', label: text.members },
    { href: '/admin/donations', label: text.donations },
    { href: '/admin/contact-messages', label: text.contact },
    { href: '/admin/users', label: text.users },
    { href: '/admin/about-us', label: text.aboutUs },
    { href: '/admin/banners', label: text.banners },
    { href: '/admin/events', label: text.events },
    { href: '/admin/activity', label: text.activity },
    { href: '/admin/settings', label: text.settings },
  ];

  return (
    <aside className="rounded-3xl border border-stone-temple/80 bg-white/90 p-5 shadow-lg shadow-saffron/5">
      <div className="border-b border-stone-temple pb-4">
        <p className="font-heading text-2xl text-brown-dark">{text.title}</p>
        <p className="mt-1 text-sm text-brown-dark/65">{text.subtitle}</p>
        <p className="mt-3 rounded-2xl bg-saffron/10 px-3 py-2 text-sm font-medium text-saffron">{userName}</p>
      </div>

      <nav className="mt-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive ? 'bg-saffron text-white shadow' : 'text-brown-dark hover:bg-stone-temple'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 border-t border-stone-temple pt-4">
        <AdminSignOutButton />
      </div>
    </aside>
  );
}
