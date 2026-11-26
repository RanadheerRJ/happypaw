import { DataError, type DataClient } from '@/data/client';
import type {
  Address,
  AddressInput,
  Addon,
  AuthUser,
  CheckoutResult,
  ContactMessage,
  Coupon,
  CreateSubscriptionInput,
  DietPlan,
  Dog,
  DogInput,
  DogWeight,
  NotificationPrefs,
  NewTicketInput,
  Order,
  OrderItem,
  OrderWithItems,
  Payment,
  Profile,
  Recipe,
  Session,
  SignUpInput,
  Subscription,
  SubscriptionWithDetails,
  SupportMessage,
  SupportTicket,
  WaitlistEntry,
  WeeklyMenuWithRecipes,
} from '@/data/types';
import { planFixtures, addonFixtures, deliveryZoneFixtures } from '@/config/pricing';
import { addDays, currentWeekStart, toIsoDate, upcomingDeliveryDate } from '@/lib/dates';
import { uid } from '@/lib/utils';

/**
 * Test-only in-memory DataClient.
 *
 * The production app always uses the live Supabase adapter (`@/data/supabase`).
 * This double keeps the UI tests hermetic: they exercise the pages and the
 * DataClient contract without touching the network or a database.
 */

interface FakeDb {
  profiles: Profile[];
  credentials: Record<string, string>;
  addresses: Address[];
  dogs: Dog[];
  dogWeights: DogWeight[];
  dietPlans: DietPlan[];
  subscriptions: Subscription[];
  orders: Order[];
  orderItems: OrderItem[];
  payments: Payment[];
  supportTickets: SupportTicket[];
  supportMessages: SupportMessage[];
  notificationPrefs: NotificationPrefs[];
  coupons: Coupon[];
  waitlist: WaitlistEntry[];
  contactMessages: ContactMessage[];
  sessionProfileId: string | null;
  weeklyMenu: WeeklyMenuWithRecipes;
}

const DEMO_PASSWORD = 'Demo@1234';

const demoProfiles: Profile[] = [
  {
    id: 'user-customer',
    role: 'customer',
    fullName: 'Priya Reddy',
    email: 'priya@happypaw.in',
    phone: '+919876543210',
    avatarUrl: null,
    createdAt: '2025-02-11T08:30:00.000Z',
  },
  {
    id: 'user-vet',
    role: 'vet',
    fullName: 'Dr. Meera Iyer',
    email: 'meera@happypaw.in',
    phone: '+919701234567',
    avatarUrl: null,
    createdAt: '2025-01-19T06:15:00.000Z',
  },
  {
    id: 'user-admin',
    role: 'admin',
    fullName: 'Admin User',
    email: 'admin@happypaw.in',
    phone: '+919000000000',
    avatarUrl: null,
    createdAt: '2025-01-02T05:00:00.000Z',
  },
];

