import { connectMongo } from '../connection';
import { GalleryAlbumModel } from '../models/GalleryAlbum';
import { GalleryItemModel } from '../models/GalleryItem';
import type { IGalleryAlbumRepository } from '../../repositories/interfaces';
import type { IGalleryAlbum, IGalleryItem, PaginationParams, PaginatedResult } from '../../types';
import { toEntity, paginate, paginationToSkip } from './helpers';

export class MongoGalleryAlbumRepository implements IGalleryAlbumRepository {
  private async model() {
    await connectMongo();
    return GalleryAlbumModel;
  }

  async findById(id: string): Promise<IGalleryAlbum | null> {
    const M = await this.model();
    const doc = await M.findById(id);
    return doc ? toEntity<IGalleryAlbum>(doc) : null;
  }

  async findAll(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IGalleryAlbum>> {
    const M = await this.model();
    const skip = paginationToSkip(pagination);
    const [docs, total] = await Promise.all([
      M.find().sort({ createdAt: -1 }).skip(skip).limit(pagination.limit),
      M.countDocuments(),
    ]);
    return paginate<IGalleryAlbum>(docs, total, pagination);
  }

  async create(data: Omit<IGalleryAlbum, 'id' | 'createdAt' | 'updatedAt'>): Promise<IGalleryAlbum> {
    const M = await this.model();
    const doc = await M.create(data);
    return toEntity<IGalleryAlbum>(doc);
  }

  async update(id: string, data: Partial<IGalleryAlbum>): Promise<IGalleryAlbum | null> {
    const M = await this.model();
    const doc = await M.findByIdAndUpdate(id, { $set: data }, { new: true });
    return doc ? toEntity<IGalleryAlbum>(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const M = await this.model();
    await GalleryItemModel.deleteMany({ albumId: id });
    const result = await M.findByIdAndDelete(id);
    return !!result;
  }

  async count(filter?: Record<string, unknown>): Promise<number> {
    const M = await this.model();
    return M.countDocuments(filter || {});
  }

  async findWithItems(id: string): Promise<(IGalleryAlbum & { items: IGalleryItem[] }) | null> {
    const M = await this.model();
    const album = await M.findById(id);
    if (!album) return null;
    const items = await GalleryItemModel.find({ albumId: id }).sort({ sortOrder: 1 });
    return {
      ...toEntity<IGalleryAlbum>(album),
      items: items.map((i) => toEntity<IGalleryItem>(i)),
    };
  }
}
