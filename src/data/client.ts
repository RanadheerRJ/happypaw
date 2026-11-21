import type {
  Addon,
  AuthUser,
  DataMode,
  DeliveryZone,
  Plan,
  PincodeCheckResult,
  Profile,
  Recipe,
  Session,
  SignUpInput,
  WaitlistEntry,
  WeeklyMenuWithRecipes,
} from '@/data/types';

export interface AuthApi {
  getSession(): Promise<Session | null>;
  signIn(email: string, password: string): Promise<Session>;
  signUp(input: SignUpInput): Promise<Session>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  /** Demo-only shortcut. Throws when demo mode is off. */
  signInAsDemo(role: AuthUser['role']): Promise<Session>;
}

export interface CatalogApi {
  listPlans(options?: { includeInactive?: boolean }): Promise<Plan[]>;
  getPlanBySlug(slug: string): Promise<Plan | null>;
  listAddons(options?: { includeInactive?: boolean }): Promise<Addon[]>;
  listRecipes(options?: { includeInactive?: boolean }): Promise<Recipe[]>;
  getWeeklyMenu(options?: { weekStart?: string }): Promise<WeeklyMenuWithRecipes | null>;
  listDeliveryZones(): Promise<DeliveryZone[]>;
  checkPincode(pincode: string): Promise<PincodeCheckResult>;
}

export interface ProfileApi {
  get(profileId: string): Promise<Profile | null>;
  update(profileId: string, patch: Partial<Omit<Profile, 'id' | 'role'>>): Promise<Profile>;
}

/**
 * Only the public/auth surface is wired in Phases 1–2. Customer, vet and admin
 * domains are added to this interface (and both adapters) in later phases.
 * Every consumer imports `dataClient` from `src/data`, never an SDK.
 */
export interface DataClient {
  mode: DataMode;
  auth: AuthApi;
  catalog: CatalogApi;
  profiles: ProfileApi;
  waitlist: {
    join(input: { email: string; pincode: string }): Promise<WaitlistEntry>;
  };
  demo: {
    reset(): Promise<void>;
  };
}

export class DataError extends Error {
  readonly code: string;
  constructor(message: string, code = 'data_error') {
    super(message);
    this.name = 'DataError';
    this.code = code;
  }
}
