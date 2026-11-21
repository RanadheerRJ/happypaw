import { env } from '@/config/env';
import {
  DataError,
  type AddressApi,
  type CouponApi,
  type DataClient,
  type DogApi,
  type OrderApi,
  type SettingsApi,
  type SubscriptionApi,
  type SupportApi,
} from '@/data/client';

/**
 * Supabase adapter — implemented in Phase 6 against the migrations in
 * `supabase/migrations`. Nothing outside this folder may import the SDK.
 *
 * The client is created lazily so mock mode never touches Supabase.
 */
function unavailable(): never {
  throw new DataError(
    'Supabase mode is not wired up in this build yet. Set VITE_DATA_MODE=mock, or finish Phase 6 (migrations + adapter).',
    'supabase_not_configured',
  );
}

/** Every method throws until Phase 6 wires the real queries. */
function notImplemented<T extends object>(): T {
  return new Proxy({} as T, {
    get: () => unavailable,
  });
}

export const supabaseClient: DataClient = {
  mode: 'supabase',
  auth: {
    getSession: unavailable,
    signIn: unavailable,
    signUp: unavailable,
    signOut: unavailable,
    resetPassword: unavailable,
    signInAsDemo: unavailable,
  },
  catalog: {
    listPlans: unavailable,
    getPlanBySlug: unavailable,
    listAddons: unavailable,
    listRecipes: unavailable,
    getWeeklyMenu: unavailable,
    listDeliveryZones: unavailable,
    checkPincode: unavailable,
  },
  profiles: {
    get: unavailable,
    update: unavailable,
  },
  addresses: notImplemented<AddressApi>(),
  dogs: notImplemented<DogApi>(),
  subscriptions: notImplemented<SubscriptionApi>(),
  orders: notImplemented<OrderApi>(),
  support: notImplemented<SupportApi>(),
  coupons: notImplemented<CouponApi>(),
  settings: notImplemented<SettingsApi>(),
  waitlist: { join: unavailable },
  demo: {
    async reset() {
      throw new DataError('Reset is only available in mock mode.', 'not_supported');
    },
  },
};

export const supabaseConfig = {
  url: env.supabaseUrl,
  anonKey: env.supabaseAnonKey,
} as const;
