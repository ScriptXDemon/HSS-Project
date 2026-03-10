import type {
  IUser, ISession, IMember, IGalleryAlbum, IGalleryItem,
  IEvent, IDonation, IContactMessage, ISiteContent,
  IImportantLink, ISiteSetting, PaginationParams,
  PaginatedResult, MemberStatus, PaymentStatus, Role,
} from '../types';

export interface IBaseRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(pagination?: PaginationParams): Promise<PaginatedResult<T>>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(filter?: Record<string, unknown>): Promise<number>;
}

export interface IUserRepository extends IBaseRepository<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findByPhone(phone: string): Promise<IUser | null>;
  findByRole(role: Role, pagination?: PaginationParams): Promise<PaginatedResult<IUser>>;
  updatePassword(id: string, passwordHash: string): Promise<boolean>;
  setApproval(id: string, isApproved: boolean): Promise<boolean>;
}

export interface ISessionRepository extends IBaseRepository<ISession> {
  findByToken(token: string): Promise<ISession | null>;
  deleteByUserId(userId: string): Promise<number>;
  deleteExpired(): Promise<number>;
}

export interface IMemberRepository extends IBaseRepository<IMember> {
  findByUserId(userId: string): Promise<IMember | null>;
  findByStatus(status: MemberStatus, pagination?: PaginationParams): Promise<PaginatedResult<IMember>>;
  findByDistrict(district: string, pagination?: PaginationParams): Promise<PaginatedResult<IMember>>;
  updateStatus(id: string, status: MemberStatus): Promise<IMember | null>;
  assignIdCard(id: string, idCardNumber: string): Promise<IMember | null>;
  search(query: string, pagination?: PaginationParams): Promise<PaginatedResult<IMember>>;
}

export interface IGalleryAlbumRepository extends IBaseRepository<IGalleryAlbum> {
  findWithItems(id: string): Promise<(IGalleryAlbum & { items: IGalleryItem[] }) | null>;
}

export interface IGalleryItemRepository extends IBaseRepository<IGalleryItem> {
  findByAlbum(albumId: string, pagination?: PaginationParams): Promise<PaginatedResult<IGalleryItem>>;
  reorder(albumId: string, itemIds: string[]): Promise<boolean>;
  deleteByAlbum(albumId: string): Promise<number>;
}

export interface IEventRepository extends IBaseRepository<IEvent> {
  findBySlug(slug: string): Promise<IEvent | null>;
  findUpcoming(pagination?: PaginationParams): Promise<PaginatedResult<IEvent>>;
  findPast(pagination?: PaginationParams): Promise<PaginatedResult<IEvent>>;
  findPublished(pagination?: PaginationParams): Promise<PaginatedResult<IEvent>>;
}

export interface IDonationRepository extends IBaseRepository<IDonation> {
  findByRazorpayOrderId(orderId: string): Promise<IDonation | null>;
  findByRazorpayPaymentId(paymentId: string): Promise<IDonation | null>;
  findByStatus(status: PaymentStatus, pagination?: PaginationParams): Promise<PaginatedResult<IDonation>>;
  findPublicDonors(pagination?: PaginationParams): Promise<PaginatedResult<IDonation>>;
  getTotalAmount(status?: PaymentStatus): Promise<number>;
  getMonthlyTotal(year: number, month: number): Promise<number>;
}

export interface IContactMessageRepository extends IBaseRepository<IContactMessage> {
  findUnread(pagination?: PaginationParams): Promise<PaginatedResult<IContactMessage>>;
  markAsRead(id: string): Promise<boolean>;
  countUnread(): Promise<number>;
}

export interface ISiteContentRepository extends IBaseRepository<ISiteContent> {
  findByKey(key: string): Promise<ISiteContent | null>;
  upsertByKey(key: string, data: { title?: string; body: string }): Promise<ISiteContent>;
}

export interface IImportantLinkRepository extends IBaseRepository<IImportantLink> {
  findActive(pagination?: PaginationParams): Promise<PaginatedResult<IImportantLink>>;
  reorder(linkIds: string[]): Promise<boolean>;
}

export interface ISiteSettingRepository extends IBaseRepository<ISiteSetting> {
  findByKey(key: string): Promise<ISiteSetting | null>;
  upsertByKey(key: string, value: string): Promise<ISiteSetting>;
  getMultiple(keys: string[]): Promise<ISiteSetting[]>;
}

export interface IRepositories {
  user: IUserRepository;
  session: ISessionRepository;
  member: IMemberRepository;
  galleryAlbum: IGalleryAlbumRepository;
  galleryItem: IGalleryItemRepository;
  event: IEventRepository;
  donation: IDonationRepository;
  contactMessage: IContactMessageRepository;
  siteContent: ISiteContentRepository;
  importantLink: IImportantLinkRepository;
  siteSetting: ISiteSettingRepository;
}
