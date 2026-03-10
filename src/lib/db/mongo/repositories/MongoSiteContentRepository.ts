import { connectMongo } from '../connection';
import { SiteContentModel } from '../models/SiteContent';
import type { ISiteContentRepository } from '../../repositories/interfaces';
import type { ISiteContent, PaginationParams, PaginatedResult } from '../../types';
import { toEntity, paginate, paginationToSkip } from './helpers';

export class MongoSiteContentRepository implements ISiteContentRepository {
  private async model() {
    await connectMongo();
    return SiteContentModel;
  }

  async findById(id: string): Promise<ISiteContent | null> {
    const M = await this.model();
    const doc = await M.findById(id);
    return doc ? toEntity<ISiteContent>(doc) : null;
  }

  async findAll(pagination: PaginationParams = { page: 1, limit: 50 }): Promise<PaginatedResult<ISiteContent>> {
    const M = await this.model();
    const skip = paginationToSkip(pagination);
    const [docs, total] = await Promise.all([
      M.find().sort({ key: 1 }).skip(skip).limit(pagination.limit),
      M.countDocuments(),
    ]);
    return paginate<ISiteContent>(docs, total, pagination);
  }

  async create(data: Omit<ISiteContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<ISiteContent> {
    const M = await this.model();
    const doc = await M.create(data);
    return toEntity<ISiteContent>(doc);
  }

  async update(id: string, data: Partial<ISiteContent>): Promise<ISiteContent | null> {
    const M = await this.model();
    const doc = await M.findByIdAndUpdate(id, { $set: data }, { new: true });
    return doc ? toEntity<ISiteContent>(doc) : null;
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

  async findByKey(key: string): Promise<ISiteContent | null> {
    const M = await this.model();
    const doc = await M.findOne({ key });
    return doc ? toEntity<ISiteContent>(doc) : null;
  }

  async upsertByKey(key: string, data: { title?: string; body: string }): Promise<ISiteContent> {
    const M = await this.model();
    const doc = await M.findOneAndUpdate(
      { key },
      { $set: { ...data, key } },
      { new: true, upsert: true }
    );
    return toEntity<ISiteContent>(doc);
  }
}
