import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import EmptyState from '@/components/shared/EmptyState';
import PageHero from '@/components/shared/PageHero';
import PaginationControls from '@/components/shared/PaginationControls';
import { formatDisplayDate } from '@/lib/format';
import { formatTemplate, getIntlLocale, getLanguageFromCookiesStore, pickLanguage } from '@/lib/i18n';
import { getActivities } from '@/lib/services/public-content';

export const dynamic = 'force-dynamic';

const copy = {
  en: {
    eyebrow: 'Activity',
    title: 'Snapshots of service work, gatherings, and Sangh-led initiatives',
    description:
      'Browse published activity albums featuring image and video highlights from field work, seva drives, and organisational participation.',
    placeholder: 'Activity Album',
    items: '{count} items',
    published: 'Published {date}',
    emptyTitle: 'No activity albums published',
    emptyDescription: 'Activity albums will appear here once photos or videos are uploaded from the admin panel.',
  },
  hi: {
    eyebrow: 'गतिविधि',
    title: 'सेवा कार्यों, सभाओं और संघ की पहलों की झलकियाँ',
    description:
      'मैदान में किए गए कार्यों, सेवा अभियानों और संगठनात्मक गतिविधियों की छवि और वीडियो झलकियाँ देखें।',
    placeholder: 'गतिविधि एल्बम',
    items: '{count} आइटम',
    published: '{date} को प्रकाशित',
    emptyTitle: 'कोई गतिविधि एल्बम प्रकाशित नहीं है',
    emptyDescription: 'एडमिन पैनल से फोटो या वीडियो अपलोड होने पर गतिविधियाँ यहाँ दिखाई देंगी।',
  },
  mr: {
    eyebrow: 'उपक्रम',
    title: 'सेवा कार्य, मेळावे आणि संघाच्या उपक्रमांची झलक',
    description:
      'मैदानी काम, सेवा मोहिमा आणि संघटनात्मक सहभाग यांची छायाचित्रे आणि व्हिडिओ येथे पाहा.',
    placeholder: 'उपक्रम अल्बम',
    items: '{count} आयटम',
    published: '{date} रोजी प्रकाशित',
    emptyTitle: 'एकही उपक्रम अल्बम प्रकाशित नाही',
    emptyDescription: 'अॅडमिन पॅनेलमधून फोटो किंवा व्हिडिओ अपलोड झाल्यावर उपक्रम येथे दिसतील.',
  },
} as const;

function resolvePage(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw || '1');
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function ActivityPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string | string[] }>;
}) {
  const language = getLanguageFromCookiesStore(await cookies());
  const text = pickLanguage(language, copy);
  const locale = getIntlLocale(language);
  const params = (await searchParams) || {};
  const page = resolvePage(params.page);
  const activities = await getActivities(page, 12);

  return (
    <>
      <PageHero eyebrow={text.eyebrow} title={text.title} description={text.description} />

      <div className="page-content pb-16">
        {activities.data.length ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {activities.data.map((activity) => (
                <Link
                  key={activity.id}
                  href={`/activity/${activity.id}`}
                  className="surface-panel overflow-hidden transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-saffron/15 to-gold-temple/10">
                    {activity.previewUrl ? (
                      <Image
                        src={activity.previewUrl}
                        alt={activity.title}
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
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-2xl font-semibold text-brown-dark">{activity.title}</h2>
                      <span className="rounded-full bg-saffron/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-saffron">
                        {formatTemplate(text.items, { count: activity.itemCount })}
                      </span>
                    </div>
                    {activity.description ? (
                      <p className="mt-3 line-clamp-3 text-sm leading-7 text-brown-dark/75">
                        {activity.description}
                      </p>
                    ) : null}
                    <p className="mt-5 text-sm text-brown-dark/60">
                      {formatTemplate(text.published, {
                        date: formatDisplayDate(activity.createdAt, undefined, locale),
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <PaginationControls pathname="/activity" page={activities.page} totalPages={activities.totalPages} />
          </>
        ) : (
          <EmptyState title={text.emptyTitle} description={text.emptyDescription} />
        )}
      </div>
    </>
  );
}
