import { cookies } from 'next/headers';
import DonationStatusActions from '@/components/admin/DonationStatusActions';
import { formatDisplayDate, formatIndianCurrency } from '@/lib/format';
import { getIntlLocale, getLanguageFromCookiesStore, getStatusLabel, pickLanguage } from '@/lib/i18n';
import { getAdminDonationsData } from '@/lib/services/admin-dashboard';

const causeLabels = {
  en: { temple: 'Temple', event: 'Event', bhandara: 'Bhandhara', children: 'Children' },
  hi: { temple: 'मंदिर', event: 'कार्यक्रम', bhandara: 'भंडारा', children: 'बच्चे' },
  mr: { temple: 'मंदिर', event: 'कार्यक्रम', bhandara: 'भंडारा', children: 'मुलांसाठी' },
} as const;

const copy = {
  en: {
    title: 'Donation verification',
    description: 'Check uploaded payment screenshots and mark each contribution after review.',
    donor: 'Donor',
    amount: 'Amount',
    cause: 'Cause',
    status: 'Status',
    submitted: 'Submitted',
    actions: 'Actions',
    noData: 'No donation submissions found.',
  },
  hi: {
    title: 'दान सत्यापन',
    description: 'अपलोड किए गए भुगतान स्क्रीनशॉट देखें और जाँच के बाद दान की स्थिति अपडेट करें।',
    donor: 'दाता',
    amount: 'राशि',
    cause: 'उद्देश्य',
    status: 'स्थिति',
    submitted: 'जमा तिथि',
    actions: 'कार्य',
    noData: 'कोई दान रिकॉर्ड नहीं मिला।',
  },
  mr: {
    title: 'देणगी पडताळणी',
    description: 'अपलोड केलेले पेमेंट स्क्रीनशॉट तपासा आणि पडताळणीनंतर प्रत्येक देणगीची स्थिती अद्यतनित करा.',
    donor: 'दाता',
    amount: 'रक्कम',
    cause: 'उद्देश',
    status: 'स्थिती',
    submitted: 'सबमिट दिनांक',
    actions: 'क्रिया',
    noData: 'कोणतीही देणगी नोंद सापडली नाही.',
  },
} as const;

export default async function AdminDonationsPage() {
  const language = getLanguageFromCookiesStore(await cookies());
  const locale = getIntlLocale(language);
  const text = pickLanguage(language, copy);
  const donations = await getAdminDonationsData();

  return (
    <section className="surface-panel px-6 py-6">
      <h2 className="section-title">{text.title}</h2>
      <p className="mt-3 text-sm leading-7 text-brown-dark/70">{text.description}</p>

      {donations.length ? (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-stone-temple text-left text-brown-dark/70">
                <th className="px-3 py-3">{text.donor}</th>
                <th className="px-3 py-3">{text.amount}</th>
                <th className="px-3 py-3">{text.cause}</th>
                <th className="px-3 py-3">{text.status}</th>
                <th className="px-3 py-3">{text.submitted}</th>
                <th className="px-3 py-3">{text.actions}</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((donation) => (
                <tr key={donation.id} className="border-b border-stone-temple/60 align-top">
                  <td className="px-3 py-4">
                    <p className="font-semibold text-brown-dark">{donation.donorName}</p>
                    <p className="mt-1 text-brown-dark/65">{donation.donorEmail || donation.donorPhone || '-'}</p>
                  </td>
                  <td className="px-3 py-4 text-brown-dark/70">{formatIndianCurrency(donation.amount, locale)}</td>
                  <td className="px-3 py-4 text-brown-dark/70">
                    {donation.cause ? causeLabels[language][donation.cause] : '-'}
                  </td>
                  <td className="px-3 py-4">
                    <span className="rounded-full bg-saffron/10 px-3 py-1 text-xs font-semibold text-saffron">
                      {getStatusLabel(donation.status, language)}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-brown-dark/70">{formatDisplayDate(donation.createdAt, undefined, locale)}</td>
                  <td className="px-3 py-4">
                    <DonationStatusActions
                      donationId={donation.id}
                      proofUrl={donation.paymentProofKey ? `/api/admin/files?key=${encodeURIComponent(donation.paymentProofKey)}` : undefined}
                    />
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
  );
}
