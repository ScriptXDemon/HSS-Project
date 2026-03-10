import { connectMongo } from '../connection';
import { EventModel } from '../models/Event';
import type { IEventRepository } from '../../repositories/interfaces';
import type { IEvent, PaginationParams, PaginatedResult } from '../../types';
import { toEntity, paginate, paginationToSkip } from './helpers';

export class MongoEventRepository implements IEventRepository {
  private async model() {
    await connectMongo();
    return EventModel;
  }

  async findById(id: string): Promise<IEvent | null> {
    const M = await this.model();
    const doc = await M.findById(id);
    return doc ? toEntity<IEvent>(doc) : null;
  }

  async findAll(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IEvent>> {
    const M = await this.model();
    const skip = paginationToSkip(pagination);
    const [docs, total] = await Promise.all([
      M.find().sort({ date: -1 }).skip(skip).limit(pagination.limit),
      M.countDocuments(),
    ]);
    return paginate<IEvent>(docs, total, pagination);
  }

  async create(data: Omit<IEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<IEvent> {
    const M = await this.model();
    const doc = await M.create(data);
    return toEntity<IEvent>(doc);
  }

  async update(id: string, data: Partial<IEvent>): Promise<IEvent | null> {
    const M = await this.model();
    const doc = await M.findByIdAndUpdate(id, { $set: data }, { new: true });
    return doc ? toEntity<IEvent>(doc) : null;
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

  async findBySlug(slug: string): Promise<IEvent | null> {
    const M = await this.model();
    const doc = await M.findOne({ slug });
    return doc ? toEntity<IEvent>(doc) : null;
  }

  async findUpcoming(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IEvent>> {
    const M = await this.model();
    const skip = paginationToSkip(pagination);
    const filter = { isPublished: true, date: { $gte: new Date() } };
    const [docs, total] = await Promise.all([
      M.find(filter).sort({ date: 1 }).skip(skip).limit(pagination.limit),
      M.countDocuments(filter),
    ]);
    return paginate<IEvent>(docs, total, pagination);
  }

  async findPast(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IEvent>> {
    const M = await this.model();
    const skip = paginationToSkip(pagination);
    const filter = { isPublished: true, date: { $lt: new Date() } };
    const [docs, total] = await Promise.all([
      M.find(filter).sort({ date: -1 }).skip(skip).limit(pagination.limit),
      M.countDocuments(filter),
    ]);
    return paginate<IEvent>(docs, total, pagination);
  }

  async findPublished(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IEvent>> {
    const M = await this.model();
    const skip = paginationToSkip(pagination);
    const filter = { isPublished: true };
    const [docs, total] = await Promise.all([
      M.find(filter).sort({ date: -1 }).skip(skip).limit(pagination.limit),
      M.countDocuments(filter),
    ]);
    return paginate<IEvent>(docs, total, pagination);
  }
}
