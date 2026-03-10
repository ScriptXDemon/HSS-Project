import type { IRepositories } from '../../repositories/interfaces';
import { MongoUserRepository } from './MongoUserRepository';
import { MongoSessionRepository } from './MongoSessionRepository';
import { MongoMemberRepository } from './MongoMemberRepository';
import { MongoEventRepository } from './MongoEventRepository';
import { MongoDonationRepository } from './MongoDonationRepository';
import { MongoGalleryAlbumRepository } from './MongoGalleryAlbumRepository';
import { MongoGalleryItemRepository } from './MongoGalleryItemRepository';
import { MongoContactMessageRepository } from './MongoContactMessageRepository';
import { MongoSiteContentRepository } from './MongoSiteContentRepository';
import { MongoImportantLinkRepository } from './MongoImportantLinkRepository';
import { MongoSiteSettingRepository } from './MongoSiteSettingRepository';

export function createMongoRepositories(): IRepositories {
  return {
    user: new MongoUserRepository(),
    session: new MongoSessionRepository(),
    member: new MongoMemberRepository(),
    event: new MongoEventRepository(),
    donation: new MongoDonationRepository(),
    galleryAlbum: new MongoGalleryAlbumRepository(),
    galleryItem: new MongoGalleryItemRepository(),
    contactMessage: new MongoContactMessageRepository(),
    siteContent: new MongoSiteContentRepository(),
    importantLink: new MongoImportantLinkRepository(),
    siteSetting: new MongoSiteSettingRepository(),
  };
}
