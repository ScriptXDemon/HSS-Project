import { randomUUID } from 'crypto';
import type {
  AdminOrganizationPersonDTO,
  BannerDTO,
  LocalizedAboutContentDTO,
  LocalizedOrganizationPersonContentDTO,
} from '@hss/domain';
import { getDb } from '@/lib/db';
import type {
  IContactMessage,
  IDonation,
  IEvent,
  IGalleryAlbum,
  IMember,
  PaymentProofStatus,
  ISiteContent,
  ISiteSetting,
  IUser,
  MemberStatus,
  PaymentStatus,
} from '@/lib/db/types';
import { AppError } from '@/lib/errors';
import {
  deleteUploadedFile,
  extractUploadKeyFromUrl,
  uploadImageFile,
  uploadLimits,
  uploadMediaFile,
} from '@/lib/upload';
import {
  ABOUT_PAGE_COPY_KEY,
  HOME_BANNERS_KEY,
  ORGANIZATION_ROSTER_KEY,
  parseAboutContent,
  parseBanners,
  parseRoster,
  resolveLocalizedOrganizationPersonContent,
} from './organization-content';
import { normalizeOptionalString } from './users';

export interface DashboardStat {
  label: string;
  value: number | string;
  tone: 'saffron' | 'gold' | 'brown' | 'maroon';
}

export interface MemberAdminRow extends IMember {
  user?: IUser | null;
}

export interface GalleryAdminRow extends IGalleryAlbum {
  itemCount: number;
}

export interface BannerMutationInput {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  image?: File | null;
  sortOrder?: number;
}

export interface AdminDashboardData {
  totalMembers: number;
  pendingMembers: number;
  approvedMembers: number;
  totalDonations: number;
  pendingDonations: number;
  unreadMessages: number;
  upcomingEvents: number;
  recentMembers: MemberAdminRow[];
  recentDonations: IDonation[];
  recentMessages: IContactMessage[];
  recentEvents: IEvent[];
}

export interface CreateAdminEventInput {
  title: string;
  description: string;
  date: string;
  venue?: string;
  isPublished?: boolean;
  coverImage?: File | null;
  video?: File | null;
}

export type UpdateAdminEventInput = CreateAdminEventInput;

export interface CreateAdminGalleryInput {
  title: string;
  description?: string;
  coverImage?: File | null;
  images: File[];
  videos: File[];
}

export interface UpdateAdminGalleryInput extends Omit<CreateAdminGalleryInput, 'images' | 'videos'> {
  images?: File[];
  videos?: File[];
}

export interface DonationVerificationInput {
  status: PaymentStatus;
  verifiedBy?: string;
  verificationNotes?: string;
}

function getUploadMode() {
  if (
    process.env.CLOUDFLARE_R2_ENDPOINT &&
    process.env.CLOUDFLARE_R2_BUCKET &&
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
  ) {
    return 'Cloudflare R2';
  }

  if (
    process.env.MINIO_ENDPOINT &&
    process.env.MINIO_BUCKET &&
    process.env.MINIO_ACCESS_KEY &&
    process.env.MINIO_SECRET_KEY
  ) {
    return 'MinIO / S3-compatible';
  }

  return process.env.NODE_ENV === 'production' ? 'Storage not configured' : 'Local fallback';
}

function createUserMap(users: IUser[]) {
  return new Map(users.map((user) => [user.id, user]));
}

function attachUsers(members: IMember[], users: IUser[]) {
  const userMap = createUserMap(users);
  return members.map((member) => ({
    ...member,
    user: userMap.get(member.userId) || null,
  }));
}

