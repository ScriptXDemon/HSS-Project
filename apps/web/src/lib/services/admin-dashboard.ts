import type {
  AdminAboutContentResponse,
  AdminActivityResponse,
  AdminBannersResponse,
  AdminContactMessagesResponse,
  AdminContentResponse,
  AdminDashboardResponse,
  AdminDonationsResponse,
  AdminEventsResponse,
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

export async function getAdminAboutContentData() {
  return serverApiFetch<AdminAboutContentResponse>('/admin/about');
}

export async function getAdminBannersData() {
  const result = await serverApiFetch<AdminBannersResponse>('/admin/banners');
  return result.banners;
}

export async function getAdminEventsData() {
  const result = await serverApiFetch<AdminEventsResponse>('/admin/events');
  return result.events;
}

export async function getAdminActivityData() {
  const result = await serverApiFetch<AdminActivityResponse>('/admin/activity');
  return result.activities;
}

export async function getAdminGalleryData() {
  return getAdminActivityData();
}

export async function getAdminSettingsData() {
  const result = await serverApiFetch<AdminSettingsResponse>('/admin/settings');
  return result.settings;
}
