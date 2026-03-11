import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Poppins, Yatra_One, Tiro_Devanagari_Hindi } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LanguageProvider from '@/components/providers/LanguageProvider';
import { getLanguageFromCookiesStore } from '@/lib/i18n';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const yatraOne = Yatra_One({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-yatra-one',
  display: 'swap',
});

const tiroDevanagari = Tiro_Devanagari_Hindi({
  subsets: ['devanagari'],
  weight: '400',
  variable: '--font-tiro-devanagari',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Hindu Suraksha Sangh | हिन्दू सुरक्षा संघ',
    template: '%s | Hindu Suraksha Sangh',
  },
  description:
    'Hindu Suraksha Sangh - Dedicated to the protection and promotion of Hindu culture, values, and community welfare.',
  keywords: ['Hindu Suraksha Sangh', 'Hindu organization', 'membership', 'events', 'donate'],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = getLanguageFromCookiesStore(await cookies());

  return (
    <html lang={language}>
      <body
        className={`${poppins.variable} ${yatraOne.variable} ${tiroDevanagari.variable} antialiased`}
      >
        <LanguageProvider initialLanguage={language}>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
