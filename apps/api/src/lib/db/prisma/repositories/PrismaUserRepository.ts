import { prisma } from '../client';
import type { IUserRepository } from '../../repositories/interfaces';
import type { IUser, Role, PaginationParams, PaginatedResult } from '../../types';
import { buildPaginatedResult, paginationToSkipTake } from './helpers';

function toEntity(r: Record<string, unknown>): IUser {
  return r as unknown as IUser;
}

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<IUser | null> {
    const r = await prisma.user.findUnique({ where: { id } });
    return r ? toEntity(r as unknown as Record<string, unknown>) : null;
  }

  async findAll(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IUser>> {
    const { skip, take } = paginationToSkipTake(pagination);
    const [records, total] = await Promise.all([
      prisma.user.findMany({ orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.user.count(),
    ]);
    return buildPaginatedResult(records.map(r => toEntity(r as unknown as Record<string, unknown>)), total, pagination);
  }

  async create(data: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<IUser> {
    const r = await prisma.user.create({ data: data as Parameters<typeof prisma.user.create>[0]['data'] });
    return toEntity(r as unknown as Record<string, unknown>);
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    try {
      const r = await prisma.user.update({ where: { id }, data: data as Parameters<typeof prisma.user.update>[0]['data'] });
      return toEntity(r as unknown as Record<string, unknown>);
    } catch { return null; }
  }

  async delete(id: string): Promise<boolean> {
    try { await prisma.user.delete({ where: { id } }); return true; }
    catch { return false; }
  }

  async count(filter?: Record<string, unknown>): Promise<number> {
    return prisma.user.count(filter ? { where: filter as any } : undefined);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const r = await prisma.user.findUnique({ where: { email } });
    return r ? toEntity(r as unknown as Record<string, unknown>) : null;
  }

  async findByPhone(phone: string): Promise<IUser | null> {
    const r = await prisma.user.findUnique({ where: { phone } });
    return r ? toEntity(r as unknown as Record<string, unknown>) : null;
  }

  async findByRole(role: Role, pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IUser>> {
    const { skip, take } = paginationToSkipTake(pagination);
    const [records, total] = await Promise.all([
      prisma.user.findMany({ where: { role }, orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.user.count({ where: { role } }),
    ]);
    return buildPaginatedResult(records.map(r => toEntity(r as unknown as Record<string, unknown>)), total, pagination);
  }

  async updatePassword(id: string, passwordHash: string): Promise<boolean> {
    try { await prisma.user.update({ where: { id }, data: { passwordHash } }); return true; }
    catch { return false; }
  }

  async setApproval(id: string, isApproved: boolean): Promise<boolean> {
    try { await prisma.user.update({ where: { id }, data: { isApproved } }); return true; }
    catch { return false; }
  }
}
