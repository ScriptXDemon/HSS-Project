import type { IRepositories } from './repositories/interfaces';

let mongoRepos: IRepositories | null = null;

async function getMongoRepositories(): Promise<IRepositories> {
  if (!mongoRepos) {
    const { createMongoRepositories } = await import('./mongo/repositories');
    mongoRepos = createMongoRepositories();
  }
  return mongoRepos;
}

/**
 * Main entry point for all database operations.
 * Production runtime is MongoDB-only.
 */
export async function getDb(): Promise<IRepositories> {
  return getMongoRepositories();
}

export type { IRepositories } from './repositories/interfaces';
