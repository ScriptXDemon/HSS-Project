import type { IRepositories } from '../../repositories/interfaces';
import { PrismaUserRepository } from './PrismaUserRepository';
import { PrismaSessionRepository } from './PrismaSessionRepository';
import { PrismaMemberRepository } from './PrismaMemberRepository';
import { PrismaEventRepository } from './PrismaEventRepository';
import { PrismaDonationRepository } from './PrismaDonationRepository';
import { PrismaGalleryAlbumRepository } from './PrismaGalleryAlbumRepository';
import { PrismaGalleryItemRepository } from './PrismaGalleryItemRepository';
import { PrismaContactMessageRepository } from './PrismaContactMessageRepository';
import { PrismaSiteContentRepository } from './PrismaSiteContentRepository';
import { PrismaImportantLinkRepository } from './PrismaImportantLinkRepository';
import { PrismaSiteSettingRepository } from './PrismaSiteSettingRepository';

export function createPrismaRepositories(): IRepositories {
  return {
    user: new PrismaUserRepository(),
    session: new PrismaSessionRepository(),
    member: new PrismaMemberRepository(),
    event: new PrismaEventRepository(),
    donation: new PrismaDonationRepository(),
    galleryAlbum: new PrismaGalleryAlbumRepository(),
    galleryItem: new PrismaGalleryItemRepository(),
    contactMessage: new PrismaContactMessageRepository(),
    siteContent: new PrismaSiteContentRepository(),
    importantLink: new PrismaImportantLinkRepository(),
    siteSetting: new PrismaSiteSettingRepository(),
  };
}
