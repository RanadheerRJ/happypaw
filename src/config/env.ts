/** Typed, parsed access to Vite environment variables. */

export type RouterMode = 'hash' | 'browser';

const raw = import.meta.env;

export const env = {
  supabaseUrl: (raw.VITE_SUPABASE_URL as string | undefined) || '',
  supabaseAnonKey: (raw.VITE_SUPABASE_ANON_KEY as string | undefined) || '',
  basePath: (raw.VITE_BASE_PATH as string | undefined) || '/',
  routerMode: ((raw.VITE_ROUTER_MODE as string | undefined) || 'hash') as RouterMode,
  isDev: Boolean(raw.DEV),
  isProd: Boolean(raw.PROD),
} as const;

export function assertEnv(): string[] {
  const problems: string[] = [];
  if (!['hash', 'browser'].includes(env.routerMode)) {
    problems.push(`VITE_ROUTER_MODE must be "hash" or "browser" (received "${env.routerMode}")`);
  }
  if (!env.supabaseUrl) problems.push('VITE_SUPABASE_URL is required');
  if (!env.supabaseAnonKey) problems.push('VITE_SUPABASE_ANON_KEY is required');
  return problems;
}
