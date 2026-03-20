import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import GalleryLightbox from '@/components/gallery/GalleryLightbox';
import PageHero from '@/components/shared/PageHero';
import { getLanguageFromCookiesStore, pickLanguage } from '@/lib/i18n';
import { getActivityById } from '@/lib/services/public-content';

export const dynamic = 'force-dynamic';

const copy = {
  en: {
    eyebrow: 'Activity Detail',
    description: 'Images and videos from Sangh-led programmes, service work, and public participation.',
    galleryTitle: 'Activity Media',
  },
  hi: {
    eyebrow: 'गतिविधि विवरण',
    description: 'संघ के कार्यक्रमों, सेवा कार्यों और सार्वजनिक सहभागिता की छवियाँ और वीडियो।',
    galleryTitle: 'गतिविधि मीडिया',
  },
  mr: {
    eyebrow: 'उपक्रम तपशील',
    description: 'संघाच्या कार्यक्रम, सेवा कार्य आणि सार्वजनिक सहभागाची छायाचित्रे व व्हिडिओ.',
    galleryTitle: 'उपक्रम माध्यम',
  },
} as const;

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const language = getLanguageFromCookiesStore(await cookies());
  const text = pickLanguage(language, copy);
  const activity = await getActivityById(id);

  if (!activity) {
    notFound();
  }

  return (
    <>
      <PageHero
        eyebrow={text.eyebrow}
        title={activity.title}
        description={activity.description || text.description}
      />

      <div className="page-content pb-16">
        <section className="surface-panel px-6 py-6">
          <h2 className="section-title">{text.galleryTitle}</h2>
          <div className="mt-6">
            <GalleryLightbox items={activity.items} />
          </div>
        </section>
      </div>
    </>
  );
}
