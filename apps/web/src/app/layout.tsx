import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Poppins, Yatra_One, Tiro_Devanagari_Hindi } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LanguageProvider from '@/components/providers/LanguageProvider';
import RouteTransitionProvider from '@/components/providers/RouteTransitionProvider';
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
    default: 'Hindu Shuraksha Seva Sangh | ????? ??????? ???? ???',
    template: '%s | Hindu Shuraksha Seva Sangh',
  },
  description:
    'Hindu Shuraksha Seva Sangh - Dedicated to social unity, service, and the protection of Hindu culture, values, and community welfare.',
  keywords: ['Hindu Shuraksha Seva Sangh', 'Hindu organization', 'membership', 'events', 'activity', 'donate'],
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
        <RouteTransitionProvider>
          <LanguageProvider initialLanguage={language}>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </LanguageProvider>
        </RouteTransitionProvider>
      </body>
    </html>
  );
}
