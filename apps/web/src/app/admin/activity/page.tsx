import { cookies } from 'next/headers';
import Link from 'next/link';
import { formatDisplayDate } from '@/lib/format';
import { getLanguageFromCookiesStore, pickLanguage } from '@/lib/i18n';
import AdminGalleryUploadForm from '@/components/admin/AdminGalleryUploadForm';
import ActivityDeleteButton from '@/components/admin/ActivityDeleteButton';
import { getAdminActivityData } from '@/lib/services/admin-dashboard';

const copy = {
  en: {
    title: 'Activity albums',
    description: 'Activity records and their media counts currently available for the public site.',
    album: 'Activity',
    count: 'Media Count',
    created: 'Created',
    frontend: 'Frontend',
    actions: 'Actions',
    view: 'View',
    noData: 'No activity albums found.',
  },
  hi: {
    title: 'गतिविधि एल्बम',
    description: 'सार्वजनिक साइट के लिए उपलब्ध गतिविधि रिकॉर्ड और उनकी मीडिया संख्या।',
    album: 'गतिविधि',
    count: 'मीडिया संख्या',
    created: 'बनाया गया',
    frontend: 'फ्रंटएंड',
    actions: 'क्रियाएँ',
    view: 'देखें',
    noData: 'कोई गतिविधि एल्बम नहीं मिला।',
  },
  mr: {
    title: 'उपक्रम अल्बम',
    description: 'सार्वजनिक साइटसाठी उपलब्ध उपक्रम नोंदी आणि त्यातील मीडिया संख्या.',
    album: 'उपक्रम',
    count: 'मीडिया संख्या',
    created: 'तयार केले',
    frontend: 'फ्रंटएंड',
    actions: 'क्रिया',
    view: 'पहा',
    noData: 'एकही उपक्रम अल्बम सापडला नाही.',
  },
} as const;

export default async function AdminActivityPage() {
  const language = getLanguageFromCookiesStore(await cookies());
  const text = pickLanguage(language, copy);
  const activities = await getAdminActivityData();

  return (
    <div className="space-y-6">
      <AdminGalleryUploadForm />

      <section className="surface-panel px-6 py-6">
        <h2 className="section-title">{text.title}</h2>
        <p className="mt-3 text-sm leading-7 text-brown-dark/70">{text.description}</p>

        {activities.length ? (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-stone-temple text-left text-brown-dark/70">
                  <th className="px-3 py-3">{text.album}</th>
                  <th className="px-3 py-3">{text.count}</th>
                  <th className="px-3 py-3">{text.created}</th>
                  <th className="px-3 py-3">{text.frontend}</th>
                  <th className="px-3 py-3">{text.actions}</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr key={activity.id} className="border-b border-stone-temple/60 align-top">
                    <td className="px-3 py-4">
                      <p className="font-semibold text-brown-dark">{activity.title}</p>
                      <p className="mt-1 text-brown-dark/65">{activity.description || '-'}</p>
                    </td>
                    <td className="px-3 py-4 text-brown-dark/70">{activity.itemCount}</td>
                    <td className="px-3 py-4 text-brown-dark/70">{formatDisplayDate(activity.createdAt)}</td>
                    <td className="px-3 py-4 text-brown-dark/70">
                      <Link href={`/activity/${activity.id}`} className="text-sm font-semibold text-saffron" target="_blank">
                        {text.view}
                      </Link>
                    </td>
                    <td className="px-3 py-4">
                      <ActivityDeleteButton activityId={activity.id} />
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
