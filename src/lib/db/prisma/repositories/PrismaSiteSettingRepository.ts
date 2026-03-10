import { prisma } from '../client';
import type { ISiteSettingRepository } from '../../repositories/interfaces';
import type { ISiteSetting, PaginationParams, PaginatedResult } from '../../types';
import { buildPaginatedResult, paginationToSkipTake } from './helpers';

function toEntity(r: unknown): ISiteSetting {
  return r as ISiteSetting;
}

export class PrismaSiteSettingRepository implements ISiteSettingRepository {
  async findById(id: string): Promise<ISiteSetting | null> {
    const r = await prisma.siteSetting.findUnique({ where: { id } });
    return r ? toEntity(r) : null;
  }

  async findAll(pagination: PaginationParams = { page: 1, limit: 50 }): Promise<PaginatedResult<ISiteSetting>> {
    const { skip, take } = paginationToSkipTake(pagination);
    const [records, total] = await Promise.all([
      prisma.siteSetting.findMany({ orderBy: { key: 'asc' }, skip, take }),
      prisma.siteSetting.count(),
    ]);
    return buildPaginatedResult(records.map(toEntity), total, pagination);
  }

  async create(data: Omit<ISiteSetting, 'id' | 'createdAt' | 'updatedAt'>): Promise<ISiteSetting> {
    const r = await prisma.siteSetting.create({ data });
    return toEntity(r);
  }

  async update(id: string, data: Partial<ISiteSetting>): Promise<ISiteSetting | null> {
    try {
      const r = await prisma.siteSetting.update({ where: { id }, data: data as Parameters<typeof prisma.siteSetting.update>[0]['data'] });
      return toEntity(r);
    } catch { return null; }
  }

  async delete(id: string): Promise<boolean> {
    try { await prisma.siteSetting.delete({ where: { id } }); return true; }
    catch { return false; }
  }

  async count(filter?: Record<string, unknown>): Promise<number> {
    return prisma.siteSetting.count(filter ? { where: filter as any } : undefined);
  }

  async findByKey(key: string): Promise<ISiteSetting | null> {
    const r = await prisma.siteSetting.findUnique({ where: { key } });
    return r ? toEntity(r) : null;
  }

  async upsertByKey(key: string, value: string): Promise<ISiteSetting> {
    const r = await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    return toEntity(r);
  }

  async getMultiple(keys: string[]): Promise<ISiteSetting[]> {
    const records = await prisma.siteSetting.findMany({ where: { key: { in: keys } } });
    return records.map(toEntity);
  }
}
