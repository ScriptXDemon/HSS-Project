import { prisma } from '../client';
import type { IGalleryItemRepository } from '../../repositories/interfaces';
import type { IGalleryItem, PaginationParams, PaginatedResult } from '../../types';
import { buildPaginatedResult, paginationToSkipTake } from './helpers';

function toEntity(r: unknown): IGalleryItem {
  return r as IGalleryItem;
}

export class PrismaGalleryItemRepository implements IGalleryItemRepository {
  async findById(id: string): Promise<IGalleryItem | null> {
    const r = await prisma.galleryItem.findUnique({ where: { id } });
    return r ? toEntity(r) : null;
  }

  async findAll(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IGalleryItem>> {
    const { skip, take } = paginationToSkipTake(pagination);
    const [records, total] = await Promise.all([
      prisma.galleryItem.findMany({ orderBy: { sortOrder: 'asc' }, skip, take }),
      prisma.galleryItem.count(),
    ]);
    return buildPaginatedResult(records.map(toEntity), total, pagination);
  }

  async create(data: Omit<IGalleryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<IGalleryItem> {
    const r = await prisma.galleryItem.create({ data: data as Parameters<typeof prisma.galleryItem.create>[0]['data'] });
    return toEntity(r);
  }

  async update(id: string, data: Partial<IGalleryItem>): Promise<IGalleryItem | null> {
    try {
      const r = await prisma.galleryItem.update({ where: { id }, data: data as Parameters<typeof prisma.galleryItem.update>[0]['data'] });
      return toEntity(r);
    } catch { return null; }
  }

  async delete(id: string): Promise<boolean> {
    try { await prisma.galleryItem.delete({ where: { id } }); return true; }
    catch { return false; }
  }

  async count(filter?: Record<string, unknown>): Promise<number> {
    return prisma.galleryItem.count(filter ? { where: filter as any } : undefined);
  }

  async findByAlbum(albumId: string, pagination: PaginationParams = { page: 1, limit: 50 }): Promise<PaginatedResult<IGalleryItem>> {
    const { skip, take } = paginationToSkipTake(pagination);
    const [records, total] = await Promise.all([
      prisma.galleryItem.findMany({ where: { albumId }, orderBy: { sortOrder: 'asc' }, skip, take }),
      prisma.galleryItem.count({ where: { albumId } }),
    ]);
    return buildPaginatedResult(records.map(toEntity), total, pagination);
  }

  async reorder(albumId: string, itemIds: string[]): Promise<boolean> {
    await prisma.$transaction(
      itemIds.map((id, index) =>
        prisma.galleryItem.update({ where: { id }, data: { sortOrder: index } })
      )
    );
    return true;
  }

  async deleteByAlbum(albumId: string): Promise<number> {
    const result = await prisma.galleryItem.deleteMany({ where: { albumId } });
    return result.count;
  }
}
