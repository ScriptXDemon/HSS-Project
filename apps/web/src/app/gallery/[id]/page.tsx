import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import GalleryLightbox from '@/components/gallery/GalleryLightbox';
import EmptyState from '@/components/shared/EmptyState';
import PageHero from '@/components/shared/PageHero';
import { formatDisplayDate } from '@/lib/format';
import { formatTemplate, getIntlLocale, getLanguageFromCookiesStore, pickLanguage } from '@/lib/i18n';
import { getGalleryAlbumById } from '@/lib/services/public-content';

export const dynamic = 'force-dynamic';

const copy = {
  en: {
    eyebrow: 'Gallery Album',
    description: 'Browse the full set of published media from this album.',
    items: '{count} items',
    published: 'Published {date}',
    emptyTitle: 'This album has no published media yet',
    emptyDescription: 'Images and videos will appear here once gallery items are attached to the album.',
  },
  hi: {
    eyebrow: 'गैलरी एल्बम',
    description: 'इस एल्बम की पूरी प्रकाशित मीडिया सामग्री देखें।',
    items: '{count} आइटम',
    published: '{date} को प्रकाशित',
    emptyTitle: 'इस एल्बम में अभी कोई प्रकाशित मीडिया नहीं है',
    emptyDescription: 'एल्बम से मीडिया जुड़ने पर छवियाँ और वीडियो यहाँ दिखाई देंगे।',
  },
} as const;

export default async function GalleryAlbumPage({
  params,
}: {
  params: { id: string };
}) {
  const language = getLanguageFromCookiesStore(cookies());
  const text = pickLanguage(language, copy);
  const locale = getIntlLocale(language);
  const album = await getGalleryAlbumById(params.id);

  if (!album) {
    notFound();
  }

  return (
    <>
      <PageHero
        eyebrow={text.eyebrow}
        title={album.title}
        description={album.description || text.description}
      />

      <div className="page-content pb-16">
        <section className="surface-panel px-6 py-6 sm:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-saffron/10 px-4 py-2 text-sm font-semibold text-saffron">
              {formatTemplate(text.items, { count: album.items.length })}
            </span>
            <span className="rounded-full bg-stone-temple px-4 py-2 text-sm font-semibold text-brown-dark">
              {formatTemplate(text.published, {
                date: formatDisplayDate(album.createdAt, undefined, locale),
              })}
            </span>
          </div>

          <div className="mt-8">
            {album.items.length ? (
              <GalleryLightbox items={album.items} />
            ) : (
              <EmptyState title={text.emptyTitle} description={text.emptyDescription} />
            )}
          </div>
        </section>
      </div>
    </>
  );
}
