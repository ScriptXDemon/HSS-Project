import { cookies } from 'next/headers';
import Link from 'next/link';
import AdminGalleryUploadForm from '@/components/admin/AdminGalleryUploadForm';
import { formatDisplayDate } from '@/lib/format';
import { getIntlLocale, getLanguageFromCookiesStore, pickLanguage } from '@/lib/i18n';
import { getAdminGalleryData } from '@/lib/services/admin-dashboard';

const copy = {
  en: {
    title: 'Gallery albums',
    description: 'Album records and their media counts currently available for the site.',
    album: 'Album',
    count: 'Media Count',
    created: 'Created',
    frontend: 'Frontend',
    view: 'View',
    noData: 'No gallery albums found.',
  },
  hi: {
    title: 'गैलरी एल्बम',
    description: 'साइट के लिए उपलब्ध एल्बम रिकॉर्ड और उनकी मीडिया संख्या।',
    album: 'एल्बम',
    count: 'मीडिया संख्या',
    created: 'बनाया गया',
    frontend: 'फ्रंटएंड',
    view: 'देखें',
    noData: 'कोई गैलरी एल्बम नहीं मिला।',
  },
  mr: {
    title: 'गॅलरी अल्बम',
    description: 'साइटसाठी उपलब्ध अल्बम नोंदी आणि त्यातील मीडिया संख्या.',
    album: 'अल्बम',
    count: 'मीडिया संख्या',
    created: 'तयार केले',
    frontend: 'फ्रंटएंड',
    view: 'पहा',
    noData: 'एकही गॅलरी अल्बम सापडला नाही.',
  },
} as const;

export default async function AdminGalleryPage() {
  const language = getLanguageFromCookiesStore(await cookies());
  const locale = getIntlLocale(language);
  const text = pickLanguage(language, copy);
  const albums = await getAdminGalleryData();

  return (
    <div className="space-y-6">
      <AdminGalleryUploadForm />

      <section className="surface-panel px-6 py-6">
        <h2 className="section-title">{text.title}</h2>
        <p className="mt-3 text-sm leading-7 text-brown-dark/70">{text.description}</p>

        {albums.length ? (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-stone-temple text-left text-brown-dark/70">
                  <th className="px-3 py-3">{text.album}</th>
                  <th className="px-3 py-3">{text.count}</th>
                  <th className="px-3 py-3">{text.created}</th>
                  <th className="px-3 py-3">{text.frontend}</th>
                </tr>
              </thead>
              <tbody>
                {albums.map((album) => (
                  <tr key={album.id} className="border-b border-stone-temple/60">
                    <td className="px-3 py-4">
                      <p className="font-semibold text-brown-dark">{album.title}</p>
                      <p className="mt-1 text-brown-dark/65">{album.description || '-'}</p>
                    </td>
                    <td className="px-3 py-4 text-brown-dark/70">{album.itemCount}</td>
                    <td className="px-3 py-4 text-brown-dark/70">{formatDisplayDate(album.createdAt, undefined, locale)}</td>
                    <td className="px-3 py-4 text-brown-dark/70">
                      <Link href={`/gallery/${album.id}`} className="text-sm font-semibold text-saffron" target="_blank">
                        {text.view}
                      </Link>
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
