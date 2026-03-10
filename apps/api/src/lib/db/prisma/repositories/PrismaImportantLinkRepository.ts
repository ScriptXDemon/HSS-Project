import { prisma } from '../client';
import type { IImportantLinkRepository } from '../../repositories/interfaces';
import type { IImportantLink, PaginationParams, PaginatedResult } from '../../types';
import { buildPaginatedResult, paginationToSkipTake } from './helpers';

function toEntity(r: unknown): IImportantLink {
  return r as IImportantLink;
}

export class PrismaImportantLinkRepository implements IImportantLinkRepository {
  async findById(id: string): Promise<IImportantLink | null> {
    const r = await prisma.importantLink.findUnique({ where: { id } });
    return r ? toEntity(r) : null;
  }

  async findAll(pagination: PaginationParams = { page: 1, limit: 50 }): Promise<PaginatedResult<IImportantLink>> {
    const { skip, take } = paginationToSkipTake(pagination);
    const [records, total] = await Promise.all([
      prisma.importantLink.findMany({ orderBy: { sortOrder: 'asc' }, skip, take }),
      prisma.importantLink.count(),
    ]);
    return buildPaginatedResult(records.map(toEntity), total, pagination);
  }

  async create(data: Omit<IImportantLink, 'id' | 'createdAt' | 'updatedAt'>): Promise<IImportantLink> {
    const r = await prisma.importantLink.create({ data });
    return toEntity(r);
  }

  async update(id: string, data: Partial<IImportantLink>): Promise<IImportantLink | null> {
    try {
      const r = await prisma.importantLink.update({ where: { id }, data: data as Parameters<typeof prisma.importantLink.update>[0]['data'] });
      return toEntity(r);
    } catch { return null; }
  }

  async delete(id: string): Promise<boolean> {
    try { await prisma.importantLink.delete({ where: { id } }); return true; }
    catch { return false; }
  }

  async count(filter?: Record<string, unknown>): Promise<number> {
    return prisma.importantLink.count(filter ? { where: filter as any } : undefined);
  }

  async findActive(pagination: PaginationParams = { page: 1, limit: 50 }): Promise<PaginatedResult<IImportantLink>> {
    const { skip, take } = paginationToSkipTake(pagination);
    const where = { isActive: true };
    const [records, total] = await Promise.all([
      prisma.importantLink.findMany({ where, orderBy: { sortOrder: 'asc' }, skip, take }),
      prisma.importantLink.count({ where }),
    ]);
    return buildPaginatedResult(records.map(toEntity), total, pagination);
  }

  async reorder(linkIds: string[]): Promise<boolean> {
    await prisma.$transaction(
      linkIds.map((id, index) =>
        prisma.importantLink.update({ where: { id }, data: { sortOrder: index } })
      )
    );
    return true;
  }
}
