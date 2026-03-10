import { connectMongo } from '../connection';
import { MemberModel } from '../models/Member';
import type { IMemberRepository } from '../../repositories/interfaces';
import type { IMember, MemberStatus, PaginationParams, PaginatedResult } from '../../types';
import { toEntity, paginate, paginationToSkip } from './helpers';

export class MongoMemberRepository implements IMemberRepository {
  private async model() {
    await connectMongo();
    return MemberModel;
  }

  async findById(id: string): Promise<IMember | null> {
    const M = await this.model();
    const doc = await M.findById(id);
    return doc ? toEntity<IMember>(doc) : null;
  }

  async findAll(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IMember>> {
    const M = await this.model();
    const skip = paginationToSkip(pagination);
    const [docs, total] = await Promise.all([
      M.find().sort({ createdAt: -1 }).skip(skip).limit(pagination.limit),
      M.countDocuments(),
    ]);
    return paginate<IMember>(docs, total, pagination);
  }

  async create(data: Omit<IMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<IMember> {
    const M = await this.model();
    const doc = await M.create(data);
    return toEntity<IMember>(doc);
  }

  async update(id: string, data: Partial<IMember>): Promise<IMember | null> {
    const M = await this.model();
    const doc = await M.findByIdAndUpdate(id, { $set: data }, { new: true });
    return doc ? toEntity<IMember>(doc) : null;
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

  async findByUserId(userId: string): Promise<IMember | null> {
    const M = await this.model();
    const doc = await M.findOne({ userId });
    return doc ? toEntity<IMember>(doc) : null;
  }

  async findByStatus(status: MemberStatus, pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IMember>> {
    const M = await this.model();
    const skip = paginationToSkip(pagination);
    const [docs, total] = await Promise.all([
      M.find({ status }).sort({ createdAt: -1 }).skip(skip).limit(pagination.limit),
      M.countDocuments({ status }),
    ]);
    return paginate<IMember>(docs, total, pagination);
  }

  async findByDistrict(district: string, pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IMember>> {
    const M = await this.model();
    const skip = paginationToSkip(pagination);
    const filter = { district: { $regex: district, $options: 'i' } };
    const [docs, total] = await Promise.all([
      M.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pagination.limit),
      M.countDocuments(filter),
    ]);
    return paginate<IMember>(docs, total, pagination);
  }

  async updateStatus(id: string, status: MemberStatus): Promise<IMember | null> {
    return this.update(id, { status });
  }

  async assignIdCard(id: string, idCardNumber: string): Promise<IMember | null> {
    return this.update(id, { idCardNumber, idCardGeneratedAt: new Date() });
  }

  async search(query: string, pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IMember>> {
    const M = await this.model();
    const skip = paginationToSkip(pagination);
    const filter = { $text: { $search: query } };
    const [docs, total] = await Promise.all([
      M.find(filter, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(pagination.limit),
      M.countDocuments(filter),
    ]);
    return paginate<IMember>(docs, total, pagination);
  }
}