function buildIdCardNumber(sequence: number) {
  const year = new Date().getFullYear();
  return `HSS-${String(sequence).padStart(4, '0')}-${year}`;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function sortPeople(people: AdminOrganizationPersonDTO[]) {
  return people
    .slice()
    .sort((left, right) => {
      if (left.aboutOrder !== right.aboutOrder) {
        return left.aboutOrder - right.aboutOrder;
      }

      return resolveLocalizedOrganizationPersonContent(left.content, 'en').name.localeCompare(
        resolveLocalizedOrganizationPersonContent(right.content, 'en').name
      );
    });
}

function sortBanners(banners: BannerDTO[]) {
  return banners.slice().sort((left, right) => left.sortOrder - right.sortOrder);
}

async function buildUniqueEventSlug(title: string) {
  const db = await getDb();
  const baseSlug = slugify(title) || `event-${Date.now()}`;
  let candidate = baseSlug;
  let index = 1;

  while (await db.event.findBySlug(candidate)) {
    candidate = `${baseSlug}-${index}`;
    index += 1;
  }

  return candidate;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const db = await getDb();

  const [
    totalMembers,
    pendingMembers,
    approvedMembers,
    totalDonations,
    pendingDonations,
    unreadMessages,
    upcomingEventsResult,
    recentMembers,
    recentDonations,
    recentMessages,
    recentEvents,
    users,
  ] = await Promise.all([
    db.member.count(),
    db.member.count({ status: 'PENDING' }),
    db.member.count({ status: 'APPROVED' }),
    db.donation.getTotalAmount('SUCCESS'),
    db.donation.count({ status: 'PENDING' }),
    db.contactMessage.countUnread(),
    db.event.findUpcoming({ page: 1, limit: 1 }),
    db.member.findAll({ page: 1, limit: 6 }),
    db.donation.findAll({ page: 1, limit: 6 }),
    db.contactMessage.findAll({ page: 1, limit: 6 }),
    db.event.findUpcoming({ page: 1, limit: 6 }),
    db.user.findAll({ page: 1, limit: 100 }),
  ]);

  return {
    totalMembers,
    pendingMembers,
    approvedMembers,
    totalDonations,
    pendingDonations,
    unreadMessages,
    upcomingEvents: upcomingEventsResult.total,
    recentMembers: attachUsers(recentMembers.data, users.data),
    recentDonations: recentDonations.data,
    recentMessages: recentMessages.data,
    recentEvents: recentEvents.data,
  };
}

export async function getAdminMembersData() {
  const db = await getDb();
  const [members, users] = await Promise.all([
    db.member.findAll({ page: 1, limit: 50 }),
    db.user.findAll({ page: 1, limit: 200 }),
  ]);

  return attachUsers(members.data, users.data);
}

export async function getAdminDonationsData() {
  const db = await getDb();
  const donations = await db.donation.findAll({ page: 1, limit: 50 });
  return donations.data;
}

export async function getAdminContactMessagesData() {
  const db = await getDb();
  const messages = await db.contactMessage.findAll({ page: 1, limit: 50 });
  return messages.data;
}

export async function getAdminUsersData() {
  const db = await getDb();
  const users = await db.user.findAll({ page: 1, limit: 100 });
  return users.data;
}

export async function getAdminContentData() {
  const db = await getDb();
  const blocks = await db.siteContent.findAll({ page: 1, limit: 50 });
  return blocks.data as ISiteContent[];
}

export async function getAdminAboutContentData(): Promise<{
  about: LocalizedAboutContentDTO;
  people: AdminOrganizationPersonDTO[];
}> {
  const db = await getDb();
  const [aboutRecord, rosterRecord] = await Promise.all([
    db.siteContent.findByKey(ABOUT_PAGE_COPY_KEY),
    db.siteContent.findByKey(ORGANIZATION_ROSTER_KEY),
  ]);

  return {
    about: parseAboutContent(aboutRecord?.body),
    people: sortPeople(parseRoster(rosterRecord?.body)),
  };
}

export async function updateAdminAboutContent(content: LocalizedAboutContentDTO) {
  const db = await getDb();
  return db.siteContent.upsertByKey(ABOUT_PAGE_COPY_KEY, {
    title: 'About Us Content',
    body: JSON.stringify(content),
  });
}

function normalizePersonLanguageContent(
  content?: Partial<LocalizedOrganizationPersonContentDTO['en']>
) {
  if (!content) {
    return undefined;
  }

  const normalized = {
    name: typeof content.name === 'string' ? content.name.trim() : '',
    role: typeof content.role === 'string' ? content.role.trim() : '',
    bio: normalizeOptionalString(content.bio),
  };

  if (!normalized.name && !normalized.role && !normalized.bio) {
    return undefined;
  }

  return {
    ...(normalized.name ? { name: normalized.name } : {}),
    ...(normalized.role ? { role: normalized.role } : {}),
    ...(normalized.bio ? { bio: normalized.bio } : {}),
  };
}

function preparePersonContent(input: LocalizedOrganizationPersonContentDTO) {
  const english = normalizePersonLanguageContent(input.en);
  const hindi = normalizePersonLanguageContent(input.hi);
  const marathi = normalizePersonLanguageContent(input.mr);

  if (!english?.name || !english.role) {
    throw new AppError('Person English name and role are required', 400);
  }

  return {
    en: {
      name: english.name,
      role: english.role,
      bio: english.bio,
    },
    ...(hindi ? { hi: hindi } : {}),
    ...(marathi ? { mr: marathi } : {}),
  } satisfies LocalizedOrganizationPersonContentDTO;
}

export async function createOrganizationPerson(input: {
  content: LocalizedOrganizationPersonContentDTO;
  showOnAbout?: boolean;
  showOnHome?: boolean;
  aboutOrder?: number;
  homeOrder?: number;
  photo?: File | null;
}) {
  const db = await getDb();
  const existing = await db.siteContent.findByKey(ORGANIZATION_ROSTER_KEY);
  const people = parseRoster(existing?.body);

  let uploadedPhotoKey: string | undefined;
  let photoUrl: string | undefined;

  try {
    if (input.photo && input.photo.size > 0) {
      const uploadedPhoto = await uploadImageFile(input.photo, {
        folder: 'organization/people',
        maxSizeBytes: uploadLimits.memberPhoto,
        visibility: 'public',
      });
      uploadedPhotoKey = uploadedPhoto.key;
      photoUrl = uploadedPhoto.url;
    }

    const person: AdminOrganizationPersonDTO = {
      id: randomUUID(),
      content: preparePersonContent(input.content),
      photoUrl,
      photoKey: uploadedPhotoKey,
      showOnAbout: input.showOnAbout ?? true,
      showOnHome: input.showOnHome ?? true,
      aboutOrder: input.aboutOrder ?? people.length + 1,
      homeOrder: input.homeOrder ?? people.length + 1,
    };

    const nextPeople = sortPeople([...people, person]);
    await db.siteContent.upsertByKey(ORGANIZATION_ROSTER_KEY, {
      title: 'Organization Roster',
      body: JSON.stringify(nextPeople),
    });

    return person;
  } catch (error) {
    if (uploadedPhotoKey) {
      await deleteUploadedFile(uploadedPhotoKey).catch(() => undefined);
    }
    throw error;
  }
}

export async function updateOrganizationPerson(
  personId: string,
  input: {
    content: LocalizedOrganizationPersonContentDTO;
    showOnAbout?: boolean;
    showOnHome?: boolean;
    aboutOrder?: number;
    homeOrder?: number;
    photo?: File | null;
  }
) {
  const db = await getDb();
  const existing = await db.siteContent.findByKey(ORGANIZATION_ROSTER_KEY);
  const people = parseRoster(existing?.body);
  const person = people.find((entry) => entry.id === personId);

  if (!person) {
    throw new AppError('Person not found', 404);
  }

  let uploadedPhotoKey: string | undefined;
  let uploadedPhotoUrl: string | undefined;

  try {
    if (input.photo && input.photo.size > 0) {
      const uploadedPhoto = await uploadImageFile(input.photo, {
        folder: 'organization/people',
        maxSizeBytes: uploadLimits.memberPhoto,
        visibility: 'public',
      });
      uploadedPhotoKey = uploadedPhoto.key;
      uploadedPhotoUrl = uploadedPhoto.url;
    }

    const content = preparePersonContent(input.content);
    const nextPeople = sortPeople(
      people.map((entry) =>
        entry.id === personId
          ? {
              ...entry,
              content,
              showOnAbout: input.showOnAbout ?? entry.showOnAbout,
              showOnHome: input.showOnHome ?? entry.showOnHome,
              aboutOrder: input.aboutOrder ?? entry.aboutOrder,
              homeOrder: input.homeOrder ?? entry.homeOrder,
              photoUrl: uploadedPhotoUrl ?? entry.photoUrl,
              photoKey: uploadedPhotoKey ?? entry.photoKey,
            }
          : entry
      )
    );

    await db.siteContent.upsertByKey(ORGANIZATION_ROSTER_KEY, {
      title: 'Organization Roster',
      body: JSON.stringify(nextPeople),
    });

    if (uploadedPhotoKey && person.photoKey) {
      await deleteUploadedFile(person.photoKey).catch(() => undefined);
    }

    return nextPeople.find((entry) => entry.id === personId) || null;
  } catch (error) {
    if (uploadedPhotoKey) {
      await deleteUploadedFile(uploadedPhotoKey).catch(() => undefined);
    }
    throw error;
  }
}

export async function deleteOrganizationPerson(personId: string) {
  const db = await getDb();
  const existing = await db.siteContent.findByKey(ORGANIZATION_ROSTER_KEY);
  const people = parseRoster(existing?.body);
  const person = people.find((entry) => entry.id === personId);

  if (!person) {
    throw new AppError('Person not found', 404);
  }

  const nextPeople = people.filter((entry) => entry.id !== personId);
  await db.siteContent.upsertByKey(ORGANIZATION_ROSTER_KEY, {
    title: 'Organization Roster',
    body: JSON.stringify(nextPeople),
  });

  if (person.photoKey) {
    await deleteUploadedFile(person.photoKey).catch(() => undefined);
  }

  return true;
}

export async function getAdminBannersData() {
  const db = await getDb();
  const record = await db.siteContent.findByKey(HOME_BANNERS_KEY);
  return sortBanners(parseBanners(record?.body));
}

export async function createAdminBanner(input: BannerMutationInput) {
  const db = await getDb();
  const record = await db.siteContent.findByKey(HOME_BANNERS_KEY);
  const banners = sortBanners(parseBanners(record?.body));

  if (!input.image || input.image.size === 0) {
    throw new AppError('Banner image is required', 400);
  }

  const uploadedImage = await uploadImageFile(input.image, {
    folder: 'banners/home',
    maxSizeBytes: uploadLimits.galleryAsset,
    visibility: 'public',
  });

  try {
    const banner: BannerDTO = {
      id: randomUUID(),
      imageUrl: uploadedImage.url,
      imageKey: uploadedImage.key,
      title: normalizeOptionalString(input.title),
      subtitle: normalizeOptionalString(input.subtitle),
      ctaLabel: normalizeOptionalString(input.ctaLabel),
      ctaHref: normalizeOptionalString(input.ctaHref),
      sortOrder: input.sortOrder ?? banners.length + 1,
    };

    const nextBanners = sortBanners([...banners, banner]);
    await db.siteContent.upsertByKey(HOME_BANNERS_KEY, {
      title: 'Home Banners',
      body: JSON.stringify(nextBanners),
    });

    return banner;
  } catch (error) {
    await deleteUploadedFile(uploadedImage.key).catch(() => undefined);
    throw error;
  }
}

export async function updateAdminBanner(bannerId: string, input: BannerMutationInput) {
  const db = await getDb();
  const record = await db.siteContent.findByKey(HOME_BANNERS_KEY);
  const banners = sortBanners(parseBanners(record?.body));
  const banner = banners.find((entry) => entry.id === bannerId);

  if (!banner) {
    throw new AppError('Banner not found', 404);
  }

  let uploadedImageKey: string | undefined;
  let uploadedImageUrl: string | undefined;

  try {
    if (input.image && input.image.size > 0) {
      const uploadedImage = await uploadImageFile(input.image, {
        folder: 'banners/home',
        maxSizeBytes: uploadLimits.galleryAsset,
        visibility: 'public',
      });
      uploadedImageKey = uploadedImage.key;
      uploadedImageUrl = uploadedImage.url;
    }

    const nextBanners = sortBanners(
      banners.map((entry) =>
        entry.id === bannerId
          ? {
              ...entry,
              title: input.title !== undefined ? normalizeOptionalString(input.title) : entry.title,
              subtitle:
                input.subtitle !== undefined ? normalizeOptionalString(input.subtitle) : entry.subtitle,
              ctaLabel:
                input.ctaLabel !== undefined ? normalizeOptionalString(input.ctaLabel) : entry.ctaLabel,
              ctaHref: input.ctaHref !== undefined ? normalizeOptionalString(input.ctaHref) : entry.ctaHref,
              sortOrder: input.sortOrder ?? entry.sortOrder,
              imageUrl: uploadedImageUrl ?? entry.imageUrl,
              imageKey: uploadedImageKey ?? entry.imageKey,
            }
          : entry
      )
    );

    await db.siteContent.upsertByKey(HOME_BANNERS_KEY, {
      title: 'Home Banners',
      body: JSON.stringify(nextBanners),
    });

    if (uploadedImageKey && banner.imageKey) {
      await deleteUploadedFile(banner.imageKey).catch(() => undefined);
    }

    return nextBanners.find((entry) => entry.id === bannerId) || null;
  } catch (error) {
    if (uploadedImageKey) {
      await deleteUploadedFile(uploadedImageKey).catch(() => undefined);
    }
    throw error;
  }
}

export async function deleteAdminBanner(bannerId: string) {
  const db = await getDb();
  const record = await db.siteContent.findByKey(HOME_BANNERS_KEY);
  const banners = sortBanners(parseBanners(record?.body));
  const banner = banners.find((entry) => entry.id === bannerId);

  if (!banner) {
    throw new AppError('Banner not found', 404);
  }

  const nextBanners = banners.filter((entry) => entry.id !== bannerId);
  await db.siteContent.upsertByKey(HOME_BANNERS_KEY, {
    title: 'Home Banners',
    body: JSON.stringify(nextBanners),
  });

  if (banner.imageKey) {
    await deleteUploadedFile(banner.imageKey).catch(() => undefined);
  }

  return true;
}

export async function getAdminEventsData() {
  const db = await getDb();
  const events = await db.event.findAll({ page: 1, limit: 50 });
  return events.data;
}

export async function getAdminGalleryData(): Promise<GalleryAdminRow[]> {
  const db = await getDb();
  const albums = await db.galleryAlbum.findAll({ page: 1, limit: 50 });

  return Promise.all(
    albums.data.map(async (album) => ({
      ...album,
      itemCount: await db.galleryItem.count({ albumId: album.id }),
    }))
  );
}

export async function getAdminActivityData() {
  return getAdminGalleryData();
}

export async function getAdminSettingsData(): Promise<Array<ISiteSetting | { key: string; value: string }>> {
  const db = await getDb();
  const settings = await db.siteSetting.findAll({ page: 1, limit: 50 });

  return [
    { key: 'database_engine', value: 'mongo' },
    { key: 'upload_storage', value: getUploadMode() },
    ...settings.data,
  ];
}

function collectUploadKeys(values: Array<string | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => extractUploadKeyFromUrl(value))
        .filter((value): value is string => Boolean(value))
    )
  );
}

