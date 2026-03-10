import { prisma } from '../client';
import type { IMemberRepository } from '../../repositories/interfaces';
import type { IMember, MemberStatus, PaginationParams, PaginatedResult } from '../../types';
import { buildPaginatedResult, paginationToSkipTake } from './helpers';

function toEntity(r: unknown): IMember {
  return r as IMember;
}

export class PrismaMemberRepository implements IMemberRepository {
  async findById(id: string): Promise<IMember | null> {
    const r = await prisma.member.findUnique({ where: { id } });
    return r ? toEntity(r) : null;
  }

  async findAll(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IMember>> {
    const { skip, take } = paginationToSkipTake(pagination);
    const [records, total] = await Promise.all([
      prisma.member.findMany({ orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.member.count(),
    ]);
    return buildPaginatedResult(records.map(toEntity), total, pagination);
  }

  async create(data: Omit<IMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<IMember> {
    const r = await prisma.member.create({ data: data as Parameters<typeof prisma.member.create>[0]['data'] });
    return toEntity(r);
  }

  async update(id: string, data: Partial<IMember>): Promise<IMember | null> {
    try {
      const r = await prisma.member.update({ where: { id }, data: data as Parameters<typeof prisma.member.update>[0]['data'] });
      return toEntity(r);
    } catch { return null; }
  }

  async delete(id: string): Promise<boolean> {
    try { await prisma.member.delete({ where: { id } }); return true; }
    catch { return false; }
  }

  async count(filter?: Record<string, unknown>): Promise<number> {
    return prisma.member.count(filter ? { where: filter as any } : undefined);
  }

  async findByUserId(userId: string): Promise<IMember | null> {
    const r = await prisma.member.findUnique({ where: { userId } });
    return r ? toEntity(r) : null;
  }

  async findByStatus(status: MemberStatus, pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IMember>> {
    const { skip, take } = paginationToSkipTake(pagination);
    const [records, total] = await Promise.all([
      prisma.member.findMany({ where: { status }, orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.member.count({ where: { status } }),
    ]);
    return buildPaginatedResult(records.map(toEntity), total, pagination);
  }

  async findByDistrict(district: string, pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IMember>> {
    const { skip, take } = paginationToSkipTake(pagination);
    const where = { district: { contains: district, mode: 'insensitive' as const } };
    const [records, total] = await Promise.all([
      prisma.member.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.member.count({ where }),
    ]);
    return buildPaginatedResult(records.map(toEntity), total, pagination);
  }

  async updateStatus(id: string, status: MemberStatus): Promise<IMember | null> {
    return this.update(id, { status });
  }

  async assignIdCard(id: string, idCardNumber: string): Promise<IMember | null> {
    return this.update(id, { idCardNumber, idCardGeneratedAt: new Date() });
  }

  async search(query: string, pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IMember>> {
    const { skip, take } = paginationToSkipTake(pagination);
    const where = {
      OR: [
        { fullName: { contains: query, mode: 'insensitive' as const } },
        { fatherName: { contains: query, mode: 'insensitive' as const } },
        { district: { contains: query, mode: 'insensitive' as const } },
        { idCardNumber: { contains: query, mode: 'insensitive' as const } },
      ],
    };
    const [records, total] = await Promise.all([
      prisma.member.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.member.count({ where }),
    ]);
    return buildPaginatedResult(records.map(toEntity), total, pagination);
  }
}
