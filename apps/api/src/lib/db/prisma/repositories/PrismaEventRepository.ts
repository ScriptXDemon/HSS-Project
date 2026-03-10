import { prisma } from '../client';
import type { IEventRepository } from '../../repositories/interfaces';
import type { IEvent, PaginationParams, PaginatedResult } from '../../types';
import { buildPaginatedResult, paginationToSkipTake } from './helpers';

function toEntity(r: unknown): IEvent {
  return r as IEvent;
}

export class PrismaEventRepository implements IEventRepository {
  async findById(id: string): Promise<IEvent | null> {
    const r = await prisma.event.findUnique({ where: { id } });
    return r ? toEntity(r) : null;
  }

  async findAll(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IEvent>> {
    const { skip, take } = paginationToSkipTake(pagination);
    const [records, total] = await Promise.all([
      prisma.event.findMany({ orderBy: { date: 'desc' }, skip, take }),
      prisma.event.count(),
    ]);
    return buildPaginatedResult(records.map(toEntity), total, pagination);
  }

  async create(data: Omit<IEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<IEvent> {
    const r = await prisma.event.create({ data: data as Parameters<typeof prisma.event.create>[0]['data'] });
    return toEntity(r);
  }

  async update(id: string, data: Partial<IEvent>): Promise<IEvent | null> {
    try {
      const r = await prisma.event.update({ where: { id }, data: data as Parameters<typeof prisma.event.update>[0]['data'] });
      return toEntity(r);
    } catch { return null; }
  }

  async delete(id: string): Promise<boolean> {
    try { await prisma.event.delete({ where: { id } }); return true; }
    catch { return false; }
  }

  async count(filter?: Record<string, unknown>): Promise<number> {
    return prisma.event.count(filter ? { where: filter as any } : undefined);
  }

  async findBySlug(slug: string): Promise<IEvent | null> {
    const r = await prisma.event.findUnique({ where: { slug } });
    return r ? toEntity(r) : null;
  }

  async findUpcoming(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IEvent>> {
    const { skip, take } = paginationToSkipTake(pagination);
    const where = { isPublished: true, date: { gte: new Date() } };
    const [records, total] = await Promise.all([
      prisma.event.findMany({ where, orderBy: { date: 'asc' }, skip, take }),
      prisma.event.count({ where }),
    ]);
    return buildPaginatedResult(records.map(toEntity), total, pagination);
  }

  async findPast(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IEvent>> {
    const { skip, take } = paginationToSkipTake(pagination);
    const where = { isPublished: true, date: { lt: new Date() } };
    const [records, total] = await Promise.all([
      prisma.event.findMany({ where, orderBy: { date: 'desc' }, skip, take }),
      prisma.event.count({ where }),
    ]);
    return buildPaginatedResult(records.map(toEntity), total, pagination);
  }

  async findPublished(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IEvent>> {
    const { skip, take } = paginationToSkipTake(pagination);
    const where = { isPublished: true };
    const [records, total] = await Promise.all([
      prisma.event.findMany({ where, orderBy: { date: 'desc' }, skip, take }),
      prisma.event.count({ where }),
    ]);
    return buildPaginatedResult(records.map(toEntity), total, pagination);
  }
}