export async function createAdminEvent(input: CreateAdminEventInput) {
  const normalizedTitle = input.title.trim();
  const normalizedDescription = input.description.trim();

  if (normalizedTitle.length < 3) {
    throw new AppError('Event title is required', 400);
  }

  if (normalizedDescription.length < 10) {
    throw new AppError('Event description is required', 400);
  }

  if (!input.date || Number.isNaN(Date.parse(input.date))) {
    throw new AppError('Valid event date is required', 400);
  }

  let coverUploadKey: string | undefined;
  let videoUploadKey: string | undefined;
  let coverImageUrl: string | undefined;
  let videoUrl: string | undefined;

  try {
    if (input.coverImage && input.coverImage.size > 0) {
      const uploadedCover = await uploadImageFile(input.coverImage, {
        folder: 'events/images',
        maxSizeBytes: uploadLimits.galleryAsset,
        visibility: 'public',
      });
      coverUploadKey = uploadedCover.key;
      coverImageUrl = uploadedCover.url;
    }

    if (input.video && input.video.size > 0) {
      const uploadedVideo = await uploadMediaFile(input.video, {
        folder: 'events/videos',
        maxSizeBytes: uploadLimits.eventVideo,
        visibility: 'public',
      });
      videoUploadKey = uploadedVideo.key;
      videoUrl = uploadedVideo.url;
    }

    const db = await getDb();
    return db.event.create({
      title: normalizedTitle,
      slug: await buildUniqueEventSlug(normalizedTitle),
      description: normalizedDescription,
      coverImage: coverImageUrl,
      videoUrl,
      date: new Date(input.date),
      endDate: undefined,
      venue: normalizeOptionalString(input.venue),
      isPublished: input.isPublished ?? true,
    });
  } catch (error) {
    if (coverUploadKey) {
      await deleteUploadedFile(coverUploadKey).catch(() => undefined);
    }
    if (videoUploadKey) {
      await deleteUploadedFile(videoUploadKey).catch(() => undefined);
    }
    throw error;
  }
}

