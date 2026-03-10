import { connectMongo } from '../connection';
import { SessionModel } from '../models/Session';
import type { ISessionRepository } from '../../repositories/interfaces';
import type { ISession, PaginationParams, PaginatedResult } from '../../types';
import { toEntity, paginate, paginationToSkip } from './helpers';

export class MongoSessionRepository implements ISessionRepository {
  private async model() {
    await connectMongo();
    return SessionModel;
  }

  async findById(id: string): Promise<ISession | null> {
    const M = await this.model();
    const doc = await M.findById(id);
    return doc ? toEntity<ISession>(doc) : null;
  }

  async findAll(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<ISession>> {
    const M = await this.model();
    const skip = paginationToSkip(pagination);
    const [docs, total] = await Promise.all([
      M.find().sort({ createdAt: -1 }).skip(skip).limit(pagination.limit),
      M.countDocuments(),
    ]);
    return paginate<ISession>(docs, total, pagination);
  }

  async create(data: Omit<ISession, 'id' | 'createdAt' | 'updatedAt'>): Promise<ISession> {
    const M = await this.model();
    const doc = await M.create(data);
    return toEntity<ISession>(doc);
  }

  async update(id: string, data: Partial<ISession>): Promise<ISession | null> {
    const M = await this.model();
    const doc = await M.findByIdAndUpdate(id, { $set: data }, { new: true });
    return doc ? toEntity<ISession>(doc) : null;
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

  async findByToken(token: string): Promise<ISession | null> {
    const M = await this.model();
    const doc = await M.findOne({ token });
    return doc ? toEntity<ISession>(doc) : null;
  }

  async deleteByUserId(userId: string): Promise<number> {
    const M = await this.model();
    const result = await M.deleteMany({ userId });
    return result.deletedCount;
  }

  async deleteExpired(): Promise<number> {
    const M = await this.model();
    const result = await M.deleteMany({ expiresAt: { $lt: new Date() } });
    return result.deletedCount;
  }
}
