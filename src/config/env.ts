/** Typed, parsed access to Vite environment variables. */

export type DataMode = 'mock' | 'supabase';
export type RouterMode = 'hash' | 'browser';

const raw = import.meta.env;

function bool(value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
}

export const env = {
  dataMode: ((raw.VITE_DATA_MODE as string | undefined) || 'mock') as DataMode,
  demoMode: bool(raw.VITE_DEMO_MODE, true),
  supabaseUrl: (raw.VITE_SUPABASE_URL as string | undefined) || '',
  supabaseAnonKey: (raw.VITE_SUPABASE_ANON_KEY as string | undefined) || '',
  basePath: (raw.VITE_BASE_PATH as string | undefined) || '/',
  routerMode: ((raw.VITE_ROUTER_MODE as string | undefined) || 'hash') as RouterMode,
  isDev: Boolean(raw.DEV),
  isProd: Boolean(raw.PROD),
} as const;

export const isMockMode = env.dataMode === 'mock';

/** Demo accounts are only ever surfaced when demo mode is enabled. */
export const showDemoChrome = env.demoMode && isMockMode;

export function assertEnv(): string[] {
  const problems: string[] = [];
  if (!['mock', 'supabase'].includes(env.dataMode)) {
    problems.push(`VITE_DATA_MODE must be "mock" or "supabase" (received "${env.dataMode}")`);
  }
  if (!['hash', 'browser'].includes(env.routerMode)) {
    problems.push(`VITE_ROUTER_MODE must be "hash" or "browser" (received "${env.routerMode}")`);
  }
  if (env.dataMode === 'supabase') {
    if (!env.supabaseUrl) problems.push('VITE_SUPABASE_URL is required when VITE_DATA_MODE=supabase');
    if (!env.supabaseAnonKey) {
      problems.push('VITE_SUPABASE_ANON_KEY is required when VITE_DATA_MODE=supabase');
    }
  }
  return problems;
}