export async function updateAdminEvent(eventId: string, input: UpdateAdminEventInput) {
  const db = await getDb();
  const event = await db.event.findById(eventId);

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  const normalizedTitle = input.title.trim();
  const normalizedDescription = input.description.trim();

  if (normalizedTitle.length < 3) {
    throw new AppError('Event title is required', 400);
  }

  if (normalizedDescription.length < 10) {
    throw new AppError('Event description is required', 400);
  }

  if (!input.date || Number.isNaN(Date.parse(input.date))) {
    throw new AppError('Valid event date is required', 400);
  }

  let uploadedCoverKey: string | undefined;
  let uploadedVideoKey: string | undefined;
  let uploadedCoverUrl: string | undefined;
  let uploadedVideoUrl: string | undefined;

  try {
    if (input.coverImage && input.coverImage.size > 0) {
      const uploadedCover = await uploadImageFile(input.coverImage, {
        folder: 'events/images',
        maxSizeBytes: uploadLimits.galleryAsset,
        visibility: 'public',
      });
      uploadedCoverKey = uploadedCover.key;
      uploadedCoverUrl = uploadedCover.url;
    }

    if (input.video && input.video.size > 0) {
      const uploadedVideo = await uploadMediaFile(input.video, {
        folder: 'events/videos',
        maxSizeBytes: uploadLimits.eventVideo,
        visibility: 'public',
      });
      uploadedVideoKey = uploadedVideo.key;
      uploadedVideoUrl = uploadedVideo.url;
    }

    const updatedEvent = await db.event.update(eventId, {
      title: normalizedTitle,
      description: normalizedDescription,
      date: new Date(input.date),
      venue: normalizeOptionalString(input.venue),
      isPublished: input.isPublished ?? true,
      coverImage: uploadedCoverUrl ?? event.coverImage,
      videoUrl: uploadedVideoUrl ?? event.videoUrl,
    });

    if (!updatedEvent) {
      throw new AppError('Unable to update event', 500);
    }

    if (uploadedCoverKey) {
      const previousCoverKey = extractUploadKeyFromUrl(event.coverImage);
      if (previousCoverKey) {
        await deleteUploadedFile(previousCoverKey).catch(() => undefined);
      }
    }

    if (uploadedVideoKey) {
      const previousVideoKey = extractUploadKeyFromUrl(event.videoUrl);
      if (previousVideoKey) {
        await deleteUploadedFile(previousVideoKey).catch(() => undefined);
      }
    }

    return updatedEvent;
  } catch (error) {
    if (uploadedCoverKey) {
      await deleteUploadedFile(uploadedCoverKey).catch(() => undefined);
    }
    if (uploadedVideoKey) {
      await deleteUploadedFile(uploadedVideoKey).catch(() => undefined);
    }
    throw error;
  }
}