const recipeFixtures: Recipe[] = [
  {
    id: 'recipe-chicken-pumpkin',
    slug: 'chicken-pumpkin-spinach',
    name: 'Chicken, Pumpkin & Spinach',
    protein: 'chicken',
    tagline: 'The gentle everyday bowl',
    description: 'Shredded chicken breast with pumpkin and spinach over lightly cooked rice.',
    ingredients: [
      { item: 'Chicken breast', quantity: '45%' },
      { item: 'Brown rice', quantity: '25%' },
      { item: 'Pumpkin', quantity: '18%' },
      { item: 'Spinach', quantity: '7%' },
      { item: 'Sunflower oil & bone meal', quantity: '5%' },
    ],
    caloriesPer100g: 128,
    allergens: [],
    photoUrl: '/images/recipes/chicken-pumpkin.webp',
    isActive: true,
  },
  {
    id: 'recipe-lamb-sweet-potato',
    slug: 'lamb-sweet-potato-beans',
    name: 'Lamb, Sweet Potato & Beans',
    protein: 'lamb',
    tagline: 'Hearty, iron-rich, grain-friendly',
    description: 'Minced lamb with sweet potato and green beans over quinoa.',
    ingredients: [
      { item: 'Lean lamb mince', quantity: '42%' },
      { item: 'Sweet potato', quantity: '24%' },
      { item: 'Quinoa', quantity: '16%' },
      { item: 'Green beans', quantity: '12%' },
      { item: 'Fish oil & calcium mix', quantity: '6%' },
    ],
    caloriesPer100g: 142,
    allergens: ['Fish (trace, in oil)'],
    photoUrl: '/images/recipes/lamb-sweet-potato.webp',
    isActive: true,
  },
  {
    id: 'recipe-fish-rice',
    slug: 'fish-brown-rice-carrots',
    name: 'Fish, Brown Rice & Carrots',
    protein: 'fish',
    tagline: 'Light, omega-rich, skin-friendly',
    description: 'Flaked white fish with brown rice, carrots and peas.',
    ingredients: [
      { item: 'White fish', quantity: '40%' },
      { item: 'Brown rice', quantity: '28%' },
      { item: 'Carrots', quantity: '16%' },
      { item: 'Green peas', quantity: '10%' },
      { item: 'Salmon oil & mineral mix', quantity: '6%' },
    ],
    caloriesPer100g: 118,
    allergens: ['Fish'],
    photoUrl: '/images/recipes/fish-rice.webp',
    isActive: true,
  },
  {
    id: 'recipe-chicken-rice-sensitive',
    slug: 'chicken-rice-sensitive',
    name: 'Chicken & Rice (Sensitive)',
    protein: 'chicken',
    tagline: 'Five ingredients. Nothing extra.',
    description: 'A minimal-ingredient bowl for dogs in transition or with upset stomachs.',
    ingredients: [
      { item: 'Chicken thigh', quantity: '48%' },
      { item: 'White rice', quantity: '32%' },
      { item: 'Carrot', quantity: '14%' },
      { item: 'Kelp & calcium mix', quantity: '6%' },
    ],
    caloriesPer100g: 134,
    allergens: [],
    photoUrl: '/images/recipes/chicken-rice-sensitive.webp',
    isActive: true,
  },
];

const couponFixtures: Coupon[] = [
  {
    id: 'coupon-firstbox',
    code: 'FIRSTBOX',
    type: 'percent',
    value: 20,
    minOrderInr: 500,
    maxRedemptions: 500,
    timesRedeemed: 63,
    expiresAt: toIsoDate(addDays(new Date(), 45)),
    isActive: true,
  },
  {
    id: 'coupon-hyd150',
    code: 'HYDERABAD150',
    type: 'flat',
    value: 150,
    minOrderInr: 999,
    maxRedemptions: 200,
    timesRedeemed: 41,
    expiresAt: toIsoDate(addDays(new Date(), 21)),
    isActive: true,
  },
];

