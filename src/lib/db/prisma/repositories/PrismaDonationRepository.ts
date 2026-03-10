import { prisma } from '../client';
import type { IDonationRepository } from '../../repositories/interfaces';
import type { IDonation, PaymentStatus, PaginationParams, PaginatedResult } from '../../types';
import { buildPaginatedResult, paginationToSkipTake } from './helpers';

function toEntity(r: unknown): IDonation {
  const record = r as Record<string, unknown>;
  return { ...record, amount: Number(record.amount) } as IDonation;
}

export class PrismaDonationRepository implements IDonationRepository {
  async findById(id: string): Promise<IDonation | null> {
    const r = await prisma.donation.findUnique({ where: { id } });
    return r ? toEntity(r) : null;
  }

  async findAll(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IDonation>> {
    const { skip, take } = paginationToSkipTake(pagination);
    const [records, total] = await Promise.all([
      prisma.donation.findMany({ orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.donation.count(),
    ]);
    return buildPaginatedResult(records.map(toEntity), total, pagination);
  }

  async create(data: Omit<IDonation, 'id' | 'createdAt' | 'updatedAt'>): Promise<IDonation> {
    const r = await prisma.donation.create({ data: data as Parameters<typeof prisma.donation.create>[0]['data'] });
    return toEntity(r);
  }

  async update(id: string, data: Partial<IDonation>): Promise<IDonation | null> {
    try {
      const r = await prisma.donation.update({ where: { id }, data: data as Parameters<typeof prisma.donation.update>[0]['data'] });
      return toEntity(r);
    } catch { return null; }
  }

  async delete(id: string): Promise<boolean> {
    try { await prisma.donation.delete({ where: { id } }); return true; }
    catch { return false; }
  }

  async count(filter?: Record<string, unknown>): Promise<number> {
    return prisma.donation.count(filter ? { where: filter as any } : undefined);
  }

  async findByRazorpayOrderId(orderId: string): Promise<IDonation | null> {
    const r = await prisma.donation.findUnique({ where: { razorpayOrderId: orderId } });
    return r ? toEntity(r) : null;
  }

  async findByRazorpayPaymentId(paymentId: string): Promise<IDonation | null> {
    const r = await prisma.donation.findUnique({ where: { razorpayPaymentId: paymentId } });
    return r ? toEntity(r) : null;
  }

  async findByStatus(status: PaymentStatus, pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IDonation>> {
    const { skip, take } = paginationToSkipTake(pagination);
    const [records, total] = await Promise.all([
      prisma.donation.findMany({ where: { status }, orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.donation.count({ where: { status } }),
    ]);
    return buildPaginatedResult(records.map(toEntity), total, pagination);
  }

  async findPublicDonors(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IDonation>> {
    const { skip, take } = paginationToSkipTake(pagination);
    const where = { status: 'SUCCESS' as PaymentStatus, isAnonymous: false, showInDonorList: true };
    const [records, total] = await Promise.all([
      prisma.donation.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.donation.count({ where }),
    ]);
    return buildPaginatedResult(records.map(toEntity), total, pagination);
  }

  async getTotalAmount(status?: PaymentStatus): Promise<number> {
    const result = await prisma.donation.aggregate({
      where: { status: status || 'SUCCESS' },
      _sum: { amount: true },
    });
    return Number(result._sum.amount) || 0;
  }

  async getMonthlyTotal(year: number, month: number): Promise<number> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    const result = await prisma.donation.aggregate({
      where: { status: 'SUCCESS', createdAt: { gte: start, lt: end } },
      _sum: { amount: true },
    });
    return Number(result._sum.amount) || 0;
  }
}