export async function deleteAdminEvent(eventId: string) {
  const db = await getDb();
  const event = await db.event.findById(eventId);

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  await db.event.delete(eventId);

  const cleanupResults = await Promise.allSettled(
    collectUploadKeys([event.coverImage, event.videoUrl]).map((uploadKey) =>
      deleteUploadedFile(uploadKey)
    )
  );
  const failedCleanup = cleanupResults.filter((result) => result.status === 'rejected');

  if (failedCleanup.length) {
    console.warn('Event media cleanup was incomplete after deletion.', {
      eventId,
      failedCleanup: failedCleanup.length,
    });
  }

  return true;
}

interface UploadedGalleryItem {
  type: 'IMAGE' | 'VIDEO';
  url: string;
  thumbnail?: string;
}

async function uploadGalleryItems(
  images: File[],
  videos: File[],
  uploadedKeys: string[]
): Promise<UploadedGalleryItem[]> {
  const uploadedItems: UploadedGalleryItem[] = [];

  for (const image of images) {
    const uploadedImage = await uploadImageFile(image, {
      folder: 'gallery/items',
      maxSizeBytes: uploadLimits.galleryAsset,
      visibility: 'public',
    });
    uploadedKeys.push(uploadedImage.key);
    uploadedItems.push({
      type: 'IMAGE',
      url: uploadedImage.url,
      thumbnail: uploadedImage.url,
    });
  }

  for (const video of videos) {
    const uploadedVideo = await uploadMediaFile(video, {
      folder: 'gallery/items',
      maxSizeBytes: uploadLimits.eventVideo,
      visibility: 'public',
    });
    uploadedKeys.push(uploadedVideo.key);
    uploadedItems.push({
      type: 'VIDEO',
      url: uploadedVideo.url,
    });
  }

  return uploadedItems;
}

