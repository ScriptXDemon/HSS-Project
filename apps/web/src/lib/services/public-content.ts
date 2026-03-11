import type {
  AboutContentResponse,
  DonorsListResponse,
  EventDetailResponse,
  EventsListResponse,
  GalleryAlbumResponse,
  GalleryListResponse,
  ImportantLinksResponse,
} from '@hss/domain';
import { serverApiFetch } from '@/lib/api-client';

export async function getAboutPageContent(_language: 'en' | 'hi' | 'mr' = 'en') {
  return serverApiFetch<AboutContentResponse>(`/content/about?lang=${_language}`);
}

export async function getImportantLinks() {
  return serverApiFetch<ImportantLinksResponse>('/important-links');
}

export async function getEvents(scope: 'upcoming' | 'past' | 'published', page = 1, limit = 12) {
  return serverApiFetch<EventsListResponse>(`/events?scope=${scope}&page=${page}&limit=${limit}`);
}

export async function getPublishedEventBySlug(slug: string) {
  return serverApiFetch<EventDetailResponse>(`/events/${slug}`);
}

export async function getGalleryAlbums(page = 1, limit = 12) {
  return serverApiFetch<GalleryListResponse>(`/gallery?page=${page}&limit=${limit}`);
}

export async function getGalleryAlbumById(id: string) {
  return serverApiFetch<GalleryAlbumResponse>(`/gallery/${id}`);
}

export async function getPublicDonors(page = 1, limit = 20) {
  return serverApiFetch<DonorsListResponse>(`/donors?page=${page}&limit=${limit}`);
}
