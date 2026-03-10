import { cookies } from 'next/headers';
import { getLanguageFromCookiesStore, pickLanguage } from '@/lib/i18n';
import { getAdminSettingsData } from '@/lib/services/admin-dashboard';

const copy = {
  en: {
    title: 'Settings and configuration',
    description: 'Active storage and database settings available to the local demo environment.',
    key: 'Setting',
    value: 'Value',
    noData: 'No settings records found.',
  },
  hi: {
    title: 'सेटिंग्स और कॉन्फ़िगरेशन',
    description: 'स्थानीय डेमो वातावरण में उपलब्ध सक्रिय स्टोरेज और डेटाबेस सेटिंग्स।',
    key: 'सेटिंग',
    value: 'मान',
    noData: 'कोई सेटिंग रिकॉर्ड नहीं मिला।',
  },
} as const;

export default async function AdminSettingsPage() {
  const language = getLanguageFromCookiesStore(cookies());
  const text = pickLanguage(language, copy);
  const settings = await getAdminSettingsData();

  return (
    <section className="surface-panel px-6 py-6">
      <h2 className="section-title">{text.title}</h2>
      <p className="mt-3 text-sm leading-7 text-brown-dark/70">{text.description}</p>

      {settings.length ? (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-stone-temple text-left text-brown-dark/70">
                <th className="px-3 py-3">{text.key}</th>
                <th className="px-3 py-3">{text.value}</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((setting) => (
                <tr key={setting.key} className="border-b border-stone-temple/60">
                  <td className="px-3 py-4 font-semibold text-brown-dark">{setting.key}</td>
                  <td className="px-3 py-4 text-brown-dark/70 break-all">{setting.value}</td>
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