export async function createAdminGallery(input: CreateAdminGalleryInput) {
  const normalizedTitle = input.title.trim();

  if (normalizedTitle.length < 2) {
    throw new AppError('Album title is required', 400);
  }

  if (!input.images.length && !input.videos.length && (!input.coverImage || input.coverImage.size === 0)) {
    throw new AppError('Upload at least one gallery image or video', 400);
  }

  const uploadedKeys: string[] = [];
  const uploadedItems: UploadedGalleryItem[] = [];
  let coverImageUrl: string | undefined;

  try {
    if (input.coverImage && input.coverImage.size > 0) {
      const uploadedCover = await uploadImageFile(input.coverImage, {
        folder: 'gallery/covers',
        maxSizeBytes: uploadLimits.galleryAsset,
        visibility: 'public',
      });
      uploadedKeys.push(uploadedCover.key);
      coverImageUrl = uploadedCover.url;
    }

    uploadedItems.push(...(await uploadGalleryItems(input.images, input.videos, uploadedKeys)));

    if (!uploadedItems.length && coverImageUrl) {
      uploadedItems.push({
        type: 'IMAGE',
        url: coverImageUrl,
        thumbnail: coverImageUrl,
      });
    }

    const db = await getDb();
    const album = await db.galleryAlbum.create({
      title: normalizedTitle,
      description: normalizeOptionalString(input.description),
      coverImage: coverImageUrl || uploadedItems.find((item) => item.type === 'IMAGE')?.url,
    });

    await Promise.all(
      uploadedItems.map((item, index) =>
        db.galleryItem.create({
          albumId: album.id,
          type: item.type,
          url: item.url,
          thumbnail: item.thumbnail,
          caption: undefined,
          sortOrder: index,
        })
      )
    );

    return album;
  } catch (error) {
    await Promise.all(uploadedKeys.map((key) => deleteUploadedFile(key).catch(() => undefined)));
    throw error;
  }
}

