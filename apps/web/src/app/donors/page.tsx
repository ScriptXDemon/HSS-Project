import { cookies } from 'next/headers';
import PageHero from '@/components/shared/PageHero';
import EmptyState from '@/components/shared/EmptyState';
import PaginationControls from '@/components/shared/PaginationControls';
import { formatDisplayDate, formatIndianCurrency } from '@/lib/format';
import { formatTemplate, getIntlLocale, getLanguageFromCookiesStore, pickLanguage } from '@/lib/i18n';
import { getPublicDonors } from '@/lib/services/public-content';

export const dynamic = 'force-dynamic';

const copy = {
  en: {
    eyebrow: 'Public Gratitude',
    title: 'Honouring contributors who strengthen the mission',
    description:
      'This public roll recognises non-anonymous successful contributions that support events, outreach, and service initiatives.',
    contributor: 'Contributor',
    contributedOn: 'Contributed on {date}',
    emptyTitle: 'No public donors yet',
    emptyDescription:
      'Completed non-anonymous donations will appear here once contributions begin to be recorded.',
  },
  hi: {
    eyebrow: 'सार्वजनिक आभार',
    title: 'मिशन को मजबूत करने वाले सहयोगकर्ताओं का सम्मान',
    description:
      'यह सार्वजनिक सूची उन गैर-गोपनीय सफल योगदानों को दर्शाती है जो कार्यक्रमों और सेवा गतिविधियों का समर्थन करते हैं।',
    contributor: 'योगदानकर्ता',
    contributedOn: '{date} को योगदान',
    emptyTitle: 'अभी कोई सार्वजनिक दाता नहीं है',
    emptyDescription: 'गैर-गोपनीय और सफल दान रिकॉर्ड होने पर यहाँ दिखाई देंगे।',
  },
} as const;

function resolvePage(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw || '1');
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function DonorsPage({
  searchParams,
}: {
  searchParams?: { page?: string | string[] };
}) {
  const language = getLanguageFromCookiesStore(cookies());
  const locale = getIntlLocale(language);
  const text = pickLanguage(language, copy);
  const page = resolvePage(searchParams?.page);
  const donors = await getPublicDonors(page, 20);

  return (
    <>
      <PageHero eyebrow={text.eyebrow} title={text.title} description={text.description} />

      <div className="page-content pb-16">
        {donors.data.length ? (
          <>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {donors.data.map((donor) => (
                <article key={donor.id} className="surface-panel px-6 py-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-saffron">{text.contributor}</p>
                      <h2 className="mt-2 text-xl font-semibold text-brown-dark">{donor.donorName}</h2>
                    </div>
                    <div className="rounded-2xl bg-saffron px-4 py-2 text-sm font-semibold text-white">
                      {formatIndianCurrency(donor.amount, locale)}
                    </div>
                  </div>
                  <p className="mt-5 text-sm text-brown-dark/65">
                    {formatTemplate(text.contributedOn, {
                      date: formatDisplayDate(donor.createdAt, undefined, locale),
                    })}
                  </p>
                </article>
              ))}
            </div>

            <PaginationControls pathname="/donors" page={donors.page} totalPages={donors.totalPages} />
          </>
        ) : (
          <EmptyState title={text.emptyTitle} description={text.emptyDescription} />
        )}
      </div>
    </>
  );
}
