import type {
  Addon,
  Address,
  AddressInput,
  AuthUser,
  CouponValidation,
  CreateSubscriptionInput,
  DataMode,
  DeliveryZone,
  DietPlan,
  Dog,
  DogInput,
  DogWeight,
  NotificationPrefs,
  OrderWithItems,
  Plan,
  PincodeCheckResult,
  Profile,
  Recipe,
  Session,
  SignUpInput,
  SimulatedCheckoutResult,
  NewTicketInput,
  SubscriptionWithDetails,
  SupportTicketWithMessages,
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

export interface DogApi {
  list(ownerId: string): Promise<Dog[]>;
  get(dogId: string): Promise<Dog | null>;
  create(input: DogInput & { ownerId: string }): Promise<Dog>;
  update(dogId: string, patch: Partial<DogInput>): Promise<Dog>;
  listWeights(dogId: string): Promise<DogWeight[]>;
  addWeight(dogId: string, weightKg: number): Promise<DogWeight>;
  getDietPlan(dogId: string): Promise<DietPlan | null>;
}

export interface AddressApi {
  list(profileId: string): Promise<Address[]>;
  create(input: AddressInput): Promise<Address>;
  update(addressId: string, patch: Partial<Omit<Address, 'id' | 'profileId'>>): Promise<Address>;
  setDefault(profileId: string, addressId: string): Promise<Address[]>;
}

export interface SubscriptionApi {
  list(customerId: string): Promise<SubscriptionWithDetails[]>;
  get(subscriptionId: string): Promise<SubscriptionWithDetails | null>;
  create(input: CreateSubscriptionInput): Promise<SimulatedCheckoutResult>;
  pause(subscriptionId: string, untilIso: string): Promise<SubscriptionWithDetails>;
  resume(subscriptionId: string): Promise<SubscriptionWithDetails>;
  skipNext(subscriptionId: string): Promise<SubscriptionWithDetails>;
  cancel(subscriptionId: string, reason?: string): Promise<SubscriptionWithDetails>;
  changePlan(subscriptionId: string, planId: string): Promise<SubscriptionWithDetails>;
  updateAddons(subscriptionId: string, addonIds: string[]): Promise<SubscriptionWithDetails>;
  updateAddress(subscriptionId: string, addressId: string): Promise<SubscriptionWithDetails>;
}

export interface OrderApi {
  list(customerId: string): Promise<OrderWithItems[]>;
  get(orderId: string): Promise<OrderWithItems | null>;
}

export interface SupportApi {
  list(customerId: string): Promise<SupportTicketWithMessages[]>;
  get(ticketId: string): Promise<SupportTicketWithMessages | null>;
  create(input: NewTicketInput): Promise<SupportTicketWithMessages>;
  reply(ticketId: string, senderId: string, body: string): Promise<SupportTicketWithMessages>;
}

export interface CouponApi {
  validate(code: string, orderValueInr: number): Promise<CouponValidation>;
}

export interface SettingsApi {
  getNotificationPrefs(profileId: string): Promise<NotificationPrefs>;
  updateNotificationPrefs(
    profileId: string,
    patch: Partial<Omit<NotificationPrefs, 'profileId'>>,
  ): Promise<NotificationPrefs>;
  changePassword(profileId: string, currentPassword: string, nextPassword: string): Promise<void>;
  deleteAccount(profileId: string): Promise<void>;
}

/**
 * Every consumer imports `dataClient` from `src/data`, never an SDK. The mock and
 * Supabase adapters implement this same surface, so pages never know the source.
 */
export interface DataClient {
  mode: DataMode;
  auth: AuthApi;
  catalog: CatalogApi;
  profiles: ProfileApi;
  addresses: AddressApi;
  dogs: DogApi;
  subscriptions: SubscriptionApi;
  orders: OrderApi;
  support: SupportApi;
  coupons: CouponApi;
  settings: SettingsApi;
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
