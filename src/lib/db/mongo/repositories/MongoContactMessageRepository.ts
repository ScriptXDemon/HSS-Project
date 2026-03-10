import { connectMongo } from '../connection';
import { ContactMessageModel } from '../models/ContactMessage';
import type { IContactMessageRepository } from '../../repositories/interfaces';
import type { IContactMessage, PaginationParams, PaginatedResult } from '../../types';
import { toEntity, paginate, paginationToSkip } from './helpers';

export class MongoContactMessageRepository implements IContactMessageRepository {
  private async model() {
    await connectMongo();
    return ContactMessageModel;
  }

  async findById(id: string): Promise<IContactMessage | null> {
    const M = await this.model();
    const doc = await M.findById(id);
    return doc ? toEntity<IContactMessage>(doc) : null;
  }

  async findAll(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IContactMessage>> {
    const M = await this.model();
    const skip = paginationToSkip(pagination);
    const [docs, total] = await Promise.all([
      M.find().sort({ createdAt: -1 }).skip(skip).limit(pagination.limit),
      M.countDocuments(),
    ]);
    return paginate<IContactMessage>(docs, total, pagination);
  }

  async create(data: Omit<IContactMessage, 'id' | 'createdAt' | 'updatedAt'>): Promise<IContactMessage> {
    const M = await this.model();
    const doc = await M.create(data);
    return toEntity<IContactMessage>(doc);
  }

  async update(id: string, data: Partial<IContactMessage>): Promise<IContactMessage | null> {
    const M = await this.model();
    const doc = await M.findByIdAndUpdate(id, { $set: data }, { new: true });
    return doc ? toEntity<IContactMessage>(doc) : null;
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

  async findUnread(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IContactMessage>> {
    const M = await this.model();
    const skip = paginationToSkip(pagination);
    const filter = { isRead: false };
    const [docs, total] = await Promise.all([
      M.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pagination.limit),
      M.countDocuments(filter),
    ]);
    return paginate<IContactMessage>(docs, total, pagination);
  }

  async markAsRead(id: string): Promise<boolean> {
    const M = await this.model();
    const result = await M.findByIdAndUpdate(id, { $set: { isRead: true } });
    return !!result;
  }

  async countUnread(): Promise<number> {
    const M = await this.model();
    return M.countDocuments({ isRead: false });
  }
}
