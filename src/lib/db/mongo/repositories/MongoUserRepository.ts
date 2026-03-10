import { connectMongo } from '../connection';
import { UserModel } from '../models/User';
import type { IUserRepository } from '../../repositories/interfaces';
import type { IUser, Role, PaginationParams, PaginatedResult } from '../../types';
import { toEntity, paginate, paginationToSkip } from './helpers';

export class MongoUserRepository implements IUserRepository {
  private async model() {
    await connectMongo();
    return UserModel;
  }

  async findById(id: string): Promise<IUser | null> {
    const M = await this.model();
    const doc = await M.findById(id);
    return doc ? toEntity<IUser>(doc) : null;
  }

  async findAll(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IUser>> {
    const M = await this.model();
    const skip = paginationToSkip(pagination);
    const [docs, total] = await Promise.all([
      M.find().sort({ createdAt: -1 }).skip(skip).limit(pagination.limit),
      M.countDocuments(),
    ]);
    return paginate<IUser>(docs, total, pagination);
  }

  async create(data: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<IUser> {
    const M = await this.model();
    const doc = await M.create(data);
    return toEntity<IUser>(doc);
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    const M = await this.model();
    const doc = await M.findByIdAndUpdate(id, { $set: data }, { new: true });
    return doc ? toEntity<IUser>(doc) : null;
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

  async findByEmail(email: string): Promise<IUser | null> {
    const M = await this.model();
    const doc = await M.findOne({ email });
    return doc ? toEntity<IUser>(doc) : null;
  }

  async findByPhone(phone: string): Promise<IUser | null> {
    const M = await this.model();
    const doc = await M.findOne({ phone });
    return doc ? toEntity<IUser>(doc) : null;
  }

  async findByRole(role: Role, pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IUser>> {
    const M = await this.model();
    const skip = paginationToSkip(pagination);
    const [docs, total] = await Promise.all([
      M.find({ role }).sort({ createdAt: -1 }).skip(skip).limit(pagination.limit),
      M.countDocuments({ role }),
    ]);
    return paginate<IUser>(docs, total, pagination);
  }

  async updatePassword(id: string, passwordHash: string): Promise<boolean> {
    const M = await this.model();
    const result = await M.findByIdAndUpdate(id, { $set: { passwordHash } });
    return !!result;
  }

  async setApproval(id: string, isApproved: boolean): Promise<boolean> {
    const M = await this.model();
    const result = await M.findByIdAndUpdate(id, { $set: { isApproved } });
    return !!result;
  }
}
