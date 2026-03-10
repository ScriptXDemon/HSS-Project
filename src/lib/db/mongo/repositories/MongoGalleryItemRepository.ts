import { connectMongo } from '../connection';
import { GalleryItemModel } from '../models/GalleryItem';
import type { IGalleryItemRepository } from '../../repositories/interfaces';
import type { IGalleryItem, PaginationParams, PaginatedResult } from '../../types';
import { toEntity, paginate, paginationToSkip } from './helpers';

export class MongoGalleryItemRepository implements IGalleryItemRepository {
  private async model() {
    await connectMongo();
    return GalleryItemModel;
  }

  async findById(id: string): Promise<IGalleryItem | null> {
    const M = await this.model();
    const doc = await M.findById(id);
    return doc ? toEntity<IGalleryItem>(doc) : null;
  }

  async findAll(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IGalleryItem>> {
    const M = await this.model();
    const skip = paginationToSkip(pagination);
    const [docs, total] = await Promise.all([
      M.find().sort({ sortOrder: 1 }).skip(skip).limit(pagination.limit),
      M.countDocuments(),
    ]);
    return paginate<IGalleryItem>(docs, total, pagination);
  }

  async create(data: Omit<IGalleryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<IGalleryItem> {
    const M = await this.model();
    const doc = await M.create(data);
    return toEntity<IGalleryItem>(doc);
  }

  async update(id: string, data: Partial<IGalleryItem>): Promise<IGalleryItem | null> {
    const M = await this.model();
    const doc = await M.findByIdAndUpdate(id, { $set: data }, { new: true });
    return doc ? toEntity<IGalleryItem>(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const M = await this.model();
    const result = await M.findByIdAndDelete(id);
    return !!result;
  }

  async count(filter?: Record<string, unknown>): Promise<number> {
    const M = await this.model();
    return M.countDocuments(filter || {});
  }

  async findByAlbum(albumId: string, pagination: PaginationParams = { page: 1, limit: 50 }): Promise<PaginatedResult<IGalleryItem>> {
    const M = await this.model();
    const skip = paginationToSkip(pagination);
    const [docs, total] = await Promise.all([
      M.find({ albumId }).sort({ sortOrder: 1 }).skip(skip).limit(pagination.limit),
      M.countDocuments({ albumId }),
    ]);
    return paginate<IGalleryItem>(docs, total, pagination);
  }

  async reorder(albumId: string, itemIds: string[]): Promise<boolean> {
    const M = await this.model();
    const ops = itemIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, albumId },
        update: { $set: { sortOrder: index } },
      },
    }));
    await M.bulkWrite(ops);
    return true;
  }

  async deleteByAlbum(albumId: string): Promise<number> {
    const M = await this.model();
    const result = await M.deleteMany({ albumId });
    return result.deletedCount;
  }
}
