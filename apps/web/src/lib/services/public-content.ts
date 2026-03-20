import type {
  AboutContentResponse,
  ActivityAlbumResponse,
  ActivityListResponse,
  DonorsListResponse,
  EventDetailResponse,
  EventsListResponse,
  HomeContentResponse,
  ImportantLinksResponse,
} from '@hss/domain';
import { serverApiFetch } from '@/lib/api-client';

export async function getAboutPageContent(language: 'en' | 'hi' | 'mr' = 'en') {
  return serverApiFetch<AboutContentResponse>(`/content/about?lang=${language}`);
}

export async function getHomePageContent(language: 'en' | 'hi' | 'mr' = 'en') {
  return serverApiFetch<HomeContentResponse>(`/content/home?lang=${language}`);
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

export async function getActivities(page = 1, limit = 12) {
  return serverApiFetch<ActivityListResponse>(`/activity?page=${page}&limit=${limit}`);
}

export async function getActivityById(id: string) {
  return serverApiFetch<ActivityAlbumResponse>(`/activity/${id}`);
}

export async function getPublicDonors(page = 1, limit = 20) {
  return serverApiFetch<DonorsListResponse>(`/donors?page=${page}&limit=${limit}`);
}

export const getGalleryAlbums = getActivities;
export const getGalleryAlbumById = getActivityById;
