import { supabaseClient, subscribeAuthState } from '@/data/supabase/client';
import type { DataClient } from '@/data/client';

/**
 * The one entry point the UI is allowed to use. The app always talks to the
 * live Supabase adapter; there is no mock mode in production builds.
 */
export const dataClient: DataClient = supabaseClient;

export { DataError } from '@/data/client';
export { subscribeAuthState };
export type { DataClient } from '@/data/client';
export * from '@/data/types';
