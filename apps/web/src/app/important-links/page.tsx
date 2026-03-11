import { cookies } from 'next/headers';
import PageHero from '@/components/shared/PageHero';
import EmptyState from '@/components/shared/EmptyState';
import { getLanguageFromCookiesStore, pickLanguage } from '@/lib/i18n';
import { getImportantLinks } from '@/lib/services/public-content';

export const dynamic = 'force-dynamic';

const copy = {
  en: {
    eyebrow: 'Resources',
    title: 'Important links for members, volunteers, and the public',
    description:
      'A curated directory of official resources, partner references, and public information that supports organizational work and citizen outreach.',
    visit: 'Visit resource',
    emptyTitle: 'No links published yet',
    emptyDescription: 'Important links will appear here once the content team publishes them.',
  },
  hi: {
    eyebrow: 'संसाधन',
    title: 'सदस्यों, स्वयंसेवकों और जनता के लिए महत्वपूर्ण लिंक',
    description:
      'आधिकारिक संसाधनों, सहयोगी संदर्भों और सार्वजनिक जानकारी की एक चुनी हुई सूची।',
    visit: 'लिंक खोलें',
    emptyTitle: 'अभी कोई लिंक प्रकाशित नहीं है',
    emptyDescription: 'सामग्री टीम द्वारा प्रकाशित होने पर महत्वपूर्ण लिंक यहाँ दिखाई देंगे।',
  },
  mr: {
    eyebrow: 'संसाधने',
    title: 'सदस्य, स्वयंसेवक आणि जनतेसाठी महत्त्वाचे दुवे',
    description:
      'अधिकृत साधने, सहयोगी संदर्भ आणि सार्वजनिक माहितीसाठी निवडक दुव्यांची सूची.',
    visit: 'दुवा उघडा',
    emptyTitle: 'अजून कोणतेही दुवे प्रकाशित नाहीत',
    emptyDescription: 'सामग्री टीमने प्रकाशित केल्यानंतर महत्त्वाचे दुवे येथे दिसतील.',
  },
} as const;

export default async function ImportantLinksPage() {
  const language = getLanguageFromCookiesStore(await cookies());
  const text = pickLanguage(language, copy);
  const links = await getImportantLinks();

  return (
    <>
      <PageHero eyebrow={text.eyebrow} title={text.title} description={text.description} />

      <div className="page-content pb-16">
        {links.data.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {links.data.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="surface-panel group flex h-full flex-col justify-between px-6 py-6 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-saffron/10 text-xl text-saffron">
                    {link.icon || '->'}
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-brown-dark">{link.title}</h2>
                  <p className="mt-3 break-all text-sm leading-6 text-brown-dark/65">{link.url}</p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-saffron transition group-hover:translate-x-1">
                  {text.visit}
                  <span aria-hidden="true">/</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <EmptyState title={text.emptyTitle} description={text.emptyDescription} />
        )}
      </div>
    </>
  );
}