export function buildSeedDb(): FakeDbWithMenu {
  const today = new Date();
  const weekStart = toIsoDate(currentWeekStart(today));
  const nextDelivery = toIsoDate(upcomingDeliveryDate(today));

  const dogs: Dog[] = [
    {
      id: 'dog-coco',
      ownerId: 'user-customer',
      name: 'Coco',
      photoUrl: null,
      breed: 'Indie',
      dob: '2021-06-14',
      weightKg: 18.4,
      bodyCondition: 'ideal',
      activityLevel: 'high',
      neutered: true,
      allergies: ['Chicken'],
      medicalNotes: 'Sensitive stomach — transition slowly.',
      currentFood: 'Kibble (switching)',
      picky: true,
      createdAt: '2025-02-12T09:00:00.000Z',
    },
    {
      id: 'dog-momo',
      ownerId: 'user-customer',
      name: 'Momo',
      photoUrl: null,
      breed: 'Shih Tzu',
      dob: '2023-01-22',
      weightKg: 5.6,
      bodyCondition: 'ideal',
      activityLevel: 'low',
      neutered: false,
      allergies: [],
      medicalNotes: null,
      currentFood: 'Home-cooked rice and curd',
      picky: false,
      createdAt: '2025-04-08T07:20:00.000Z',
    },
  ];

  const dogWeights: DogWeight[] = [];
  dogs.forEach((dog, dogIndex) => {
    for (let week = 7; week >= 0; week -= 1) {
      const drift = (dogIndex % 2 === 0 ? 0.05 : -0.03) * week;
      dogWeights.push({
        id: `weight-${dog.id}-${week}`,
        dogId: dog.id,
        weightKg: Number(Math.max(2, dog.weightKg + drift).toFixed(1)),
        recordedAt: toIsoDate(addDays(today, -week * 7)),
      });
    }
  });

  const weeklyMenu: WeeklyMenuWithRecipes = {
    id: 'menu-current-week',
    weekStart,
    recipeIds: recipeFixtures.map((recipe) => recipe.id),
    isPublished: true,
    publishedAt: `${weekStart}T09:00:00.000Z`,
    recipes: recipeFixtures,
  };

  const addresses: Address[] = [
    {
      id: 'addr-priya',
      profileId: 'user-customer',
      label: 'Home',
      line1: 'Flat 402, Aparna Cyber Life',
      line2: 'Nallagandla Main Road',
      area: 'Gachibowli',
      city: 'Hyderabad',
      pincode: '500032',
      isDefault: true,
    },
  ];

  const subscription: Subscription = {
    id: 'sub-momo',
    customerId: 'user-customer',
    dogId: 'dog-momo',
    planId: 'plan-weekly-medium',
    status: 'active',
    startDate: toIsoDate(addDays(today, -14)),
    nextDeliveryDate: nextDelivery,
    addressId: 'addr-priya',
    priceSnapshotInr: 1099,
    couponId: null,
    createdAt: `${toIsoDate(addDays(today, -14))}T10:00:00.000Z`,
    pausedUntil: null,
    addonIds: [],
  };

  const order: Order = {
    id: 'order-momo-1',
    subscriptionId: subscription.id,
    customerId: 'user-customer',
    dogId: 'dog-momo',
    deliveryDate: nextDelivery,
    status: 'planned',
    subtotalInr: 1099,
    discountInr: 0,
    totalInr: 1099,
    addressSnapshot: {
      label: 'Home',
      line1: 'Flat 402, Aparna Cyber Life',
      line2: 'Nallagandla Main Road',
      area: 'Gachibowli',
      city: 'Hyderabad',
      pincode: '500032',
    },
    notes: null,
    createdAt: `${toIsoDate(addDays(today, -14))}T10:05:00.000Z`,
  };

  const orderItems: OrderItem[] = [
    {
      id: 'item-momo-plan',
      orderId: order.id,
      itemType: 'plan',
      itemId: subscription.planId,
      nameSnapshot: 'Weekly Fresh — Medium',
      qty: 1,
      unitPriceInr: 1099,
    },
  ];

  const payment: Payment = {
    id: 'pay-momo-1',
    orderId: order.id,
    customerId: 'user-customer',
    amountInr: 1099,
    status: 'pending',
    method: 'upi',
    gatewayRef: 'hp_ord_order-momo-1',
    createdAt: `${toIsoDate(addDays(today, -14))}T10:05:00.000Z`,
  };

  const supportTicket: SupportTicket = {
    id: 'ticket-1',
    customerId: 'user-customer',
    subject: 'Portion size question',
    category: 'general',
    priority: 'normal',
    status: 'open',
    assignedTo: null,
    createdAt: `${toIsoDate(addDays(today, -3))}T08:00:00.000Z`,
  };

  const supportMessage: SupportMessage = {
    id: 'msg-1',
    ticketId: supportTicket.id,
    senderId: 'user-customer',
    body: 'Is the portion right for a 18 kg dog?',
    isInternal: false,
    createdAt: `${toIsoDate(addDays(today, -3))}T08:00:00.000Z`,
  };

  return {
    profiles: demoProfiles,
    credentials: Object.fromEntries(
      demoProfiles.map((profile) => [profile.email, DEMO_PASSWORD]),
    ),
    addresses,
    dogs,
    dogWeights,
    dietPlans: [],
    subscriptions: [subscription],
    orders: [order],
    orderItems,
    payments: [payment],
    supportTickets: [supportTicket],
    supportMessages: [supportMessage],
    notificationPrefs: demoProfiles.map((profile) => ({
      profileId: profile.id,
      orderUpdates: true,
      deliveryReminders: true,
      offers: true,
      whatsapp: false,
    })),
    coupons: couponFixtures,
    waitlist: [],
    contactMessages: [],
    sessionProfileId: null,
    weeklyMenu,
  };
}

export interface FakeDbWithMenu extends FakeDb {
  weeklyMenu: WeeklyMenuWithRecipes;
}

let db: FakeDbWithMenu = buildSeedDb();

/** Reseed the in-memory database between tests. */
export function resetFakeDb(): FakeDbWithMenu {
  db = buildSeedDb();
  return db;
}

export function getFakeDb(): FakeDbWithMenu {
  return db;
}

function toAuthUser(profile: Profile): AuthUser {
  return { id: profile.id, email: profile.email, role: profile.role, fullName: profile.fullName };
}

