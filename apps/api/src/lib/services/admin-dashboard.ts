import { getActiveEngine, getDb } from '@/lib/db';
import type {
  IContactMessage,
  IDonation,
  IEvent,
  IGalleryAlbum,
  IMember,
  ISiteContent,
  ISiteSetting,
  IUser,
  MemberStatus,
  PaymentStatus,
} from '@/lib/db/types';
import { AppError } from '@/lib/errors';
import { deleteUploadedFile, uploadImageFile, uploadLimits, uploadMediaFile } from '@/lib/upload';
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

export interface CreateAdminGalleryInput {
  title: string;
  description?: string;
  coverImage?: File | null;
  images: File[];
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

export async function getAdminSettingsData(): Promise<Array<ISiteSetting | { key: string; value: string }>> {
  const db = await getDb();
  const settings = await db.siteSetting.findAll({ page: 1, limit: 50 });

  return [
    { key: 'database_engine', value: getActiveEngine() },
    { key: 'upload_storage', value: getUploadMode() },
    ...settings.data,
  ];
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
      });
      coverUploadKey = uploadedCover.key;
      coverImageUrl = uploadedCover.url;
    }

    if (input.video && input.video.size > 0) {
      const uploadedVideo = await uploadMediaFile(input.video, {
        folder: 'events/videos',
        maxSizeBytes: uploadLimits.eventVideo,
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

export async function createAdminGallery(input: CreateAdminGalleryInput) {
  const normalizedTitle = input.title.trim();

  if (normalizedTitle.length < 2) {
    throw new AppError('Album title is required', 400);
  }

  if (!input.images.length && (!input.coverImage || input.coverImage.size === 0)) {
    throw new AppError('Upload at least one gallery image', 400);
  }

  const uploadedKeys: string[] = [];
  const uploadedImages: string[] = [];
  let coverImageUrl: string | undefined;

  try {
    if (input.coverImage && input.coverImage.size > 0) {
      const uploadedCover = await uploadImageFile(input.coverImage, {
        folder: 'gallery/covers',
        maxSizeBytes: uploadLimits.galleryAsset,
      });
      uploadedKeys.push(uploadedCover.key);
      coverImageUrl = uploadedCover.url;
    }

    for (const image of input.images) {
      const uploadedImage = await uploadImageFile(image, {
        folder: 'gallery/items',
        maxSizeBytes: uploadLimits.galleryAsset,
      });
      uploadedKeys.push(uploadedImage.key);
      uploadedImages.push(uploadedImage.url);
    }

    if (!uploadedImages.length && coverImageUrl) {
      uploadedImages.push(coverImageUrl);
    }

    const db = await getDb();
    const album = await db.galleryAlbum.create({
      title: normalizedTitle,
      description: normalizeOptionalString(input.description),
      coverImage: coverImageUrl || uploadedImages[0],
    });

    await Promise.all(
      uploadedImages.map((url, index) =>
        db.galleryItem.create({
          albumId: album.id,
          type: 'IMAGE',
          url,
          thumbnail: url,
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

export async function updateDonationStatus(donationId: string, status: PaymentStatus) {
  const db = await getDb();
  const donation = await db.donation.findById(donationId);

  if (!donation) {
    throw new AppError('Donation not found', 404);
  }

  const updatedDonation = await db.donation.update(donationId, {
    status,
    showInDonorList: status === 'SUCCESS' && !donation.isAnonymous,
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
