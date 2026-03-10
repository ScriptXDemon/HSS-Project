import { prisma } from '../client';
import type { IGalleryAlbumRepository } from '../../repositories/interfaces';
import type { IGalleryAlbum, IGalleryItem, PaginationParams, PaginatedResult } from '../../types';
import { buildPaginatedResult, paginationToSkipTake } from './helpers';

function toEntity(r: unknown): IGalleryAlbum {
  return r as IGalleryAlbum;
}

export class PrismaGalleryAlbumRepository implements IGalleryAlbumRepository {
  async findById(id: string): Promise<IGalleryAlbum | null> {
    const r = await prisma.galleryAlbum.findUnique({ where: { id } });
    return r ? toEntity(r) : null;
  }

  async findAll(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IGalleryAlbum>> {
    const { skip, take } = paginationToSkipTake(pagination);
    const [records, total] = await Promise.all([
      prisma.galleryAlbum.findMany({ orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.galleryAlbum.count(),
    ]);
    return buildPaginatedResult(records.map(toEntity), total, pagination);
  }

  async create(data: Omit<IGalleryAlbum, 'id' | 'createdAt' | 'updatedAt'>): Promise<IGalleryAlbum> {
    const r = await prisma.galleryAlbum.create({ data });
    return toEntity(r);
  }

  async update(id: string, data: Partial<IGalleryAlbum>): Promise<IGalleryAlbum | null> {
    try {
      const r = await prisma.galleryAlbum.update({ where: { id }, data: data as Parameters<typeof prisma.galleryAlbum.update>[0]['data'] });
      return toEntity(r);
    } catch { return null; }
  }

  async delete(id: string): Promise<boolean> {
    try { await prisma.galleryAlbum.delete({ where: { id } }); return true; }
    catch { return false; }
  }

  async count(filter?: Record<string, unknown>): Promise<number> {
    return prisma.galleryAlbum.count(filter ? { where: filter as any } : undefined);
  }

  async findWithItems(id: string): Promise<(IGalleryAlbum & { items: IGalleryItem[] }) | null> {
    const r = await prisma.galleryAlbum.findUnique({
      where: { id },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });
    return r ? (r as unknown as IGalleryAlbum & { items: IGalleryItem[] }) : null;
  }
}