function buildSession(profile: Profile): Session {
  return { user: toAuthUser(profile), mode: 'supabase' };
}

function snapshotAddress(address: Address | null): Order['addressSnapshot'] {
  if (!address) {
    return {
      label: 'Home',
      line1: 'Address on file',
      line2: null,
      area: 'Hyderabad',
      city: 'Hyderabad',
      pincode: '500032',
    };
  }
  return {
    label: address.label,
    line1: address.line1,
    line2: address.line2,
    area: address.area,
    city: address.city,
    pincode: address.pincode,
  };
}

function discountFor(coupon: Coupon | null, subtotal: number): number {
  if (!coupon) return 0;
  const raw = coupon.type === 'percent' ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  return Math.min(raw, subtotal);
}

function planById(planId: string): (typeof planFixtures)[number] | undefined {
  return planFixtures.find((plan) => plan.id === planId);
}

function addonById(addonId: string): Addon | undefined {
  return addonFixtures.find((addon) => addon.id === addonId);
}

function subscriptionSubtotal(subscription: Subscription): number {
  const plan = planById(subscription.planId);
  return (plan?.priceInr ?? subscription.priceSnapshotInr) +
    subscription.addonIds.reduce((sum, id) => sum + (addonById(id)?.priceInr ?? 0), 0);
}

function buildPlannedOrder(subscription: Subscription, deliveryDate: string): Order {
  const subtotal = subscriptionSubtotal(subscription);
  const coupon = db.coupons.find((item) => item.id === subscription.couponId) ?? null;
  const order: Order = {
    id: uid('order'),
    subscriptionId: subscription.id,
    customerId: subscription.customerId,
    dogId: subscription.dogId,
    deliveryDate,
    status: 'planned',
    subtotalInr: subtotal,
    discountInr: discountFor(coupon, subtotal),
    totalInr: subtotal - discountFor(coupon, subtotal),
    addressSnapshot: snapshotAddress(
      db.addresses.find((address) => address.id === subscription.addressId) ?? null,
    ),
    notes: null,
    createdAt: new Date().toISOString(),
  };
  const items: OrderItem[] = [];
  const plan = planById(subscription.planId);
  if (plan) {
    items.push({
      id: uid('item'),
      orderId: order.id,
      itemType: 'plan',
      itemId: plan.id,
      nameSnapshot: plan.name,
      qty: 1,
      unitPriceInr: plan.priceInr,
    });
  }
  for (const addonId of subscription.addonIds) {
    const addon = addonById(addonId);
    if (addon) {
      items.push({
        id: uid('item'),
        orderId: order.id,
        itemType: 'addon',
        itemId: addon.id,
        nameSnapshot: addon.name,
        qty: 1,
        unitPriceInr: addon.priceInr,
      });
    }
  }
  db.orders.push(order);
  db.orderItems.push(...items);
  db.payments.push({
    id: uid('pay'),
    orderId: order.id,
    customerId: subscription.customerId,
    amountInr: order.totalInr,
    status: 'pending',
    method: 'upi',
    gatewayRef: `hp_ord_${order.id}`,
    createdAt: order.createdAt,
  });
  return order;
}

function withDetails(subscription: Subscription): SubscriptionWithDetails {
  const plan = planById(subscription.planId);
  const dog = db.dogs.find((item) => item.id === subscription.dogId);
  if (!plan || !dog) {
    throw new DataError('Subscription is missing its plan or dog.', 'corrupt_subscription');
  }
  return {
    ...subscription,
    plan,
    dog,
    addons: subscription.addonIds
      .map((id) => addonById(id))
      .filter((addon): addon is Addon => Boolean(addon)),
    address: db.addresses.find((address) => address.id === subscription.addressId) ?? null,
  };
}

function orderWithItems(order: Order): OrderWithItems {
  return {
    ...order,
    items: db.orderItems.filter((item) => item.orderId === order.id),
    payment: db.payments.find((payment) => payment.orderId === order.id) ?? null,
  };
}

/** Test convenience: sign in as one of the seeded demo roles. */
export async function signInAsRole(role: 'customer' | 'vet' | 'admin'): Promise<Session> {
  const email =
    role === 'customer'
      ? 'priya@happypaw.in'
      : role === 'vet'
        ? 'meera@happypaw.in'
        : 'admin@happypaw.in';
  return fakeDataClient.auth.signIn(email, DEMO_PASSWORD);
}

