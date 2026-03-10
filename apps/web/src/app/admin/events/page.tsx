import { cookies } from 'next/headers';
import Link from 'next/link';
import AdminEventForm from '@/components/admin/AdminEventForm';
import { formatDisplayDateTime } from '@/lib/format';
import { getIntlLocale, getLanguageFromCookiesStore, getStatusLabel, pickLanguage } from '@/lib/i18n';
import { getAdminEventsData } from '@/lib/services/admin-dashboard';

const copy = {
  en: {
    title: 'Event catalogue',
    description: 'Published and draft event records available in the system.',
    event: 'Event',
    date: 'Date',
    venue: 'Venue',
    published: 'Published',
    frontend: 'Frontend',
    view: 'View',
    video: 'Video uploaded',
    noData: 'No events found.',
  },
  hi: {
    title: '????????? ????',
    description: '?????? ??? ?????? ???????? ?? ??????? ????????? ????????',
    event: '?????????',
    date: '????',
    venue: '?????',
    published: '????????',
    frontend: '????????',
    view: '?????',
    video: '?????? ?????',
    noData: '??? ????????? ???? ?????',
  },
} as const;

export default async function AdminEventsPage() {
  const language = getLanguageFromCookiesStore(cookies());
  const locale = getIntlLocale(language);
  const text = pickLanguage(language, copy);
  const events = await getAdminEventsData();

  return (
    <div className="space-y-6">
      <AdminEventForm />

      <section className="surface-panel px-6 py-6">
        <h2 className="section-title">{text.title}</h2>
        <p className="mt-3 text-sm leading-7 text-brown-dark/70">{text.description}</p>

        {events.length ? (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-stone-temple text-left text-brown-dark/70">
                  <th className="px-3 py-3">{text.event}</th>
                  <th className="px-3 py-3">{text.date}</th>
                  <th className="px-3 py-3">{text.venue}</th>
                  <th className="px-3 py-3">{text.published}</th>
                  <th className="px-3 py-3">{text.frontend}</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-stone-temple/60">
                    <td className="px-3 py-4">
                      <p className="font-semibold text-brown-dark">{event.title}</p>
                      <p className="mt-1 text-brown-dark/65">/{event.slug}</p>
                      {event.videoUrl ? (
                        <p className="mt-1 text-xs font-medium text-saffron">{text.video}</p>
                      ) : null}
                    </td>
                    <td className="px-3 py-4 text-brown-dark/70">{formatDisplayDateTime(event.date, locale)}</td>
                    <td className="px-3 py-4 text-brown-dark/70">{event.venue || '-'}</td>
                    <td className="px-3 py-4 text-brown-dark/70">
                      {getStatusLabel(event.isPublished ? 'PUBLISHED' : 'DRAFT', language)}
                    </td>
                    <td className="px-3 py-4 text-brown-dark/70">
                      {event.isPublished ? (
                        <Link
                          href={`/events/${event.slug}`}
                          className="text-sm font-semibold text-saffron"
                          target="_blank"
                        >
                          {text.view}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-6 text-sm text-brown-dark/70">{text.noData}</p>
        )}
      </section>
    </div>
  );
}
