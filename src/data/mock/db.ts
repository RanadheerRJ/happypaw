import { buildSeedDatabase, type MockDb } from '@/data/fixtures/seed';
import { sleep, uid } from '@/lib/utils';

export const MOCK_DB_KEY = 'happypaw:mockdb:v1';

/** Deep clone keeps fixtures immutable between resets. */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function storageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

export function seedDb(): MockDb {
  return clone(buildSeedDatabase());
}

export function loadDb(): MockDb {
  if (!storageAvailable()) return seedDb();
  try {
    const raw = window.localStorage.getItem(MOCK_DB_KEY);
    if (!raw) {
      const seeded = seedDb();
      saveDb(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw) as MockDb;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.profiles)) {
      const seeded = seedDb();
      saveDb(seeded);
      return seeded;
    }
    return parsed;
  } catch (error) {
    console.warn('[happypaw] Could not read mock database, reseeding.', error);
    const seeded = seedDb();
    saveDb(seeded);
    return seeded;
  }
}

export function saveDb(db: MockDb): void {
  if (!storageAvailable()) return;
  try {
    window.localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db));
  } catch (error) {
    // Quota exceeded or private mode — the app keeps working in memory.
    console.warn('[happypaw] Could not persist mock database.', error);
  }
}

/** Read-modify-write helper used by the mock data client. */
export function mutate<T>(mutator: (db: MockDb) => T): T {
  const db = loadDb();
  const result = mutator(db);
  saveDb(db);
  return result;
}

export function resetDb(): MockDb {
  const seeded = seedDb();
  saveDb(seeded);
  return seeded;
}

/** Artificial network latency so skeleton and pending states are observable. */
export async function simulateNetwork(min = 150, max = 400): Promise<void> {
  const ms = Math.round(min + Math.random() * (max - min));
  await sleep(ms);
}

export function newId(prefix: string): string {
  return uid(prefix);
}
