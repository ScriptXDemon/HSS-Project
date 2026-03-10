import type {
  IEvent,
  IGalleryAlbum,
  IGalleryItem,
  IImportantLink,
  IDonation,
  PaginatedResult,
} from '@/lib/db/types';
import { getDb } from '@/lib/db';
import { pickLanguage, type Language } from '@/lib/i18n';

export interface LeadershipMember {
  name: string;
  role: string;
  photoUrl?: string;
  bio?: string;
}

export interface AboutSection {
  title?: string;
  body: string;
}

export interface AboutPageContent {
  history: AboutSection;
  mission: AboutSection;
  vision: AboutSection;
  leadership: LeadershipMember[];
}

export interface GalleryAlbumSummary extends IGalleryAlbum {
  itemCount: number;
  previewUrl?: string;
}

function createEmptyPaginatedResult<T>(page: number, limit: number): PaginatedResult<T> {
  return {
    data: [],
    total: 0,
    page,
    limit,
    totalPages: 0,
  };
}

function getAboutFallback(language: Language): AboutPageContent {
  return pickLanguage(language, {
    en: {
      history: {
        title: 'Our Journey',
        body:
          'Hindu Suraksha Sangh was founded to strengthen social unity, preserve civilizational values, and support community welfare through disciplined grassroots work.',
      },
      mission: {
        title: 'Mission',
        body:
          'Organize service-driven initiatives, empower volunteers, and provide a trusted platform for cultural, social, and humanitarian action.',
      },
      vision: {
        title: 'Vision',
        body:
          'Build a confident, compassionate, and connected Hindu society rooted in dharma, seva, and national responsibility.',
      },
      leadership: [
        {
          name: 'State Convenor',
          role: 'Organizational Leadership',
          bio: 'Coordinates statewide outreach, membership growth, and strategic direction.',
        },
        {
          name: 'District Coordinator',
          role: 'Field Operations',
          bio: 'Leads district-level programs, volunteer support, and local event execution.',
        },
        {
          name: 'Youth Wing Lead',
          role: 'Community Mobilization',
          bio: 'Drives youth engagement, training activities, and grassroots participation.',
        },
      ],
    },
    hi: {
      history: {
        title: 'हमारी यात्रा',
        body:
          'हिंदू सुरक्षा संघ की स्थापना सामाजिक एकता को मजबूत करने, सभ्यतागत मूल्यों को सुरक्षित रखने और अनुशासित जमीनी कार्य के माध्यम से समाज कल्याण को समर्थन देने के लिए हुई।',
      },
      mission: {
        title: 'मिशन',
        body:
          'सेवा-आधारित पहलों का संगठन, कार्यकर्ताओं को सशक्त बनाना और सांस्कृतिक व सामाजिक कार्य के लिए विश्वसनीय मंच उपलब्ध कराना।',
      },
      vision: {
        title: 'दृष्टि',
        body:
          'धर्म, सेवा और राष्ट्रीय उत्तरदायित्व पर आधारित आत्मविश्वासी, करुणामय और संगठित हिंदू समाज का निर्माण।',
      },
      leadership: [
        {
          name: 'राज्य संयोजक',
          role: 'संगठनात्मक नेतृत्व',
          bio: 'राज्य स्तरीय विस्तार, सदस्यता वृद्धि और रणनीतिक दिशा का समन्वय।',
        },
        {
          name: 'जिला समन्वयक',
          role: 'मैदानी संचालन',
          bio: 'जिला स्तर के कार्यक्रम, स्वयंसेवक सहयोग और स्थानीय आयोजन का नेतृत्व।',
        },
        {
          name: 'युवा प्रकोष्ठ प्रमुख',
          role: 'समुदाय संगठन',
          bio: 'युवा सहभागिता, प्रशिक्षण और जमीनी सक्रियता को आगे बढ़ाते हैं।',
        },
      ],
    },
  });
}

