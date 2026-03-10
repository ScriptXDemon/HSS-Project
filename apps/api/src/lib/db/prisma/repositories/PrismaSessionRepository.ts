import { prisma } from '../client';
import type { ISessionRepository } from '../../repositories/interfaces';
import type { ISession, PaginationParams, PaginatedResult } from '../../types';
import { buildPaginatedResult, paginationToSkipTake } from './helpers';

function toEntity(r: unknown): ISession {
  return r as ISession;
}

export class PrismaSessionRepository implements ISessionRepository {
  async findById(id: string): Promise<ISession | null> {
    const r = await prisma.session.findUnique({ where: { id } });
    return r ? toEntity(r) : null;
  }

  async findAll(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<ISession>> {
    const { skip, take } = paginationToSkipTake(pagination);
    const [records, total] = await Promise.all([
      prisma.session.findMany({ orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.session.count(),
    ]);
    return buildPaginatedResult(records.map(toEntity), total, pagination);
  }

  async create(data: Omit<ISession, 'id' | 'createdAt' | 'updatedAt'>): Promise<ISession> {
    const r = await prisma.session.create({ data: data as Parameters<typeof prisma.session.create>[0]['data'] });
    return toEntity(r);
  }

  async update(id: string, data: Partial<ISession>): Promise<ISession | null> {
    try {
      const r = await prisma.session.update({ where: { id }, data: data as Parameters<typeof prisma.session.update>[0]['data'] });
      return toEntity(r);
    } catch { return null; }
  }

  async delete(id: string): Promise<boolean> {
    try { await prisma.session.delete({ where: { id } }); return true; }
    catch { return false; }
  }

  async count(filter?: Record<string, unknown>): Promise<number> {
    return prisma.session.count(filter ? { where: filter as any } : undefined);
  }

  async findByToken(token: string): Promise<ISession | null> {
    const r = await prisma.session.findUnique({ where: { token } });
    return r ? toEntity(r) : null;
  }

  async deleteByUserId(userId: string): Promise<number> {
    const result = await prisma.session.deleteMany({ where: { userId } });
    return result.count;
  }

  async deleteExpired(): Promise<number> {
    const result = await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    return result.count;
  }
}
