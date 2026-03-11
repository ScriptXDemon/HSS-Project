import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import EmptyState from '@/components/shared/EmptyState';
import PageHero from '@/components/shared/PageHero';
import PaginationControls from '@/components/shared/PaginationControls';
import { formatDisplayDate } from '@/lib/format';
import { formatTemplate, getIntlLocale, getLanguageFromCookiesStore, pickLanguage } from '@/lib/i18n';
import { getGalleryAlbums } from '@/lib/services/public-content';

export const dynamic = 'force-dynamic';

const copy = {
  en: {
    eyebrow: 'Gallery',
    title: 'Moments from events, campaigns, and community participation',
    description:
      'Browse published albums featuring image and video highlights from organisational work on the ground.',
    placeholder: 'Album',
    items: '{count} items',
    published: 'Published {date}',
    emptyTitle: 'No gallery albums published',
    emptyDescription: 'Gallery albums will appear here once photos or videos are uploaded from the admin panel.',
  },
  hi: {
    eyebrow: 'गैलरी',
    title: 'कार्यक्रमों, अभियानों और समाज की भागीदारी के क्षण',
    description:
      'संगठन के कार्यों से जुड़ी छवियों और वीडियो वाले प्रकाशित एल्बम देखें।',
    placeholder: 'एल्बम',
    items: '{count} आइटम',
    published: '{date} को प्रकाशित',
    emptyTitle: 'कोई गैलरी एल्बम प्रकाशित नहीं है',
    emptyDescription: 'एडमिन पैनल से फोटो या वीडियो अपलोड होने पर एल्बम यहाँ दिखाई देंगे।',
  },
  mr: {
    eyebrow: 'गॅलरी',
    title: 'कार्यक्रम, मोहीमा आणि समाज सहभागातील क्षण',
    description:
      'तळागाळातील संघटनात्मक कार्यातील फोटो आणि व्हिडिओ हायलाइट्स असलेले प्रकाशित अल्बम पाहा.',
    placeholder: 'अल्बम',
    items: '{count} आयटम',
    published: '{date} रोजी प्रकाशित',
    emptyTitle: 'कोणतेही गॅलरी अल्बम प्रकाशित नाहीत',
    emptyDescription: 'अॅडमिन पॅनेलमधून फोटो किंवा व्हिडिओ अपलोड झाल्यावर अल्बम येथे दिसतील.',
  },
} as const;

function resolvePage(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw || '1');
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams?: { page?: string | string[] };
}) {
  const language = getLanguageFromCookiesStore(await cookies());
  const text = pickLanguage(language, copy);
  const locale = getIntlLocale(language);
  const page = resolvePage(searchParams?.page);
  const albums = await getGalleryAlbums(page, 12);

  return (
    <>
      <PageHero eyebrow={text.eyebrow} title={text.title} description={text.description} />

      <div className="page-content pb-16">
        {albums.data.length ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {albums.data.map((album) => (
                <Link
                  key={album.id}
                  href={`/gallery/${album.id}`}
                  className="surface-panel overflow-hidden transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-saffron/15 to-gold-temple/10">
                    {album.previewUrl ? (
                      <Image
                        src={album.previewUrl}
                        alt={album.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl text-saffron/60">
                        {text.placeholder}
                      </div>
                    )}
                  </div>
                  <div className="px-6 py-6">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-2xl font-semibold text-brown-dark">{album.title}</h2>
                      <span className="rounded-full bg-saffron/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-saffron">
                        {formatTemplate(text.items, { count: album.itemCount })}
                      </span>
                    </div>
                    {album.description ? (
                      <p className="mt-3 line-clamp-3 text-sm leading-7 text-brown-dark/75">
                        {album.description}
                      </p>
                    ) : null}
                    <p className="mt-5 text-sm text-brown-dark/60">
                      {formatTemplate(text.published, {
                        date: formatDisplayDate(album.createdAt, undefined, locale),
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <PaginationControls pathname="/gallery" page={albums.page} totalPages={albums.totalPages} />
          </>
        ) : (
          <EmptyState title={text.emptyTitle} description={text.emptyDescription} />
        )}
      </div>
    </>
  );
}
