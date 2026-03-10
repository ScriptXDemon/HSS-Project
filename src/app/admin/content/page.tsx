import { cookies } from 'next/headers';
import { getLanguageFromCookiesStore, pickLanguage } from '@/lib/i18n';
import { getAdminContentData } from '@/lib/services/admin-dashboard';

const copy = {
  en: {
    title: 'Content blocks',
    description: 'Current CMS records that drive public informational pages.',
    key: 'Content Key',
    preview: 'Preview',
    noData: 'No content records found.',
  },
  hi: {
    title: 'कंटेंट ब्लॉक',
    description: 'वे CMS रिकॉर्ड जो सार्वजनिक सूचना पृष्ठों को संचालित करते हैं।',
    key: 'कंटेंट कुंजी',
    preview: 'पूर्वावलोकन',
    noData: 'कोई कंटेंट रिकॉर्ड नहीं मिला।',
  },
} as const;

export default async function AdminContentPage() {
  const language = getLanguageFromCookiesStore(cookies());
  const text = pickLanguage(language, copy);
  const content = await getAdminContentData();

  return (
    <section className="surface-panel px-6 py-6">
      <h2 className="section-title">{text.title}</h2>
      <p className="mt-3 text-sm leading-7 text-brown-dark/70">{text.description}</p>

      {content.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {content.map((item) => (
            <article key={item.id} className="rounded-2xl border border-stone-temple bg-stone-temple/30 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-saffron">{text.key}</p>
              <h3 className="mt-2 text-lg font-semibold text-brown-dark">{item.key}</h3>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-saffron">{text.preview}</p>
              <p className="mt-2 line-clamp-5 text-sm leading-7 text-brown-dark/75">{item.body}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-brown-dark/70">{text.noData}</p>
      )}
    </section>
  );
}
