import fs from 'fs';
import path from 'path';

export type DbEngine = 'mongo' | 'postgres';

interface DbConfig {
  activeEngine: DbEngine;
  lastSwitchedAt: string;
  lastSwitchedBy: string;
}

const CONFIG_PATH = path.resolve(process.cwd(), 'db-config.json');

const DEFAULT_CONFIG: DbConfig = {
  activeEngine: (process.env.DEFAULT_DB_ENGINE as DbEngine) || 'mongo',
  lastSwitchedAt: new Date().toISOString(),
  lastSwitchedBy: 'system',
};

let cachedConfig: DbConfig | null = null;
let lastReadTime = 0;
const CACHE_TTL_MS = 5000;

function readConfigFromDisk(): DbConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return JSON.parse(raw) as DbConfig;
    }
  } catch {
    // Fall back to defaults on any read/parse error
  }
  writeConfigToDisk(DEFAULT_CONFIG);
  return DEFAULT_CONFIG;
}

function writeConfigToDisk(config: DbConfig): void {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
  cachedConfig = config;
  lastReadTime = Date.now();
}

export function getActiveEngine(): DbEngine {
  const now = Date.now();
  if (cachedConfig && now - lastReadTime < CACHE_TTL_MS) {
    return cachedConfig.activeEngine;
  }
  cachedConfig = readConfigFromDisk();
  lastReadTime = now;
  return cachedConfig.activeEngine;
}

export function switchEngine(engine: DbEngine, switchedBy: string): DbConfig {
  const config: DbConfig = {
    activeEngine: engine,
    lastSwitchedAt: new Date().toISOString(),
    lastSwitchedBy: switchedBy,
  };
  writeConfigToDisk(config);
  return config;
}

export function getDbConfig(): DbConfig {
  if (!cachedConfig) {
    cachedConfig = readConfigFromDisk();
    lastReadTime = Date.now();
  }
  return cachedConfig;
}
