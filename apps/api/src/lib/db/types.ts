// Mongo-backed model types returned by the repository layer.

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
export type MemberStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type MediaType = 'IMAGE' | 'VIDEO';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type PaymentMode = 'MANUAL_UPI' | 'RAZORPAY';
export type PaymentProofStatus = 'NOT_REQUIRED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
export type DonationCause = 'temple' | 'event' | 'bhandara' | 'children';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IUser extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: Role;
  isActive?: boolean;
  isApproved: boolean;
  emailVerified: boolean;
  avatar?: string;
}

export interface ISession extends BaseEntity {
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface IMember extends BaseEntity {
  userId: string;
  fullName: string;
  fatherName: string;
  dob: Date;
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
  idCardGeneratedAt?: Date;
  status: MemberStatus;
}

export interface IGalleryAlbum extends BaseEntity {
  title: string;
  description?: string;
  coverImage?: string;
}

export interface IGalleryItem extends BaseEntity {
  albumId: string;
  type: MediaType;
  url: string;
  thumbnail?: string;
  caption?: string;
  sortOrder: number;
}

export interface IEvent extends BaseEntity {
  title: string;
  slug: string;
  description: string;
  coverImage?: string;
  videoUrl?: string;
  date: Date;
  endDate?: Date;
  venue?: string;
  isPublished: boolean;
}

export interface IDonation extends BaseEntity {
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
  verifiedAt?: Date;
  verificationNotes?: string;
  cause?: DonationCause;
}

export interface IContactMessage extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
}

export interface ISiteContent extends BaseEntity {
  key: string;
  title?: string;
  body: string;
}

export interface IImportantLink extends BaseEntity {
  title: string;
  url: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ISiteSetting extends BaseEntity {
  key: string;
  value: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type SortOrder = 'asc' | 'desc';
