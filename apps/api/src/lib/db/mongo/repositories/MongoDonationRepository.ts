import { connectMongo } from '../connection';
import { DonationModel } from '../models/Donation';
import type { IDonationRepository } from '../../repositories/interfaces';
import type { IDonation, PaymentStatus, PaginationParams, PaginatedResult } from '../../types';
import { toEntity, paginate, paginationToSkip } from './helpers';

export class MongoDonationRepository implements IDonationRepository {
  private async model() {
    await connectMongo();
    return DonationModel;
  }

  async findById(id: string): Promise<IDonation | null> {
    const M = await this.model();
    const doc = await M.findById(id);
    return doc ? toEntity<IDonation>(doc) : null;
  }

  async findAll(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IDonation>> {
    const M = await this.model();
    const skip = paginationToSkip(pagination);
    const [docs, total] = await Promise.all([
      M.find().sort({ createdAt: -1 }).skip(skip).limit(pagination.limit),
      M.countDocuments(),
    ]);
    return paginate<IDonation>(docs, total, pagination);
  }

  async create(data: Omit<IDonation, 'id' | 'createdAt' | 'updatedAt'>): Promise<IDonation> {
    const M = await this.model();
    const doc = await M.create(data);
    return toEntity<IDonation>(doc);
  }

  async update(id: string, data: Partial<IDonation>): Promise<IDonation | null> {
    const M = await this.model();
    const doc = await M.findByIdAndUpdate(id, { $set: data }, { new: true });
    return doc ? toEntity<IDonation>(doc) : null;
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

  async findByRazorpayOrderId(orderId: string): Promise<IDonation | null> {
    const M = await this.model();
    const doc = await M.findOne({ razorpayOrderId: orderId });
    return doc ? toEntity<IDonation>(doc) : null;
  }

  async findByRazorpayPaymentId(paymentId: string): Promise<IDonation | null> {
    const M = await this.model();
    const doc = await M.findOne({ razorpayPaymentId: paymentId });
    return doc ? toEntity<IDonation>(doc) : null;
  }

  async findByStatus(status: PaymentStatus, pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IDonation>> {
    const M = await this.model();
    const skip = paginationToSkip(pagination);
    const [docs, total] = await Promise.all([
      M.find({ status }).sort({ createdAt: -1 }).skip(skip).limit(pagination.limit),
      M.countDocuments({ status }),
    ]);
    return paginate<IDonation>(docs, total, pagination);
  }

  async findPublicDonors(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IDonation>> {
    const M = await this.model();
    const skip = paginationToSkip(pagination);
    const filter = { status: 'SUCCESS', isAnonymous: false, showInDonorList: true };
    const [docs, total] = await Promise.all([
      M.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pagination.limit),
      M.countDocuments(filter),
    ]);
    return paginate<IDonation>(docs, total, pagination);
  }

  async getTotalAmount(status?: PaymentStatus): Promise<number> {
    const M = await this.model();
    const match = status ? { status } : { status: 'SUCCESS' };
    const result = await M.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total || 0;
  }

  async getMonthlyTotal(year: number, month: number): Promise<number> {
    const M = await this.model();
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    const result = await M.aggregate([
      { $match: { status: 'SUCCESS', createdAt: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total || 0;
  }
}