/**
 * Test double for the supabase auth-state subscription. The fake keeps auth
 * state in memory; tests sign in before rendering, and AuthProvider's mount
 * effect reads the session via `dataClient.auth.getSession()`.
 */
export function fakeSubscribeAuthState(): () => void {
  return () => undefined;
}

export const fakeDataClient: DataClient = {
  mode: 'supabase',

  auth: {
    async getSession() {
      if (!db.sessionProfileId) return null;
      const profile = db.profiles.find((item) => item.id === db.sessionProfileId);
      return profile ? buildSession(profile) : null;
    },

    async signIn(email, password) {
      const normalized = email.trim().toLowerCase();
      const profile = db.profiles.find((item) => item.email.toLowerCase() === normalized);
      if (!profile) throw new DataError('No account found with that email.', 'invalid_credentials');
      if (profile.deletedAt) {
        throw new DataError('This account has been deleted.', 'account_deleted');
      }
      const expected = db.credentials[profile.email] ?? DEMO_PASSWORD;
      if (password !== expected) throw new DataError('That password does not match.', 'invalid_credentials');
      db.sessionProfileId = profile.id;
      return buildSession(profile);
    },

    async signUp(input: SignUpInput) {
      const normalized = input.email.trim().toLowerCase();
      if (db.profiles.some((item) => item.email.toLowerCase() === normalized)) {
        throw new DataError('An account with this email already exists.', 'email_taken');
      }
      const profile: Profile = {
        id: uid('user'),
        role: 'customer',
        fullName: input.fullName.trim(),
        email: normalized,
        phone: input.phone.trim(),
        avatarUrl: null,
        createdAt: new Date().toISOString(),
      };
      db.profiles.push(profile);
      db.credentials[profile.email] = input.password;
      db.notificationPrefs.push({
        profileId: profile.id,
        orderUpdates: true,
        deliveryReminders: true,
        offers: true,
        whatsapp: false,
      });
      db.sessionProfileId = profile.id;
      return buildSession(profile);
    },

    async signOut() {
      db.sessionProfileId = null;
    },

    async resetPassword(email) {
      const exists = db.profiles.some(
        (profile) => profile.email.toLowerCase() === email.trim().toLowerCase(),
      );
      // Never leak account existence — mirror Supabase's behaviour.
      if (!exists) return;
    },
  },

  catalog: {
    async listPlans(options) {
      return planFixtures
        .filter((plan) => (options?.includeInactive ? true : plan.isActive))
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((plan) => ({ ...plan }));
    },

    async getPlanBySlug(slug) {
      const plan = planFixtures.find((item) => item.slug === slug && item.isActive);
      return plan ? { ...plan } : null;
    },

    async listAddons(options) {
      return addonFixtures
        .filter((addon) => (options?.includeInactive ? true : addon.isActive))
        .map((addon) => ({ ...addon }));
    },

    async listRecipes(options) {
      return recipeFixtures
        .filter((recipe) => (options?.includeInactive ? true : recipe.isActive))
        .map((recipe) => ({ ...recipe }));
    },

    async getWeeklyMenu(options) {
      const wanted = options?.weekStart;
      if (wanted && db.weeklyMenu.weekStart !== wanted) return null;
      return { ...db.weeklyMenu };
    },

    async listDeliveryZones() {
      return deliveryZoneFixtures.filter((zone) => zone.isActive).map((zone) => ({ ...zone }));
    },

    async checkPincode(pincode) {
      const zones = deliveryZoneFixtures.filter(
        (zone) => zone.isActive && zone.pincode === pincode,
      );
      return { pincode, served: zones.length > 0, areas: zones.map((zone) => ({ ...zone })) };
    },
  },

  profiles: {
    async get(profileId) {
      const profile = db.profiles.find((item) => item.id === profileId);
      if (!profile || profile.deletedAt) return null;
      return { ...profile };
    },

    async update(profileId, patch) {
      const profile = db.profiles.find((item) => item.id === profileId);
      if (!profile) throw new DataError('Profile not found.', 'not_found');
      Object.assign(profile, patch);
      return { ...profile };
    },
  },

  addresses: {
    async list(profileId) {
      return db.addresses.filter((address) => address.profileId === profileId);
    },

    async create(input: AddressInput) {
      const address: Address = {
        id: uid('addr'),
        profileId: input.profileId,
        label: input.label,
        line1: input.line1,
        line2: input.line2 ?? null,
        area: input.area,
        city: input.city,
        pincode: input.pincode,
        isDefault: input.isDefault ?? db.addresses.filter((a) => a.profileId === input.profileId).length === 0,
      };
      if (address.isDefault) {
        for (const existing of db.addresses) {
          if (existing.profileId === address.profileId) existing.isDefault = false;
        }
      }
      db.addresses.push(address);
      return { ...address };
    },

    async update(addressId, patch) {
      const address = db.addresses.find((item) => item.id === addressId);
      if (!address) throw new DataError('Address not found.', 'not_found');
      Object.assign(address, patch);
      return { ...address };
    },

    async setDefault(profileId, addressId) {
      for (const address of db.addresses) {
        address.isDefault = address.profileId === profileId && address.id === addressId;
      }
      return db.addresses.filter((address) => address.profileId === profileId);
    },
  },

  dogs: {
    async list(ownerId) {
      return db.dogs.filter((dog) => dog.ownerId === ownerId);
    },

    async get(dogId) {
      const dog = db.dogs.find((item) => item.id === dogId);
      return dog ? { ...dog } : null;
    },

    async create(input: DogInput & { ownerId: string }) {
      const dog: Dog = {
        ...input,
        id: uid('dog'),
        ownerId: input.ownerId,
        createdAt: new Date().toISOString(),
      };
      db.dogs.push(dog);
      return { ...dog };
    },

    async update(dogId, patch) {
      const dog = db.dogs.find((item) => item.id === dogId);
      if (!dog) throw new DataError('Dog not found.', 'not_found');
      Object.assign(dog, patch);
      return { ...dog };
    },

    async listWeights(dogId) {
      return db.dogWeights
        .filter((weight) => weight.dogId === dogId)
        .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
    },

    async addWeight(dogId, weightKg) {
      const weight: DogWeight = {
        id: uid('weight'),
        dogId,
        weightKg,
        recordedAt: toIsoDate(new Date()),
      };
      db.dogWeights.push(weight);
      return { ...weight };
    },

    async getDietPlan(dogId) {
      const plan = db.dietPlans.find((item) => item.dogId === dogId);
      return plan ? { ...plan } : null;
    },
  },

  subscriptions: {
    async list(customerId) {
      return db.subscriptions
        .filter((subscription) => subscription.customerId === customerId)
        .map((subscription) => withDetails(subscription));
    },

    async get(subscriptionId) {
      const subscription = db.subscriptions.find((item) => item.id === subscriptionId);
      return subscription ? withDetails(subscription) : null;
    },

    async create(input: CreateSubscriptionInput): Promise<CheckoutResult> {
      const dog = db.dogs.find((item) => item.id === input.dogId);
      if (!dog) throw new DataError('Dog not found.', 'not_found');
      const plan = planById(input.planId);
      if (!plan) throw new DataError('Plan not found.', 'not_found');
      if (
        db.subscriptions.some(
          (subscription) =>
            subscription.customerId === input.customerId &&
            subscription.dogId === input.dogId &&
            subscription.status === 'active',
        )
      ) {
        throw new DataError('This dog already has an active subscription.', 'active_subscription');
      }

      const coupon = db.coupons.find((item) => item.code === (input.couponCode ?? '').toUpperCase());
      const subtotal = plan.priceInr +
        input.addonIds.reduce((sum, id) => sum + (addonById(id)?.priceInr ?? 0), 0);
      const discount = discountFor(coupon ?? null, subtotal);

      const subscription: Subscription = {
        id: uid('sub'),
        customerId: input.customerId,
        dogId: input.dogId,
        planId: input.planId,
        status: 'trial',
        startDate: toIsoDate(new Date()),
        nextDeliveryDate: toIsoDate(upcomingDeliveryDate()),
        addressId: input.addressId,
        priceSnapshotInr: subtotal,
        couponId: coupon?.id ?? null,
        createdAt: new Date().toISOString(),
        pausedUntil: null,
        addonIds: input.addonIds,
      };
      db.subscriptions.push(subscription);
      if (coupon) coupon.timesRedeemed += 1;

      const order = buildPlannedOrder(subscription, subscription.nextDeliveryDate);
      order.notes = input.notes ?? null;
      order.discountInr = discount;
      order.totalInr = subtotal - discount;
      const payment = db.payments.find((item) => item.orderId === order.id)!;
      payment.amountInr = order.totalInr;

      return {
        subscription: withDetails(subscription),
        order: orderWithItems(order),
        payment,
      };
    },

    async pause(subscriptionId, untilIso) {
      const subscription = db.subscriptions.find((item) => item.id === subscriptionId);
      if (!subscription) throw new DataError('Subscription not found.', 'not_found');
      subscription.status = 'paused';
      subscription.pausedUntil = untilIso;
      return withDetails(subscription);
    },

    async resume(subscriptionId) {
      const subscription = db.subscriptions.find((item) => item.id === subscriptionId);
      if (!subscription) throw new DataError('Subscription not found.', 'not_found');
      subscription.status = 'active';
      subscription.pausedUntil = null;
      if (!db.orders.some((order) => order.subscriptionId === subscriptionId && order.status === 'planned')) {
        buildPlannedOrder(subscription, toIsoDate(upcomingDeliveryDate()));
      }
      return withDetails(subscription);
    },

    async skipNext(subscriptionId) {
      const subscription = db.subscriptions.find((item) => item.id === subscriptionId);
      if (!subscription) throw new DataError('Subscription not found.', 'not_found');
      subscription.nextDeliveryDate = toIsoDate(addDays(new Date(`${subscription.nextDeliveryDate}T00:00:00`), 7));
      return withDetails(subscription);
    },

    async cancel(subscriptionId) {
      const subscription = db.subscriptions.find((item) => item.id === subscriptionId);
      if (!subscription) throw new DataError('Subscription not found.', 'not_found');
      subscription.status = 'cancelled';
      subscription.pausedUntil = null;
      for (const order of db.orders) {
        if (order.subscriptionId === subscriptionId && order.status === 'planned') {
          order.status = 'cancelled';
        }
      }
      return withDetails(subscription);
    },

    async changePlan(subscriptionId, planId) {
      const subscription = db.subscriptions.find((item) => item.id === subscriptionId);
      if (!subscription) throw new DataError('Subscription not found.', 'not_found');
      subscription.planId = planId;
      for (const order of db.orders) {
        if (order.subscriptionId === subscriptionId && order.status === 'planned') {
          order.status = 'cancelled';
        }
      }
      buildPlannedOrder(subscription, toIsoDate(upcomingDeliveryDate()));
      return withDetails(subscription);
    },

    async updateAddons(subscriptionId, addonIds) {
      const subscription = db.subscriptions.find((item) => item.id === subscriptionId);
      if (!subscription) throw new DataError('Subscription not found.', 'not_found');
      subscription.addonIds = addonIds;
      for (const order of db.orders) {
        if (order.subscriptionId === subscriptionId && order.status === 'planned') {
          order.status = 'cancelled';
        }
      }
      buildPlannedOrder(subscription, toIsoDate(upcomingDeliveryDate()));
      return withDetails(subscription);
    },

    async updateAddress(subscriptionId, addressId) {
      const subscription = db.subscriptions.find((item) => item.id === subscriptionId);
      if (!subscription) throw new DataError('Subscription not found.', 'not_found');
      subscription.addressId = addressId;
      return withDetails(subscription);
    },
  },

  orders: {
    async list(customerId) {
      return db.orders
        .filter((order) => order.customerId === customerId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((order) => orderWithItems(order));
    },

    async get(orderId) {
      const order = db.orders.find((item) => item.id === orderId);
      return order ? orderWithItems(order) : null;
    },
  },

  support: {
    async list(customerId) {
      return db.supportTickets
        .filter((ticket) => ticket.customerId === customerId)
        .map((ticket) => ({
          ...ticket,
          messages: db.supportMessages.filter((message) => message.ticketId === ticket.id),
          customerName:
            db.profiles.find((profile) => profile.id === customerId)?.fullName ?? 'Customer',
        }));
    },

    async get(ticketId) {
      const ticket = db.supportTickets.find((item) => item.id === ticketId);
      if (!ticket) return null;
      return {
        ...ticket,
        messages: db.supportMessages.filter((message) => message.ticketId === ticket.id),
        customerName:
          db.profiles.find((profile) => profile.id === ticket.customerId)?.fullName ?? 'Customer',
      };
    },

    async create(input: NewTicketInput) {
      const ticket: SupportTicket = {
        id: uid('ticket'),
        customerId: input.customerId,
        subject: input.subject,
        category: input.category,
        priority: input.priority,
        status: 'open',
        assignedTo: null,
        createdAt: new Date().toISOString(),
      };
      db.supportTickets.push(ticket);
      db.supportMessages.push({
        id: uid('msg'),
        ticketId: ticket.id,
        senderId: input.customerId,
        body: input.message,
        isInternal: false,
        createdAt: ticket.createdAt,
      });
      return {
        ...ticket,
        messages: db.supportMessages.filter((message) => message.ticketId === ticket.id),
        customerName:
          db.profiles.find((profile) => profile.id === input.customerId)?.fullName ?? 'Customer',
      };
    },

    async reply(ticketId, senderId, body) {
      const ticket = db.supportTickets.find((item) => item.id === ticketId);
      if (!ticket) throw new DataError('Ticket not found.', 'not_found');
      db.supportMessages.push({
        id: uid('msg'),
        ticketId: ticket.id,
        senderId,
        body,
        isInternal: false,
        createdAt: new Date().toISOString(),
      });
      const fresh = db.supportTickets.find((item) => item.id === ticketId)!;
      return {
        ...fresh,
        messages: db.supportMessages.filter((message) => message.ticketId === fresh.id),
        customerName:
          db.profiles.find((profile) => profile.id === fresh.customerId)?.fullName ?? 'Customer',
      };
    },
  },

  coupons: {
    async validate(code, orderValueInr) {
      const coupon = db.coupons.find((item) => item.code === code.trim().toUpperCase());
      if (!coupon || !coupon.isActive) {
        return { valid: false, coupon: null, discountInr: 0, message: 'That coupon code is not valid.' };
      }
      if (coupon.timesRedeemed >= coupon.maxRedemptions) {
        return { valid: false, coupon, discountInr: 0, message: 'That coupon has been used up.' };
      }
      if (orderValueInr < coupon.minOrderInr) {
        return {
          valid: false,
          coupon,
          discountInr: 0,
          message: `This coupon needs a minimum order of ₹${coupon.minOrderInr}.`,
        };
      }
      return {
        valid: true,
        coupon,
        discountInr: discountFor(coupon, orderValueInr),
        message: `${coupon.code} applied — ${coupon.type === 'percent' ? `${coupon.value}% off` : `₹${coupon.value} off`}.`,
      };
    },
  },

  settings: {
    async getNotificationPrefs(profileId) {
      const prefs = db.notificationPrefs.find((item) => item.profileId === profileId);
      if (!prefs) {
        return { profileId, orderUpdates: true, deliveryReminders: true, offers: true, whatsapp: false };
      }
      return { ...prefs };
    },

    async updateNotificationPrefs(profileId, patch) {
      const prefs = db.notificationPrefs.find((item) => item.profileId === profileId);
      if (!prefs) {
        db.notificationPrefs.push({
          profileId,
          orderUpdates: true,
          deliveryReminders: true,
          offers: true,
          whatsapp: false,
          ...patch,
        });
        return db.notificationPrefs[db.notificationPrefs.length - 1]!;
      }
      Object.assign(prefs, patch);
      return { ...prefs };
    },

    async changePassword(profileId, currentPassword, nextPassword) {
      const profile = db.profiles.find((item) => item.id === profileId);
      if (!profile) throw new DataError('Profile not found.', 'not_found');
      const expected = db.credentials[profile.email] ?? DEMO_PASSWORD;
      if (currentPassword !== expected) {
        throw new DataError('Your current password is not correct.', 'invalid_credentials');
      }
      db.credentials[profile.email] = nextPassword;
    },

    async deleteAccount(profileId) {
      const profile = db.profiles.find((item) => item.id === profileId);
      if (!profile) throw new DataError('Profile not found.', 'not_found');
      profile.deletedAt = new Date().toISOString();
      db.sessionProfileId = null;
    },
  },

  waitlist: {
    async join(input: { email: string; pincode: string }) {
      const entry: WaitlistEntry = {
        id: uid('waitlist'),
        email: input.email.trim().toLowerCase(),
        pincode: input.pincode,
        createdAt: new Date().toISOString(),
      };
      db.waitlist.push(entry);
      return { ...entry };
    },
  },

  contact: {
    async submit(input) {
      const id = uid('msg');
      db.contactMessages.push({
        id,
        name: input.name,
        email: input.email,
        phone: input.phone ?? null,
        topic: input.topic,
        message: input.message,
      });
      return { id };
    },
  },
};
