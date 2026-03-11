import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import PageHero from '@/components/shared/PageHero';
import EmptyState from '@/components/shared/EmptyState';
import PaginationControls from '@/components/shared/PaginationControls';
import { formatDisplayDateTime } from '@/lib/format';
import { getIntlLocale, getLanguageFromCookiesStore, pickLanguage } from '@/lib/i18n';
import { getEvents } from '@/lib/services/public-content';

export const dynamic = 'force-dynamic';

const copy = {
  en: {
    eyebrow: 'Events',
    title: 'Track upcoming gatherings and revisit past programmes',
    description:
      'Discover published events, local gatherings, and organisational activities across the calendar.',
    upcomingTab: 'Upcoming Events',
    pastTab: 'Past Archive',
    upcomingLabel: 'Upcoming',
    pastLabel: 'Completed',
    viewDetails: 'View details',
    emptyUpcoming: 'No upcoming events published',
    emptyPast: 'No past events archived',
    emptyDescription: 'Published events will appear here once they are created in the admin panel.',
    placeholder: 'Event',
  },
  hi: {
    eyebrow: 'कार्यक्रम',
    title: 'आगामी आयोजनों पर नज़र रखें और पिछले कार्यक्रमों को देखें',
    description:
      'कैलेंडर के अनुसार प्रकाशित कार्यक्रमों, स्थानीय सभाओं और संगठनात्मक गतिविधियों को देखें।',
    upcomingTab: 'आगामी कार्यक्रम',
    pastTab: 'पुरालेख',
    upcomingLabel: 'आगामी',
    pastLabel: 'सम्पन्न',
    viewDetails: 'विवरण देखें',
    emptyUpcoming: 'कोई आगामी कार्यक्रम प्रकाशित नहीं है',
    emptyPast: 'कोई पुराना कार्यक्रम संग्रहित नहीं है',
    emptyDescription: 'एडमिन पैनल से कार्यक्रम बनने पर वे यहाँ दिखाई देंगे।',
    placeholder: 'कार्यक्रम',
  },
  mr: {
    eyebrow: 'कार्यक्रम',
    title: 'आगामी मेळावे पाहा आणि मागील कार्यक्रमांकडे पुन्हा नजर टाका',
    description:
      'कॅलेंडरनुसार प्रकाशित कार्यक्रम, स्थानिक सभा आणि संघटनात्मक उपक्रम पाहा.',
    upcomingTab: 'आगामी कार्यक्रम',
    pastTab: 'मागील संग्रह',
    upcomingLabel: 'आगामी',
    pastLabel: 'पूर्ण',
    viewDetails: 'तपशील पहा',
    emptyUpcoming: 'कोणतेही आगामी कार्यक्रम प्रकाशित नाहीत',
    emptyPast: 'कोणतेही जुने कार्यक्रम संग्रहित नाहीत',
    emptyDescription: 'अॅडमिन पॅनेलमधून कार्यक्रम तयार झाल्यावर ते येथे दिसतील.',
    placeholder: 'कार्यक्रम',
  },
} as const;

function resolveValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function resolvePage(value?: string | string[]) {
  const page = Number(resolveValue(value) || '1');
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: { scope?: string | string[]; page?: string | string[] };
}) {
  const language = getLanguageFromCookiesStore(await cookies());
  const text = pickLanguage(language, copy);
  const locale = getIntlLocale(language);
  const scope = resolveValue(searchParams?.scope) === 'past' ? 'past' : 'upcoming';
  const page = resolvePage(searchParams?.page);
  const events = await getEvents(scope, page, 9);

  return (
    <>
      <PageHero eyebrow={text.eyebrow} title={text.title} description={text.description} />

      <div className="page-content pb-16">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/events?scope=upcoming"
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              scope === 'upcoming'
                ? 'bg-saffron text-white'
                : 'bg-white text-brown-dark shadow-sm hover:bg-saffron/10'
            }`}
          >
            {text.upcomingTab}
          </Link>
          <Link
            href="/events?scope=past"
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              scope === 'past'
                ? 'bg-brown-dark text-white'
                : 'bg-white text-brown-dark shadow-sm hover:bg-brown-dark/10'
            }`}
          >
            {text.pastTab}
          </Link>
        </div>

        {events.data.length ? (
          <>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {events.data.map((event) => (
                <article key={event.id} className="surface-panel overflow-hidden">
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-saffron/15 to-gold-temple/10">
                    {event.coverImage ? (
                      <Image
                        src={event.coverImage}
                        alt={event.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl text-saffron/60">
                        {text.placeholder}
                      </div>
                    )}
                  </div>
                  <div className="px-6 py-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-saffron">
                      {scope === 'upcoming' ? text.upcomingLabel : text.pastLabel}
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-brown-dark">{event.title}</h2>
                    <p className="mt-3 text-sm text-brown-dark/70">
                      {formatDisplayDateTime(event.date, locale)}
                    </p>
                    {event.venue ? (
                      <p className="mt-1 text-sm text-brown-dark/60">{event.venue}</p>
                    ) : null}
                    <p className="mt-4 line-clamp-3 text-sm leading-7 text-brown-dark/75">
                      {event.description}
                    </p>
                    <Link
                      href={`/events/${event.slug}`}
                      className="mt-6 inline-flex text-sm font-semibold text-saffron"
                    >
                      {text.viewDetails}
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <PaginationControls pathname="/events" page={events.page} totalPages={events.totalPages} query={{ scope }} />
          </>
        ) : (
          <div className="mt-8">
            <EmptyState
              title={scope === 'upcoming' ? text.emptyUpcoming : text.emptyPast}
              description={text.emptyDescription}
            />
          </div>
        )}
      </div>
    </>
  );
}
