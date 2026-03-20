import type {
  AboutContentResponse,
  BannerDTO,
  HomeContentResponse,
  OrganizationPersonDTO,
} from '@hss/domain';
import type {
  IEvent,
  IGalleryAlbum,
  IGalleryItem,
  IImportantLink,
  IDonation,
  PaginatedResult,
} from '@/lib/db/types';
import { getDb } from '@/lib/db';
import type { Language } from '@/lib/i18n';
import {
  ABOUT_PAGE_COPY_KEY,
  HOME_BANNERS_KEY,
  ORGANIZATION_ROSTER_KEY,
  getAboutPeople,
  getDefaultAboutContent,
  getDefaultBanners,
  getFeaturedPeople,
  getResolvedAboutContent,
  parseAboutContent,
  parseBanners,
  parseRoster,
} from './organization-content';

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

export function parseLeadershipEntries(body?: string | null): OrganizationPersonDTO[] {
  return getAboutPeople(parseRoster(body));
}

async function getOrganizationSiteContent() {
  try {
    const db = await getDb();
    const [aboutRecord, bannerRecord, rosterRecord] = await Promise.all([
      db.siteContent.findByKey(ABOUT_PAGE_COPY_KEY),
      db.siteContent.findByKey(HOME_BANNERS_KEY),
      db.siteContent.findByKey(ORGANIZATION_ROSTER_KEY),
    ]);

    return {
      about: parseAboutContent(aboutRecord?.body),
      banners: parseBanners(bannerRecord?.body),
      roster: parseRoster(rosterRecord?.body),
    };
  } catch {
    return {
      about: getDefaultAboutContent(),
      banners: getDefaultBanners(),
      roster: parseRoster(undefined),
    };
  }
}

export async function getHomePageContent(language: Language = 'en'): Promise<HomeContentResponse> {
  const content = await getOrganizationSiteContent();
  const banners = content.banners.slice().sort((left, right) => left.sortOrder - right.sortOrder);

  return {
    banners: banners.length ? banners : getDefaultBanners(),
    featuredPeople: getFeaturedPeople(content.roster),
  };
}

export async function getHomeBanners(): Promise<BannerDTO[]> {
  const content = await getOrganizationSiteContent();
  return content.banners;
}

export async function getAboutPageContent(language: Language = 'en'): Promise<AboutContentResponse> {
  const content = await getOrganizationSiteContent();

  return {
    content: getResolvedAboutContent(content.about, language),
    people: getAboutPeople(content.roster),
  };
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

export async function getActivities(page = 1, limit = 12) {
  return getGalleryAlbums(page, limit);
}

export async function getActivityById(id: string) {
  return getGalleryAlbumById(id);
}

export async function getPublicDonors(page = 1, limit = 20): Promise<PaginatedResult<IDonation>> {
  try {
    const db = await getDb();
    return await db.donation.findPublicDonors({ page, limit });
  } catch {
    return createEmptyPaginatedResult<IDonation>(page, limit);
  }
}
