import { getActiveEngine, type DbEngine } from './config';
import type { IRepositories } from './repositories/interfaces';

let mongoRepos: IRepositories | null = null;
let prismaRepos: IRepositories | null = null;

async function getMongoRepositories(): Promise<IRepositories> {
  if (!mongoRepos) {
    const { createMongoRepositories } = await import('./mongo/repositories');
    mongoRepos = createMongoRepositories();
  }
  return mongoRepos;
}

async function getPrismaRepositories(): Promise<IRepositories> {
  if (!prismaRepos) {
    const { createPrismaRepositories } = await import('./prisma/repositories');
    prismaRepos = createPrismaRepositories();
  }
  return prismaRepos;
}

/**
 * Main entry point for all database operations.
 * Returns the repository set for the currently active engine.
 *
 * Usage:
 *   const db = await getDb();
 *   const member = await db.member.findById(id);
 */
export async function getDb(): Promise<IRepositories> {
  const engine = getActiveEngine();
  if (engine === 'mongo') {
    return getMongoRepositories();
  }
  return getPrismaRepositories();
}

/**
 * Get repositories for a specific engine (used by sync tool).
 */
export async function getDbForEngine(engine: DbEngine): Promise<IRepositories> {
  if (engine === 'mongo') {
    return getMongoRepositories();
  }
  return getPrismaRepositories();
}

export type { IRepositories } from './repositories/interfaces';
export type { DbEngine } from './config';
export { getActiveEngine, switchEngine, getDbConfig } from './config';
