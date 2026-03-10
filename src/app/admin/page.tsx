import { cookies } from 'next/headers';
import Link from 'next/link';
import { formatDisplayDate, formatDisplayDateTime, formatIndianCurrency } from '@/lib/format';
import {
  getIntlLocale,
  getLanguageFromCookiesStore,
  getStatusLabel,
  pickLanguage,
} from '@/lib/i18n';
import { getAdminDashboardData } from '@/lib/services/admin-dashboard';

const copy = {
  en: {
    title: 'Command centre overview',
    description: 'Track membership, donations, contact traffic, and recent activity from one place.',
    totalMembers: 'Total Members',
    pendingMembers: 'Pending Review',
    approvedMembers: 'Approved Members',
    totalDonations: 'Verified Donations',
    pendingDonations: 'Pending Donation Proofs',
    unreadMessages: 'Unread Messages',
    upcomingEvents: 'Upcoming Events',
    latestMembers: 'Latest member applications',
    latestDonations: 'Latest donation submissions',
    latestMessages: 'Newest contact messages',
    latestEvents: 'Upcoming published events',
    noMembers: 'No member applications yet.',
    noDonations: 'No donation submissions yet.',
    noMessages: 'No contact messages yet.',
    noEvents: 'No upcoming events yet.',
    openMembers: 'Open members',
    openDonations: 'Open donations',
    openMessages: 'Open messages',
  },
  hi: {
    title: 'कमान्ड सेंटर अवलोकन',
    description: 'एक ही स्थान से सदस्यता, दान, संपर्क संदेश और हाल की गतिविधि को ट्रैक करें।',
    totalMembers: 'कुल सदस्य',
    pendingMembers: 'लंबित समीक्षा',
    approvedMembers: 'स्वीकृत सदस्य',
    totalDonations: 'सत्यापित दान',
    pendingDonations: 'लंबित दान प्रमाण',
    unreadMessages: 'अपठित संदेश',
    upcomingEvents: 'आगामी कार्यक्रम',
    latestMembers: 'नवीनतम सदस्य आवेदन',
    latestDonations: 'नवीनतम दान प्रविष्टियाँ',
    latestMessages: 'नवीनतम संपर्क संदेश',
    latestEvents: 'आगामी प्रकाशित कार्यक्रम',
    noMembers: 'अभी कोई सदस्य आवेदन नहीं है।',
    noDonations: 'अभी कोई दान प्रविष्टि नहीं है।',
    noMessages: 'अभी कोई संपर्क संदेश नहीं है।',
    noEvents: 'अभी कोई आगामी कार्यक्रम नहीं है।',
    openMembers: 'सदस्य खोलें',
    openDonations: 'दान खोलें',
    openMessages: 'संदेश खोलें',
  },
} as const;

