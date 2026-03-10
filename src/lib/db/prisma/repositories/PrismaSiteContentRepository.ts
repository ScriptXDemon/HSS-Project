import { prisma } from '../client';
import type { ISiteContentRepository } from '../../repositories/interfaces';
import type { ISiteContent, PaginationParams, PaginatedResult } from '../../types';
import { buildPaginatedResult, paginationToSkipTake } from './helpers';

function toEntity(r: unknown): ISiteContent {
  return r as ISiteContent;
}

export class PrismaSiteContentRepository implements ISiteContentRepository {
  async findById(id: string): Promise<ISiteContent | null> {
    const r = await prisma.siteContent.findUnique({ where: { id } });
    return r ? toEntity(r) : null;
  }

  async findAll(pagination: PaginationParams = { page: 1, limit: 50 }): Promise<PaginatedResult<ISiteContent>> {
    const { skip, take } = paginationToSkipTake(pagination);
    const [records, total] = await Promise.all([
      prisma.siteContent.findMany({ orderBy: { key: 'asc' }, skip, take }),
      prisma.siteContent.count(),
    ]);
    return buildPaginatedResult(records.map(toEntity), total, pagination);
  }

  async create(data: Omit<ISiteContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<ISiteContent> {
    const r = await prisma.siteContent.create({ data });
    return toEntity(r);
  }

  async update(id: string, data: Partial<ISiteContent>): Promise<ISiteContent | null> {
    try {
      const r = await prisma.siteContent.update({ where: { id }, data: data as Parameters<typeof prisma.siteContent.update>[0]['data'] });
      return toEntity(r);
    } catch { return null; }
  }

  async delete(id: string): Promise<boolean> {
    try { await prisma.siteContent.delete({ where: { id } }); return true; }
    catch { return false; }
  }

  async count(filter?: Record<string, unknown>): Promise<number> {
    return prisma.siteContent.count(filter ? { where: filter as any } : undefined);
  }

  async findByKey(key: string): Promise<ISiteContent | null> {
    const r = await prisma.siteContent.findUnique({ where: { key } });
    return r ? toEntity(r) : null;
  }

  async upsertByKey(key: string, data: { title?: string; body: string }): Promise<ISiteContent> {
    const r = await prisma.siteContent.upsert({
      where: { key },
      update: data,
      create: { key, ...data },
    });
    return toEntity(r);
  }
}