export async function createAdminActivity(input: CreateAdminGalleryInput) {
  return createAdminGallery(input);
}

export async function updateAdminGallery(activityId: string, input: UpdateAdminGalleryInput) {
  const normalizedTitle = input.title.trim();

  if (normalizedTitle.length < 2) {
    throw new AppError('Album title is required', 400);
  }

  const db = await getDb();
  const activity = await db.galleryAlbum.findWithItems(activityId);

  if (!activity) {
    throw new AppError('Activity not found', 404);
  }

  const uploadedKeys: string[] = [];
  const uploadedItems: UploadedGalleryItem[] = [];
  let uploadedCoverKey: string | undefined;
  let uploadedCoverUrl: string | undefined;

  try {
    if (input.coverImage && input.coverImage.size > 0) {
      const uploadedCover = await uploadImageFile(input.coverImage, {
        folder: 'gallery/covers',
        maxSizeBytes: uploadLimits.galleryAsset,
        visibility: 'public',
      });
      uploadedCoverKey = uploadedCover.key;
      uploadedCoverUrl = uploadedCover.url;
      uploadedKeys.push(uploadedCover.key);
    }

    uploadedItems.push(...(await uploadGalleryItems(input.images ?? [], input.videos ?? [], uploadedKeys)));

    const updatedAlbum = await db.galleryAlbum.update(activityId, {
      title: normalizedTitle,
      description: normalizeOptionalString(input.description),
      coverImage: uploadedCoverUrl ?? activity.coverImage,
    });

    if (!updatedAlbum) {
      throw new AppError('Unable to update activity', 500);
    }

    const nextSortOrder =
      activity.items.reduce((highest, item) => Math.max(highest, item.sortOrder), -1) + 1;

    await Promise.all(
      uploadedItems.map((item, index) =>
        db.galleryItem.create({
          albumId: activityId,
          type: item.type,
          url: item.url,
          thumbnail: item.thumbnail,
          caption: undefined,
          sortOrder: nextSortOrder + index,
        })
      )
    );

    if (uploadedCoverKey) {
      const oldCoverKey = extractUploadKeyFromUrl(activity.coverImage);
      const coverStillUsedInItems = activity.items.some(
        (item) => item.url === activity.coverImage || item.thumbnail === activity.coverImage
      );

      if (oldCoverKey && !coverStillUsedInItems) {
        await deleteUploadedFile(oldCoverKey).catch(() => undefined);
      }
    }

    return updatedAlbum;
  } catch (error) {
    await Promise.all(uploadedKeys.map((key) => deleteUploadedFile(key).catch(() => undefined)));
    throw error;
  }
}

