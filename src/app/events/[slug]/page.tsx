import { cookies } from 'next/headers';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import EventShareActions from '@/components/events/EventShareActions';
import PageHero from '@/components/shared/PageHero';
import { formatDisplayDateTime } from '@/lib/format';
import { getIntlLocale, getLanguageFromCookiesStore, pickLanguage } from '@/lib/i18n';
import { getPublishedEventBySlug } from '@/lib/services/public-content';

export const dynamic = 'force-dynamic';

const copy = {
  en: {
    eyebrow: 'Event Detail',
    description: 'Full programme details, venue information, and easy sharing links for the published event.',
    placeholder: 'Event',
    overview: 'Event Overview',
    when: 'When',
    venue: 'Venue',
    media: 'Event Media',
    shareTitle: 'Share This Event',
    shareDescription: 'Invite others by sharing the event link directly or posting it to your networks.',
  },
  hi: {
    eyebrow: 'Event Detail',
    description: 'Full programme details, venue information, and easy sharing links for the published event.',
    placeholder: 'Event',
    overview: 'Event Overview',
    when: 'When',
    venue: 'Venue',
    media: 'Event Media',
    shareTitle: 'Share This Event',
    shareDescription: 'Invite others by sharing the event link directly or posting it to your networks.',
  },
} as const;

export default async function EventDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const language = getLanguageFromCookiesStore(cookies());
  const text = pickLanguage(language, copy);
  const locale = getIntlLocale(language);
  const event = await getPublishedEventBySlug(params.slug);

  if (!event) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const shareUrl = `${siteUrl.replace(/\/$/, '')}/events/${event.slug}`;

  return (
    <>
      <PageHero eyebrow={text.eyebrow} title={event.title} description={text.description} />

      <div className="page-content pb-16">
        <article className="surface-panel overflow-hidden">
          <div className="relative aspect-[16/7] bg-gradient-to-r from-saffron/20 to-gold-temple/10">
            {event.coverImage ? (
              <Image
                src={event.coverImage}
                alt={event.title}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-5xl text-saffron/50">
                {text.placeholder}
              </div>
            )}
          </div>

          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
            <div>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-saffron/10 px-4 py-2 text-sm font-semibold text-saffron">
                  {formatDisplayDateTime(event.date, locale)}
                </span>
                {event.venue ? (
                  <span className="rounded-full bg-stone-temple px-4 py-2 text-sm font-semibold text-brown-dark">
                    {event.venue}
                  </span>
                ) : null}
              </div>

              <div className="mt-6 space-y-5 text-base leading-8 text-brown-dark/75">
                {event.description.split(/\n+/).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              {event.videoUrl ? (
                <section className="mt-8 rounded-3xl border border-stone-temple bg-stone-temple/20 p-4 sm:p-5">
                  <h2 className="text-xl font-semibold text-brown-dark">{text.media}</h2>
                  <div className="mt-4 overflow-hidden rounded-2xl bg-brown-dark">
                    <video controls preload="metadata" className="w-full" src={event.videoUrl} />
                  </div>
                </section>
              ) : null}
            </div>

            <aside className="space-y-6">
              <section className="rounded-3xl border border-stone-temple bg-stone-temple/35 px-5 py-6">
                <h2 className="text-xl font-semibold text-brown-dark">{text.overview}</h2>
                <dl className="mt-5 space-y-4 text-sm text-brown-dark/75">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.2em] text-saffron">{text.when}</dt>
                    <dd className="mt-2 text-base font-medium text-brown-dark">
                      {formatDisplayDateTime(event.date, locale)}
                    </dd>
                  </div>
                  {event.venue ? (
                    <div>
                      <dt className="text-xs uppercase tracking-[0.2em] text-saffron">{text.venue}</dt>
                      <dd className="mt-2 text-base font-medium text-brown-dark">{event.venue}</dd>
                    </div>
                  ) : null}
                </dl>
              </section>

              <section className="rounded-3xl border border-stone-temple bg-white px-5 py-6">
                <h2 className="text-xl font-semibold text-brown-dark">{text.shareTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-brown-dark/70">{text.shareDescription}</p>
                <div className="mt-5">
                  <EventShareActions title={event.title} shareUrl={shareUrl} />
                </div>
              </section>
            </aside>
          </div>
        </article>
      </div>
    </>
  );
}