export default async function AdminDashboardPage() {
  const language = getLanguageFromCookiesStore(cookies());
  const locale = getIntlLocale(language);
  const text = pickLanguage(language, copy);
  const data = await getAdminDashboardData();

  const stats = [
    { label: text.totalMembers, value: data.totalMembers, tone: 'saffron' },
    { label: text.pendingMembers, value: data.pendingMembers, tone: 'gold' },
    { label: text.approvedMembers, value: data.approvedMembers, tone: 'brown' },
    { label: text.totalDonations, value: formatIndianCurrency(data.totalDonations, locale), tone: 'maroon' },
    { label: text.pendingDonations, value: data.pendingDonations, tone: 'saffron' },
    { label: text.unreadMessages, value: data.unreadMessages, tone: 'gold' },
    { label: text.upcomingEvents, value: data.upcomingEvents, tone: 'brown' },
  ];

  const toneClasses: Record<string, string> = {
    saffron: 'from-saffron/15 to-saffron/5 text-saffron',
    gold: 'from-gold-temple/20 to-gold-temple/5 text-yellow-700',
    brown: 'from-brown-dark/15 to-brown-dark/5 text-brown-dark',
    maroon: 'from-maroon-deep/15 to-maroon-deep/5 text-maroon-deep',
  };

  return (
    <div className="space-y-6">
      <section className="surface-panel px-6 py-6">
        <h2 className="section-title">{text.title}</h2>
        <p className="mt-3 text-sm leading-7 text-brown-dark/70">{text.description}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className={`rounded-3xl border border-stone-temple bg-gradient-to-br p-5 ${toneClasses[stat.tone]}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">{stat.label}</p>
            <p className="mt-4 text-3xl font-heading">{stat.value}</p>
          </article>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="surface-panel px-6 py-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-2xl font-semibold text-brown-dark">{text.latestMembers}</h3>
            <Link href="/admin/members" className="text-sm font-semibold text-saffron">{text.openMembers}</Link>
          </div>
          <div className="mt-5 space-y-4">
            {data.recentMembers.length ? data.recentMembers.map((member) => (
              <div key={member.id} className="rounded-2xl border border-stone-temple bg-stone-temple/30 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-brown-dark">{member.fullName}</p>
                    <p className="mt-1 text-sm text-brown-dark/65">{member.user?.email || member.userId}</p>
                    <p className="mt-1 text-sm text-brown-dark/65">{member.district}, {member.state}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-saffron">
                    {getStatusLabel(member.status, language)}
                  </span>
                </div>
              </div>
            )) : <p className="text-sm text-brown-dark/70">{text.noMembers}</p>}
          </div>
        </section>

        <section className="surface-panel px-6 py-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-2xl font-semibold text-brown-dark">{text.latestDonations}</h3>
            <Link href="/admin/donations" className="text-sm font-semibold text-saffron">{text.openDonations}</Link>
          </div>
          <div className="mt-5 space-y-4">
            {data.recentDonations.length ? data.recentDonations.map((donation) => (
              <div key={donation.id} className="rounded-2xl border border-stone-temple bg-stone-temple/30 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-brown-dark">{donation.donorName}</p>
                    <p className="mt-1 text-sm text-brown-dark/65">{formatDisplayDate(donation.createdAt, undefined, locale)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-saffron">{formatIndianCurrency(donation.amount, locale)}</p>
                    <p className="mt-1 text-xs text-brown-dark/65">{getStatusLabel(donation.status, language)}</p>
                  </div>
                </div>
              </div>
            )) : <p className="text-sm text-brown-dark/70">{text.noDonations}</p>}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="surface-panel px-6 py-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-2xl font-semibold text-brown-dark">{text.latestMessages}</h3>
            <Link href="/admin/contact-messages" className="text-sm font-semibold text-saffron">{text.openMessages}</Link>
          </div>
          <div className="mt-5 space-y-4">
            {data.recentMessages.length ? data.recentMessages.map((message) => (
              <div key={message.id} className="rounded-2xl border border-stone-temple bg-stone-temple/30 px-4 py-4">
                <p className="font-semibold text-brown-dark">{message.subject}</p>
                <p className="mt-1 text-sm text-brown-dark/65">{message.name} - {message.email}</p>
                <p className="mt-2 line-clamp-3 text-sm text-brown-dark/75">{message.message}</p>
              </div>
            )) : <p className="text-sm text-brown-dark/70">{text.noMessages}</p>}
          </div>
        </section>

        <section className="surface-panel px-6 py-6">
          <h3 className="text-2xl font-semibold text-brown-dark">{text.latestEvents}</h3>
          <div className="mt-5 space-y-4">
            {data.recentEvents.length ? data.recentEvents.map((event) => (
              <div key={event.id} className="rounded-2xl border border-stone-temple bg-stone-temple/30 px-4 py-4">
                <p className="font-semibold text-brown-dark">{event.title}</p>
                <p className="mt-1 text-sm text-brown-dark/65">{formatDisplayDateTime(event.date, locale)}</p>
                {event.venue ? <p className="mt-1 text-sm text-brown-dark/65">{event.venue}</p> : null}
              </div>
            )) : <p className="text-sm text-brown-dark/70">{text.noEvents}</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
