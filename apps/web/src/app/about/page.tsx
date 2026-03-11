import { cookies } from 'next/headers';
import Image from 'next/image';
import PageHero from '@/components/shared/PageHero';
import { getLanguageFromCookiesStore, pickLanguage } from '@/lib/i18n';
import { getAboutPageContent } from '@/lib/services/public-content';

export const dynamic = 'force-dynamic';

const copy = {
  en: {
    eyebrow: 'About HSS',
    title: 'A disciplined movement rooted in seva, heritage, and civic responsibility',
    description:
      'Learn the story, mission, and vision that guide Hindu Suraksha Sangh across community service, social unity, and cultural leadership.',
    leadershipEyebrow: 'Leadership',
    leadershipTitle: 'The team behind the mission',
    leadershipDescription:
      'These profiles are sourced from CMS content when available and fall back to a placeholder roster when no data has been published yet.',
  },
  hi: {
    eyebrow: 'एचएसएस के बारे में',
    title: 'सेवा, विरासत और नागरिक दायित्व पर आधारित एक अनुशासित आंदोलन',
    description:
      'हिंदू सुरक्षा संघ की कहानी, मिशन और दृष्टि को जानें जो समाज सेवा, सांस्कृतिक नेतृत्व और सामाजिक एकता का मार्गदर्शन करती है।',
    leadershipEyebrow: 'नेतृत्व',
    leadershipTitle: 'मिशन के पीछे की टीम',
    leadershipDescription:
      'ये प्रोफाइल उपलब्ध होने पर CMS सामग्री से ली जाती हैं, अन्यथा अस्थायी सूची दिखाई जाती है।',
  },
  mr: {
    eyebrow: 'एचएसएस विषयी',
    title: 'सेवा, परंपरा आणि नागरी जबाबदारीवर आधारलेली शिस्तबद्ध चळवळ',
    description:
      'हिंदू सुरक्षा संघाची कथा, ध्येय आणि दृष्टी जाणून घ्या जी समाजसेवा, सांस्कृतिक नेतृत्व आणि सामाजिक एकात्मतेला दिशा देते.',
    leadershipEyebrow: 'नेतृत्व',
    leadershipTitle: 'मिशनमागची टीम',
    leadershipDescription:
      'ही प्रोफाइल्स उपलब्ध असल्यास CMS मधून घेतली जातात, अन्यथा तात्पुरती यादी दाखवली जाते.',
  },
} as const;

export default async function AboutPage() {
  const language = getLanguageFromCookiesStore(await cookies());
  const text = pickLanguage(language, copy);
  const content = await getAboutPageContent(language);
  const sections = [content.history, content.mission, content.vision];

  return (
    <>
      <PageHero
        eyebrow={text.eyebrow}
        title={text.title}
        description={text.description}
      />

      <div className="page-content pb-16">
        <section className="grid gap-6 lg:grid-cols-3">
          {sections.map((section) => (
            <article key={section.title} className="surface-panel px-6 py-7">
              <span className="eyebrow">{section.title}</span>
              <p className="mt-5 text-sm leading-7 text-brown-dark/75">{section.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 surface-panel px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow">{text.leadershipEyebrow}</span>
              <h2 className="section-title mt-4">{text.leadershipTitle}</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-brown-dark/70">
              {text.leadershipDescription}
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {content.leadership.map((leader) => (
              <article
                key={`${leader.name}-${leader.role}`}
                className="overflow-hidden rounded-3xl border border-stone-temple bg-stone-temple/30"
              >
                <div className="relative aspect-[4/3] bg-gradient-to-br from-saffron/20 via-gold-temple/15 to-white">
                  {leader.photoUrl ? (
                    <Image
                      src={leader.photoUrl}
                      alt={leader.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl font-heading text-saffron shadow-lg">
                        {leader.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
                <div className="px-6 py-5">
                  <h3 className="text-xl font-semibold text-brown-dark">{leader.name}</h3>
                  <p className="mt-1 text-sm font-medium uppercase tracking-[0.18em] text-saffron">
                    {leader.role}
                  </p>
                  {leader.bio ? (
                    <p className="mt-4 text-sm leading-7 text-brown-dark/70">{leader.bio}</p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
