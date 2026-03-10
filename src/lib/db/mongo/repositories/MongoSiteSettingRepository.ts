import { connectMongo } from '../connection';
import { SiteSettingModel } from '../models/SiteSetting';
import type { ISiteSettingRepository } from '../../repositories/interfaces';
import type { ISiteSetting, PaginationParams, PaginatedResult } from '../../types';
import { toEntity, paginate, paginationToSkip } from './helpers';

export class MongoSiteSettingRepository implements ISiteSettingRepository {
  private async model() {
    await connectMongo();
    return SiteSettingModel;
  }

  async findById(id: string): Promise<ISiteSetting | null> {
    const M = await this.model();
    const doc = await M.findById(id);
    return doc ? toEntity<ISiteSetting>(doc) : null;
  }

  async findAll(pagination: PaginationParams = { page: 1, limit: 50 }): Promise<PaginatedResult<ISiteSetting>> {
    const M = await this.model();
    const skip = paginationToSkip(pagination);
    const [docs, total] = await Promise.all([
      M.find().sort({ key: 1 }).skip(skip).limit(pagination.limit),
      M.countDocuments(),
    ]);
    return paginate<ISiteSetting>(docs, total, pagination);
  }

  async create(data: Omit<ISiteSetting, 'id' | 'createdAt' | 'updatedAt'>): Promise<ISiteSetting> {
    const M = await this.model();
    const doc = await M.create(data);
    return toEntity<ISiteSetting>(doc);
  }

  async update(id: string, data: Partial<ISiteSetting>): Promise<ISiteSetting | null> {
    const M = await this.model();
    const doc = await M.findByIdAndUpdate(id, { $set: data }, { new: true });
    return doc ? toEntity<ISiteSetting>(doc) : null;
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

  async findByKey(key: string): Promise<ISiteSetting | null> {
    const M = await this.model();
    const doc = await M.findOne({ key });
    return doc ? toEntity<ISiteSetting>(doc) : null;
  }

  async upsertByKey(key: string, value: string): Promise<ISiteSetting> {
    const M = await this.model();
    const doc = await M.findOneAndUpdate(
      { key },
      { $set: { key, value } },
      { new: true, upsert: true }
    );
    return toEntity<ISiteSetting>(doc);
  }

  async getMultiple(keys: string[]): Promise<ISiteSetting[]> {
    const M = await this.model();
    const docs = await M.find({ key: { $in: keys } });
    return docs.map((d) => toEntity<ISiteSetting>(d));
  }
}