export function parseLeadershipEntries(body?: string | null, language: Language = 'en'): LeadershipMember[] {
  const fallback = getAboutFallback(language);

  if (!body) {
    return fallback.leadership;
  }

  try {
    const parsed = JSON.parse(body);

    if (!Array.isArray(parsed)) {
      return fallback.leadership;
    }

    const leadership = parsed
      .filter((entry) => entry && typeof entry === 'object')
      .map((entry) => {
        const record = entry as Record<string, unknown>;
        return {
          name: String(record.name || '').trim(),
          role: String(record.role || '').trim(),
          photoUrl: typeof record.photoUrl === 'string' ? record.photoUrl : undefined,
          bio: typeof record.bio === 'string' ? record.bio : undefined,
        };
      })
      .filter((entry) => entry.name && entry.role);

    return leadership.length ? leadership : fallback.leadership;
  } catch {
    return fallback.leadership;
  }
}

export async function getAboutPageContent(language: Language = 'en'): Promise<AboutPageContent> {
  const fallback = getAboutFallback(language);

  try {
    const db = await getDb();
    const [history, mission, vision, leadership] = await Promise.all([
      db.siteContent.findByKey('about_history'),
      db.siteContent.findByKey('about_mission'),
      db.siteContent.findByKey('about_vision'),
      db.siteContent.findByKey('about_leadership'),
    ]);

    return {
      history: history
        ? { title: history.title || fallback.history.title, body: history.body }
        : fallback.history,
      mission: mission
        ? { title: mission.title || fallback.mission.title, body: mission.body }
        : fallback.mission,
      vision: vision
        ? { title: vision.title || fallback.vision.title, body: vision.body }
        : fallback.vision,
      leadership: parseLeadershipEntries(leadership?.body, language),
    };
  } catch {
    return fallback;
  }
}

export async function getImportantLinks() {
  try {
    const db = await getDb();
    return await db.importantLink.findActive({ page: 1, limit: 50 });
  } catch {
    return createEmptyPaginatedResult<IImportantLink>(1, 50);
  }
}

export async function getEvents(scope: 'upcoming' | 'past' | 'published', page = 1, limit = 12) {
  try {
    const db = await getDb();

    if (scope === 'upcoming') {
      return await db.event.findUpcoming({ page, limit });
    }

    if (scope === 'past') {
      return await db.event.findPast({ page, limit });
    }

    return await db.event.findPublished({ page, limit });
  } catch {
    return createEmptyPaginatedResult<IEvent>(page, limit);
  }
}

export async function getPublishedEventBySlug(slug: string): Promise<IEvent | null> {
  try {
    const db = await getDb();
    const event = await db.event.findBySlug(slug);

    if (!event || !event.isPublished) {
      return null;
    }

    return event;
  } catch {
    return null;
  }
}

export async function getGalleryAlbums(page = 1, limit = 12): Promise<PaginatedResult<GalleryAlbumSummary>> {
  try {
    const db = await getDb();
    const albums = await db.galleryAlbum.findAll({ page, limit });

    const albumData = await Promise.all(
      albums.data.map(async (album) => {
        const [itemCount, firstItem] = await Promise.all([
          db.galleryItem.count({ albumId: album.id }),
          db.galleryItem.findByAlbum(album.id, { page: 1, limit: 1 }),
        ]);

        return {
          ...album,
          itemCount,
          previewUrl: album.coverImage || firstItem.data[0]?.thumbnail || firstItem.data[0]?.url,
        };
      })
    );

    return {
      ...albums,
      data: albumData,
    };
  } catch {
    return createEmptyPaginatedResult<GalleryAlbumSummary>(page, limit);
  }
}

export async function getGalleryAlbumById(
  id: string
): Promise<(IGalleryAlbum & { items: IGalleryItem[] }) | null> {
  try {
    const db = await getDb();
    return await db.galleryAlbum.findWithItems(id);
  } catch {
    return null;
  }
}

export async function getPublicDonors(page = 1, limit = 20): Promise<PaginatedResult<IDonation>> {
  try {
    const db = await getDb();
    return await db.donation.findPublicDonors({ page, limit });
  } catch {
    return createEmptyPaginatedResult<IDonation>(page, limit);
  }
}
