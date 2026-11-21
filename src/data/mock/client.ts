import { env } from '@/config/env';
import { DataError, type DataClient } from '@/data/client';
import { loadDb, mutate, newId, resetDb, simulateNetwork } from '@/data/mock/db';
import {
  isAccountDeleted,
  mockAddresses,
  mockCoupons,
  mockDogs,
  mockOrders,
  mockSettings,
  mockSubscriptions,
  mockSupport,
} from '@/data/mock/customer';
import type {
  AuthUser,
  DeliveryZone,
  Plan,
  Profile,
  Session,
  SignUpInput,
  WaitlistEntry,
  WeeklyMenuWithRecipes,
} from '@/data/types';
import { currentWeekStart, toIsoDate } from '@/lib/dates';
import { normalizePhone } from '@/lib/validators';

const DEMO_ROLE_EMAILS = {
  customer: 'priya@happypaw.in',
  vet: 'meera@happypaw.in',
  admin: 'admin@happypaw.in',
} as const;

function toAuthUser(profile: Profile): AuthUser {
  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    fullName: profile.fullName,
  };
}

function buildSession(profile: Profile): Session {
  return { user: toAuthUser(profile), mode: 'mock' };
}

export const mockClient: DataClient = {
  mode: 'mock',

  auth: {
    async getSession() {
      await simulateNetwork(40, 120);
      const db = loadDb();
      if (!db.sessionProfileId) return null;
      const profile = db.profiles.find((item) => item.id === db.sessionProfileId);
      return profile ? buildSession(profile) : null;
    },

    async signIn(email, password) {
      await simulateNetwork();
      const db = loadDb();
      const normalized = email.trim().toLowerCase();
      const profile = db.profiles.find((item) => item.email.toLowerCase() === normalized);
      if (!profile) throw new DataError('No account found with that email.', 'invalid_credentials');
      if (isAccountDeleted(profile)) {
        throw new DataError('This account has been deleted. Contact support to restore it.', 'account_deleted');
      }
      const expected = db.credentials[profile.email] ?? 'Demo@1234';
      if (password !== expected) throw new DataError('That password does not match.', 'invalid_credentials');
      mutate((next) => {
        next.sessionProfileId = profile.id;
      });
      return buildSession(profile);
    },

    async signUp(input: SignUpInput) {
      await simulateNetwork();
      const db = loadDb();
      const normalized = input.email.trim().toLowerCase();
      if (db.profiles.some((item) => item.email.toLowerCase() === normalized)) {
        throw new DataError('An account with this email already exists.', 'email_taken');
      }
      const profile: Profile = {
        id: newId('user'),
        role: 'customer',
        fullName: input.fullName.trim(),
        email: normalized,
        phone: normalizePhone(input.phone),
        avatarUrl: null,
        createdAt: new Date().toISOString(),
      };
      mutate((next) => {
        next.profiles.push(profile);
        next.credentials[profile.email] = input.password;
        next.sessionProfileId = profile.id;
      });
      return buildSession(profile);
    },

    async signOut() {
      await simulateNetwork(80, 180);
      mutate((db) => {
        db.sessionProfileId = null;
      });
    },

    async resetPassword(email) {
      await simulateNetwork();
      loadDb();
      const exists = loadDb().profiles.some(
        (profile) => profile.email.toLowerCase() === email.trim().toLowerCase(),
      );
      // Never leak account existence — mirror Supabase's behaviour.
      if (!exists) return;
    },

    async signInAsDemo(role) {
      await simulateNetwork();
      if (!env.demoMode) {
        throw new DataError('Demo sign-in is disabled.', 'demo_disabled');
      }
      const email = DEMO_ROLE_EMAILS[role];
      const profile = loadDb().profiles.find((item) => item.email === email);
      if (!profile) throw new DataError('Demo account is missing from the fixtures.', 'missing_demo');
      mutate((db) => {
        db.sessionProfileId = profile.id;
      });
      return buildSession(profile);
    },
  },

  catalog: {
    async listPlans(options) {
      await simulateNetwork();
      const plans = loadDb().plans;
      return plans
        .filter((plan) => (options?.includeInactive ? true : plan.isActive))
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((plan) => ({ ...plan }));
    },

    async getPlanBySlug(slug) {
      await simulateNetwork(120, 260);
      return loadDb().plans.find((plan) => plan.slug === slug) ?? null;
    },

    async listAddons(options) {
      await simulateNetwork(120, 280);
      return loadDb()
        .addons.filter((addon) => (options?.includeInactive ? true : addon.isActive))
        .map((addon) => ({ ...addon }));
    },

    async listRecipes(options) {
      await simulateNetwork(120, 280);
      return loadDb()
        .recipes.filter((recipe) => (options?.includeInactive ? true : recipe.isActive))
        .map((recipe) => ({ ...recipe }));
    },

    async getWeeklyMenu(options): Promise<WeeklyMenuWithRecipes | null> {
      await simulateNetwork(120, 280);
      const db = loadDb();
      const targetWeek = options?.weekStart ?? toIsoDate(currentWeekStart());
      const menu =
        db.weeklyMenus.find((item) => item.weekStart === targetWeek && item.isPublished) ??
        [...db.weeklyMenus]
          .filter((item) => item.isPublished)
          .sort((a, b) => b.weekStart.localeCompare(a.weekStart))[0];
      if (!menu) return null;
      const recipes = menu.recipeIds
        .map((id) => db.recipes.find((recipe) => recipe.id === id))
        .filter((recipe): recipe is NonNullable<typeof recipe> => Boolean(recipe));
      return { ...menu, recipes };
    },

    async listDeliveryZones(): Promise<DeliveryZone[]> {
      await simulateNetwork(100, 220);
      return loadDb().deliveryZones.filter((zone) => zone.isActive).map((zone) => ({ ...zone }));
    },

    async checkPincode(pincode) {
      await simulateNetwork(220, 420);
      const db = loadDb();
      const cleaned = pincode.replace(/\D/g, '');
      const areas = db.deliveryZones.filter(
        (zone) => zone.isActive && zone.pincode === cleaned,
      );
      return { pincode: cleaned, served: areas.length > 0, areas: areas.map((zone) => ({ ...zone })) };
    },
  },

  addresses: mockAddresses,
  dogs: mockDogs,
  subscriptions: mockSubscriptions,
  orders: mockOrders,
  support: mockSupport,
  coupons: mockCoupons,
  settings: mockSettings,

  profiles: {
    async get(profileId) {
      await simulateNetwork(100, 220);
      const profile = loadDb().profiles.find((item) => item.id === profileId);
      return profile ? { ...profile } : null;
    },
    async update(profileId, patch) {
      await simulateNetwork();
      return mutate((db) => {
        const profile = db.profiles.find((item) => item.id === profileId);
        if (!profile) throw new DataError('Profile not found.', 'not_found');
        Object.assign(profile, patch);
        return { ...profile };
      });
    },
  },

  waitlist: {
    async join(input): Promise<WaitlistEntry> {
      await simulateNetwork();
      const entry: WaitlistEntry = {
        id: newId('waitlist'),
        email: input.email.trim().toLowerCase(),
        pincode: input.pincode.replace(/\D/g, ''),
        createdAt: new Date().toISOString(),
      };
      mutate((db) => {
        const duplicate = db.waitlist.some(
          (item) => item.email === entry.email && item.pincode === entry.pincode,
        );
        if (!duplicate) db.waitlist.push(entry);
      });
      return entry;
    },
  },

  demo: {
    async reset() {
      await simulateNetwork(250, 500);
      resetDb();
    },
  },
};

/** Exported for tests and for the admin "plans" view in later phases. */
export const mockPlans = async (): Promise<Plan[]> => mockClient.catalog.listPlans();
