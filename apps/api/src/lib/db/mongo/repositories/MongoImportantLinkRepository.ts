import { connectMongo } from '../connection';
import { ImportantLinkModel } from '../models/ImportantLink';
import type { IImportantLinkRepository } from '../../repositories/interfaces';
import type { IImportantLink, PaginationParams, PaginatedResult } from '../../types';
import { toEntity, paginate, paginationToSkip } from './helpers';

export class MongoImportantLinkRepository implements IImportantLinkRepository {
  private async model() {
    await connectMongo();
    return ImportantLinkModel;
  }

  async findById(id: string): Promise<IImportantLink | null> {
    const M = await this.model();
    const doc = await M.findById(id);
    return doc ? toEntity<IImportantLink>(doc) : null;
  }

  async findAll(pagination: PaginationParams = { page: 1, limit: 50 }): Promise<PaginatedResult<IImportantLink>> {
    const M = await this.model();
    const skip = paginationToSkip(pagination);
    const [docs, total] = await Promise.all([
      M.find().sort({ sortOrder: 1 }).skip(skip).limit(pagination.limit),
      M.countDocuments(),
    ]);
    return paginate<IImportantLink>(docs, total, pagination);
  }

  async create(data: Omit<IImportantLink, 'id' | 'createdAt' | 'updatedAt'>): Promise<IImportantLink> {
    const M = await this.model();
    const doc = await M.create(data);
    return toEntity<IImportantLink>(doc);
  }

  async update(id: string, data: Partial<IImportantLink>): Promise<IImportantLink | null> {
    const M = await this.model();
    const doc = await M.findByIdAndUpdate(id, { $set: data }, { new: true });
    return doc ? toEntity<IImportantLink>(doc) : null;
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

  async findActive(pagination: PaginationParams = { page: 1, limit: 50 }): Promise<PaginatedResult<IImportantLink>> {
    const M = await this.model();
    const skip = paginationToSkip(pagination);
    const filter = { isActive: true };
    const [docs, total] = await Promise.all([
      M.find(filter).sort({ sortOrder: 1 }).skip(skip).limit(pagination.limit),
      M.countDocuments(filter),
    ]);
    return paginate<IImportantLink>(docs, total, pagination);
  }

  async reorder(linkIds: string[]): Promise<boolean> {
    const M = await this.model();
    const ops = linkIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { sortOrder: index } },
      },
    }));
    await M.bulkWrite(ops);
    return true;
  }
}
