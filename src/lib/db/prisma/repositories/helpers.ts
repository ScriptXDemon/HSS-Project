import type { PaginationParams, PaginatedResult } from '../../types';

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  pagination: PaginationParams
): PaginatedResult<T> {
  return {
    data,
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(total / pagination.limit),
  };
}

export function paginationToSkipTake(pagination: PaginationParams) {
  return {
    skip: (pagination.page - 1) * pagination.limit,
    take: pagination.limit,
  };
}
