import type { PaginationParams, PaginatedResult } from '../../types';

export function toEntity<T>(doc: unknown): T {
  const d = doc as { toJSON?: () => unknown };
  const json = d.toJSON ? d.toJSON() : d;
  return json as T;
}

export function paginate<T>(
  docs: unknown[],
  total: number,
  pagination: PaginationParams
): PaginatedResult<T> {
  return {
    data: docs.map((d) => toEntity<T>(d)),
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(total / pagination.limit),
  };
}

export function paginationToSkip(pagination: PaginationParams) {
  return (pagination.page - 1) * pagination.limit;
}
