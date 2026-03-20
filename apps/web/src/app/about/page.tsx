import { cookies } from 'next/headers';
import Image from 'next/image';
import PageHero from '@/components/shared/PageHero';
import { getLanguageFromCookiesStore } from '@/lib/i18n';
import { getAboutPageContent } from '@/lib/services/public-content';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const language = getLanguageFromCookiesStore(await cookies());
  const about = await getAboutPageContent(language);
  const { content, people } = about;

  return (
    <>
      <PageHero eyebrow={content.eyebrow} title={content.title} description={content.description} />

      <div className="page-content pb-16">
        <section className="surface-panel px-6 py-8 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-base leading-8 text-brown-dark/80">{content.intro}</p>
              <div className="mt-6 inline-flex rounded-full border border-saffron/20 bg-saffron/5 px-5 py-2 text-sm font-semibold text-saffron">
                {content.motto}
              </div>
            </div>
            <div className="rounded-[1.75rem] border border-stone-temple bg-stone-temple/25 p-6">
              <span className="eyebrow">{content.whyJoinTitle}</span>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-brown-dark/75">
                {content.whyJoinPoints.map((point, index) => (
                  <li key={`${point}-${index}`} className="flex gap-3">
                    <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-saffron" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <article className="surface-panel px-6 py-7">
            <span className="eyebrow">{content.mainWorkTitle}</span>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-brown-dark/75">
              {content.mainWorkPoints.map((point, index) => (
                <li key={`${point}-${index}`} className="flex gap-3">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-saffron" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="surface-panel px-6 py-7">
            <span className="eyebrow">{content.futureObjectivesTitle}</span>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-brown-dark/75">
              {content.futureObjectivesPoints.map((point, index) => (
                <li key={`${point}-${index}`} className="flex gap-3">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-gold-temple" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="mt-10 surface-panel px-6 py-8 sm:px-8">
          <span className="eyebrow">{content.conclusionTitle}</span>
          <p className="mt-4 text-base leading-8 text-brown-dark/80">{content.conclusion}</p>
        </section>

        <section className="mt-10 surface-panel px-6 py-8 sm:px-8">
          <div>
            <span className="eyebrow">{content.leadershipEyebrow}</span>
            <h2 className="section-title mt-4">{content.leadershipTitle}</h2>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {people.map((person) => (
              <article key={person.id} className="overflow-hidden rounded-3xl border border-stone-temple bg-stone-temple/30">
                <div className="relative aspect-[4/3] bg-gradient-to-br from-saffron/20 via-gold-temple/15 to-white">
                  {person.photoUrl ? (
                    <Image
                      src={person.photoUrl}
                      alt={person.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl font-heading text-saffron shadow-lg">
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
                <div className="px-6 py-5">
                  <h3 className="text-xl font-semibold text-brown-dark">{person.name}</h3>
                  <p className="mt-1 text-sm font-medium uppercase tracking-[0.18em] text-saffron">
                    {person.role}
                  </p>
                  {person.bio ? <p className="mt-4 text-sm leading-7 text-brown-dark/70">{person.bio}</p> : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
