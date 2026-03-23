'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useRouteTransition } from '@/components/providers/RouteTransitionProvider';
import { pickLanguage } from '@/lib/i18n';

const copy = {
  en: {
    welcome: 'Welcome Back',
    subtitle: 'Sign in to your account',
    identifier: 'Email',
    identifierPlaceholder: 'your@email.com',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    invalid: 'Invalid credentials',
    error: 'An error occurred. Please try again.',
    submit: 'Sign In',
    submitting: 'Signing in...',
    joinPrompt: "Don't have an account?",
    joinLink: 'Join Us',
    loading: 'Loading...',
  },
  hi: {
    welcome: 'फिर से स्वागत है',
    subtitle: 'अपने खाते में लॉगिन करें',
    identifier: 'ईमेल',
    identifierPlaceholder: 'your@email.com',
    password: 'पासवर्ड',
    passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
    invalid: 'अमान्य जानकारी',
    error: 'एक त्रुटि हुई। कृपया पुनः प्रयास करें।',
    submit: 'लॉगिन करें',
    submitting: 'लॉगिन हो रहा है...',
    joinPrompt: 'क्या आपका खाता नहीं है?',
    joinLink: 'सदस्य बनें',
    loading: 'लोड हो रहा है...',
  },
  mr: {
    welcome: 'पुन्हा स्वागत आहे',
    subtitle: 'आपल्या खात्यात लॉगिन करा',
    identifier: 'ईमेल',
    identifierPlaceholder: 'your@email.com',
    password: 'पासवर्ड',
    passwordPlaceholder: 'आपला पासवर्ड टाका',
    invalid: 'अवैध माहिती',
    error: 'एक त्रुटी आली. कृपया पुन्हा प्रयत्न करा.',
    submit: 'लॉगिन करा',
    submitting: 'लॉगिन होत आहे...',
    joinPrompt: 'आपले खाते नाही का?',
    joinLink: 'सदस्य व्हा',
    loading: 'लोड होत आहे...',
  },
} as const;

function LoginForm() {
  const router = useRouter();
  const { startLoading } = useRouteTransition();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        identifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(text.invalid);
      } else {
        const sessionResponse = await fetch('/api/auth/session', { cache: 'no-store' });
        const session = (await sessionResponse.json().catch(() => null)) as
          | { user?: { role?: string } }
          | null;
        const destination =
          callbackUrl === '/' && session?.user?.role && ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)
            ? '/admin'
            : callbackUrl;
        startLoading();
        router.push(destination);
        router.refresh();
      }
    } catch {
      setError(text.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream pt-20 px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-saffron rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-heading text-2xl">Om</span>
            </div>
            <h1 className="font-heading text-2xl text-brown-dark">{text.welcome}</h1>
            <p className="text-sm text-brown-dark/60 mt-1">{text.subtitle}</p>
          </div>

          {error ? (
            <div className="bg-sacred-red/10 border border-sacred-red/30 text-sacred-red text-sm rounded-lg p-3 mb-6">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-brown-dark mb-1">
                {text.identifier}
              </label>
              <input
                id="identifier"
                type="email"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                required
                className="w-full px-4 py-2.5 border border-stone-temple rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron outline-none transition-colors bg-white"
                placeholder={text.identifierPlaceholder}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brown-dark mb-1">
                {text.password}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full px-4 py-2.5 border border-stone-temple rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron outline-none transition-colors bg-white"
                placeholder={text.passwordPlaceholder}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? text.submitting : text.submit}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-brown-dark/60">
            {text.joinPrompt}{' '}
            <Link href="/member-apply" className="text-saffron hover:text-saffron-deep font-medium">
              {text.joinLink}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { language } = useLanguage();
  const text = pickLanguage(language, copy);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-cream pt-20">
          {text.loading}
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
