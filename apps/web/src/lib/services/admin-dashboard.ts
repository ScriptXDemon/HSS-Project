import type {
  AdminContactMessagesResponse,
  AdminContentResponse,
  AdminDashboardResponse,
  AdminDonationsResponse,
  AdminEventsResponse,
  AdminGalleryResponse,
  AdminMembersResponse,
  AdminSettingsResponse,
  AdminUsersResponse,
} from '@hss/domain';
import { serverApiFetch } from '@/lib/api-client';

export async function getAdminDashboardData() {
  return serverApiFetch<AdminDashboardResponse>('/admin/dashboard');
}

export async function getAdminMembersData() {
  const result = await serverApiFetch<AdminMembersResponse>('/admin/members');
  return result.members;
}

export async function getAdminDonationsData() {
  const result = await serverApiFetch<AdminDonationsResponse>('/admin/donations');
  return result.donations;
}

export async function getAdminContactMessagesData() {
  const result = await serverApiFetch<AdminContactMessagesResponse>('/admin/contact-messages');
  return result.messages;
}

export async function getAdminUsersData() {
  const result = await serverApiFetch<AdminUsersResponse>('/admin/users');
  return result.users;
}

export async function getAdminContentData() {
  const result = await serverApiFetch<AdminContentResponse>('/admin/content');
  return result.blocks;
}

export async function getAdminEventsData() {
  const result = await serverApiFetch<AdminEventsResponse>('/admin/events');
  return result.events;
}

export async function getAdminGalleryData() {
  const result = await serverApiFetch<AdminGalleryResponse>('/admin/gallery');
  return result.albums;
}

export async function getAdminSettingsData() {
  const result = await serverApiFetch<AdminSettingsResponse>('/admin/settings');
  return result.settings;
}
