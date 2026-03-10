export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
export type MemberStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type MediaType = 'IMAGE' | 'VIDEO';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type PaymentMode = 'MANUAL_UPI' | 'RAZORPAY';
export type PaymentProofStatus = 'NOT_REQUIRED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';

export interface BaseEntityDTO {
  id: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface SessionUserDTO {
  id: string;
  name: string;
  email: string;
  role: Role;
  isApproved: boolean;
  isActive?: boolean;
  twoFactorEnabled?: boolean;
}

export interface SessionResponse {
  user: SessionUserDTO | null;
  expires?: string;
}

export interface MemberDTO extends BaseEntityDTO {
  userId: string;
  fullName: string;
  fatherName: string;
  dob: string | Date;
  gender: string;
  bloodGroup?: string;
  aadharNumber?: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  occupation?: string;
  photo?: string;
  idCardNumber?: string;
  idCardGeneratedAt?: string | Date;
  status: MemberStatus;
}

export interface UserDTO extends BaseEntityDTO {
  name: string;
  email: string;
  phone?: string;
  role: Role;
  isApproved: boolean;
  emailVerified: boolean;
  avatar?: string;
  isActive?: boolean;
  twoFactorEnabled?: boolean;
  lockedUntil?: string | Date;
  failedLoginAttempts?: number;
}

export interface EventDTO extends BaseEntityDTO {
  title: string;
  slug: string;
  description: string;
  coverImage?: string;
  videoUrl?: string;
  date: string | Date;
  endDate?: string | Date;
  venue?: string;
  isPublished: boolean;
}

export interface GalleryItemDTO extends BaseEntityDTO {
  albumId: string;
  type: MediaType;
  url: string;
  thumbnail?: string;
  caption?: string;
  sortOrder: number;
}

export interface GalleryAlbumDTO extends BaseEntityDTO {
  title: string;
  description?: string;
  coverImage?: string;
}

export interface GalleryAlbumSummaryDTO extends GalleryAlbumDTO {
  itemCount: number;
  previewUrl?: string;
}

export interface DonationDTO extends BaseEntityDTO {
  userId?: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  currency: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: PaymentStatus;
  isAnonymous: boolean;
  showInDonorList: boolean;
  receipt?: string;
  paymentMode?: PaymentMode;
  paymentProofKey?: string;
  paymentProofStatus?: PaymentProofStatus;
  verifiedBy?: string;
  verifiedAt?: string | Date;
  verificationNotes?: string;
}

export interface ContactMessageDTO extends BaseEntityDTO {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
}

export interface SiteContentDTO extends BaseEntityDTO {
  key: string;
  title?: string;
  body: string;
}

export interface ImportantLinkDTO extends BaseEntityDTO {
  title: string;
  url: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface SiteSettingDTO extends BaseEntityDTO {
  key: string;
  value: string;
}

export interface PaginatedResultDTO<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LeadershipMemberDTO {
  name: string;
  role: string;
  photoUrl?: string;
  bio?: string;
}

export interface AboutSectionDTO {
  title?: string;
  body: string;
}

export interface AboutContentResponse {
  history: AboutSectionDTO;
  mission: AboutSectionDTO;
  vision: AboutSectionDTO;
  leadership: LeadershipMemberDTO[];
}

export interface EventsListResponse extends PaginatedResultDTO<EventDTO> {}
export interface EventDetailResponse extends EventDTO {}
export interface GalleryListResponse extends PaginatedResultDTO<GalleryAlbumSummaryDTO> {}
export interface GalleryAlbumResponse extends GalleryAlbumDTO {
  items: GalleryItemDTO[];
}
export interface DonorsListResponse extends PaginatedResultDTO<DonationDTO> {}
export interface ImportantLinksResponse extends PaginatedResultDTO<ImportantLinkDTO> {}

export interface AdminDashboardResponse {
  totalMembers: number;
  pendingMembers: number;
  approvedMembers: number;
  totalDonations: number;
  pendingDonations: number;
  unreadMessages: number;
  upcomingEvents: number;
  recentMembers: Array<MemberDTO & { user?: UserDTO | null }>;
  recentDonations: DonationDTO[];
  recentMessages: ContactMessageDTO[];
  recentEvents: EventDTO[];
}

export interface AdminMembersResponse {
  members: Array<MemberDTO & { user?: UserDTO | null }>;
}

export interface AdminDonationsResponse {
  donations: DonationDTO[];
}

export interface AdminContactMessagesResponse {
  messages: ContactMessageDTO[];
}

export interface AdminUsersResponse {
  users: UserDTO[];
}

export interface AdminContentResponse {
  blocks: SiteContentDTO[];
}

export interface AdminEventsResponse {
  events: EventDTO[];
}

export interface AdminGalleryResponse {
  albums: Array<GalleryAlbumDTO & { itemCount: number }>;
}

export interface AdminSettingsResponse {
  settings: Array<SiteSettingDTO | { key: string; value: string }>;
}

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}