export async function updateAdminActivity(activityId: string, input: UpdateAdminGalleryInput) {
  return updateAdminGallery(activityId, input);
}

export async function deleteAdminActivity(activityId: string) {
  const db = await getDb();
  const activity = await db.galleryAlbum.findWithItems(activityId);

  if (!activity) {
    throw new AppError('Activity not found', 404);
  }

  await db.galleryAlbum.delete(activityId);

  const uploadKeys = collectUploadKeys([
    activity.coverImage,
    ...activity.items.flatMap((item) => [item.url, item.thumbnail]),
  ]);

  const cleanupResults = await Promise.allSettled(
    uploadKeys.map((uploadKey) => deleteUploadedFile(uploadKey))
  );
  const failedCleanup = cleanupResults.filter((result) => result.status === 'rejected');

  if (failedCleanup.length) {
    console.warn('Activity media cleanup was incomplete after deletion.', {
      activityId,
      uploadKeys,
      failedCleanup: failedCleanup.length,
    });
  }

  return true;
}

export async function updateMemberStatus(memberId: string, status: MemberStatus) {
  const db = await getDb();
  const member = await db.member.findById(memberId);

  if (!member) {
    throw new AppError('Member not found', 404);
  }

  const updatedMember = await db.member.updateStatus(memberId, status);
  if (!updatedMember) {
    throw new AppError('Unable to update member status', 500);
  }

  await db.user.setApproval(member.userId, status === 'APPROVED');

  if (status === 'APPROVED' && !member.idCardNumber) {
    const approvedCount = await db.member.count({ status: 'APPROVED' });
    await db.member.assignIdCard(member.id, buildIdCardNumber(approvedCount));
  }

  return updatedMember;
}

function mapPaymentProofStatus(status: PaymentStatus): PaymentProofStatus {
  if (status === 'SUCCESS') {
    return 'VERIFIED';
  }

  if (status === 'FAILED') {
    return 'REJECTED';
  }

  return 'PENDING_REVIEW';
}

export async function updateDonationStatus(
  donationId: string,
  input: DonationVerificationInput
) {
  const db = await getDb();
  const donation = await db.donation.findById(donationId);

  if (!donation) {
    throw new AppError('Donation not found', 404);
  }

  const updatedDonation = await db.donation.update(donationId, {
    status: input.status,
    paymentProofStatus: mapPaymentProofStatus(input.status),
    verifiedBy: input.verifiedBy,
    verifiedAt: input.status === 'PENDING' ? undefined : new Date(),
    verificationNotes: normalizeOptionalString(input.verificationNotes),
    showInDonorList: input.status === 'SUCCESS' && !donation.isAnonymous,
  });

  if (!updatedDonation) {
    throw new AppError('Unable to update donation status', 500);
  }

  return updatedDonation;
}

export async function markContactMessageRead(messageId: string) {
  const db = await getDb();
  const updated = await db.contactMessage.markAsRead(messageId);

  if (!updated) {
    throw new AppError('Unable to update contact message', 500);
  }

  return updated;
}

export async function deleteUserAccount(userId: string) {
  const db = await getDb();
  const user = await db.user.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  await db.session.deleteByUserId(userId).catch(() => 0);

  const deactivated = await db.user.update(userId, {
    isActive: false,
    isApproved: false,
  });

  if (!deactivated) {
    throw new AppError('Unable to deactivate user', 500);
  }

  const member = await db.member.findByUserId(userId);
  if (member && member.status !== 'SUSPENDED') {
    await db.member.updateStatus(member.id, 'SUSPENDED');
  }

  return true;
}
