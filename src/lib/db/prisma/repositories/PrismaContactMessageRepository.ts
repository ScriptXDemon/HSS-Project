import { prisma } from '../client';
import type { IContactMessageRepository } from '../../repositories/interfaces';
import type { IContactMessage, PaginationParams, PaginatedResult } from '../../types';
import { buildPaginatedResult, paginationToSkipTake } from './helpers';

function toEntity(r: unknown): IContactMessage {
  return r as IContactMessage;
}

export class PrismaContactMessageRepository implements IContactMessageRepository {
  async findById(id: string): Promise<IContactMessage | null> {
    const r = await prisma.contactMessage.findUnique({ where: { id } });
    return r ? toEntity(r) : null;
  }

  async findAll(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IContactMessage>> {
    const { skip, take } = paginationToSkipTake(pagination);
    const [records, total] = await Promise.all([
      prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.contactMessage.count(),
    ]);
    return buildPaginatedResult(records.map(toEntity), total, pagination);
  }

  async create(data: Omit<IContactMessage, 'id' | 'createdAt' | 'updatedAt'>): Promise<IContactMessage> {
    const r = await prisma.contactMessage.create({ data });
    return toEntity(r);
  }

  async update(id: string, data: Partial<IContactMessage>): Promise<IContactMessage | null> {
    try {
      const r = await prisma.contactMessage.update({ where: { id }, data: data as Parameters<typeof prisma.contactMessage.update>[0]['data'] });
      return toEntity(r);
    } catch { return null; }
  }

  async delete(id: string): Promise<boolean> {
    try { await prisma.contactMessage.delete({ where: { id } }); return true; }
    catch { return false; }
  }

  async count(filter?: Record<string, unknown>): Promise<number> {
    return prisma.contactMessage.count(filter ? { where: filter as any } : undefined);
  }

  async findUnread(pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResult<IContactMessage>> {
    const { skip, take } = paginationToSkipTake(pagination);
    const where = { isRead: false };
    const [records, total] = await Promise.all([
      prisma.contactMessage.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.contactMessage.count({ where }),
    ]);
    return buildPaginatedResult(records.map(toEntity), total, pagination);
  }

  async markAsRead(id: string): Promise<boolean> {
    try { await prisma.contactMessage.update({ where: { id }, data: { isRead: true } }); return true; }
    catch { return false; }
  }

  async countUnread(): Promise<number> {
    return prisma.contactMessage.count({ where: { isRead: false } });
  }
}
