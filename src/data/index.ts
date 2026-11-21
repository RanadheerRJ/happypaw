import { isMockMode } from '@/config/env';
import { mockClient } from '@/data/mock/client';
import { supabaseClient } from '@/data/supabase/client';
import type { DataClient } from '@/data/client';

/**
 * The one entry point the UI is allowed to use. Adapter choice is driven by
 * VITE_DATA_MODE, so every feature works with either backend.
 */
export const dataClient: DataClient = isMockMode ? mockClient : supabaseClient;

export { DataError } from '@/data/client';
export type { DataClient } from '@/data/client';
export * from '@/data/types';
