import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/config/env';
import { DataError, type DataClient } from '@/data/client';
import type {
  Address,
  AddressInput,
  Addon,
  AuthUser,
  Coupon,
  CouponValidation,
  CreateSubscriptionInput,
  DeliveryZone,
  DietPlan,
  Dog,
  DogInput,
  DogWeight,
  OrderItem,
  OrderWithItems,
  Payment,
  Plan,
  Profile,
  Recipe,
  RecipeIngredient,
  Session,
  SignUpInput,
  CheckoutResult,
  SupportMessage,
  SupportTicket,
  SupportTicketWithMessages,
  Subscription,
  SubscriptionWithDetails,
  WaitlistEntry,
  WeeklyMenuWithRecipes,
} from '@/data/types';
import { addDays, toIsoDate, upcomingDeliveryDate } from '@/lib/dates';
import { estimateDailyPortionG } from '@/lib/validators';

/**
 * Live Supabase adapter — the only place the app talks to `@supabase/supabase-js`.
 * Every consumer imports `dataClient` from `src/data`; pages never see the SDK.
 *
 * The client is created lazily so the module loads even before the env check,
 * and every failure is normalised into a `DataError` with a stable code.
 */

let client: SupabaseClient | null = null;

function supabase(): SupabaseClient {
  if (!client) {
    if (!env.supabaseUrl || !env.supabaseAnonKey) {
      throw new DataError(
        'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
        'supabase_not_configured',
      );
    }
    client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
}

/* ------------------------------------------------------------------ errors */

function fail(error: unknown, fallbackCode = 'supabase_error'): never {
  if (error instanceof DataError) throw error;
  if (error && typeof error === 'object' && 'message' in error) {
    const supabaseError = error as { code?: string; message?: string; status?: number };
    const code =
      supabaseError.code ??
      (supabaseError.status === 401 || supabaseError.status === 400
        ? 'invalid_credentials'
        : supabaseError.status === 422
          ? 'validation_error'
          : fallbackCode);
    throw new DataError(supabaseError.message ?? 'Something went wrong. Please try again.', code);
  }
  throw new DataError('Something went wrong. Please try again.', fallbackCode);
}

/* ------------------------------------------------------------ URL helpers */

/** Resolve relative asset paths (e.g. `images/bowl-*.webp`) against the deployed base path. */
function resolveAssetUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
  return `${import.meta.env.BASE_URL}${url.replace(/^\/+/, '')}`;
}

/* -------------------------------------------------------------- row mappers */

type Row = Record<string, unknown>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function num(value: unknown): number {
  if (value == null) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function iso(value: unknown): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function dateOnly(value: unknown): string | null {
  if (!value) return null;
  return String(value).slice(0, 10);
}

function strArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function mapPlan(row: Row): Plan {
  return {
    id: str(row.id),
    slug: str(row.slug),
    name: str(row.name),
    weightBand: str(row.weight_band) as Plan['weightBand'],
    durationDays: num(row.duration_days),
    mealsPerDay: num(row.meals_per_day),
    priceInr: num(row.price_inr),
    compareAtInr: row.compare_at_inr == null ? null : num(row.compare_at_inr),
    description: str(row.description),
    features: strArray(row.features),
    isActive: bool(row.is_active),
    sortOrder: num(row.sort_order),
    badge: row.badge == null ? null : str(row.badge),
    perDayLabel: row.per_day_label == null ? null : str(row.per_day_label),
  };
}

function mapAddon(row: Row): Addon {
  return {
    id: str(row.id),
    name: str(row.name),
    priceInr: num(row.price_inr),
    description: str(row.description),
    isActive: bool(row.is_active),
  };
}

function mapRecipe(row: Row): Recipe {
  const ingredients = Array.isArray(row.ingredients)
    ? (row.ingredients as Row[]).map((item) => ({
        item: str(item.item),
        quantity: str(item.quantity),
      }))
    : [];
  return {
    id: str(row.id),
    slug: str(row.slug),
    name: str(row.name),
    protein: str(row.protein) as Recipe['protein'],
    tagline: str(row.tagline),
    description: str(row.description),
    ingredients: ingredients as RecipeIngredient[],
    caloriesPer100g: num(row.calories_per_100g),
    allergens: strArray(row.allergens),
    photoUrl: resolveAssetUrl(str(row.photo_url) || null) ?? '',
    isActive: bool(row.is_active),
  };
}

function mapZone(row: Row): DeliveryZone {
  return {
    id: str(row.id),
    areaName: str(row.area_name),
    pincode: str(row.pincode),
    city: str(row.city),
    isActive: bool(row.is_active),
    deliveryDays: strArray(row.delivery_days),
  };
}

function mapProfile(row: Row): Profile {
  return {
    id: str(row.id),
    role: str(row.role) as Profile['role'],
    fullName: str(row.full_name),
    email: str(row.email),
    phone: row.phone == null ? null : str(row.phone),
    avatarUrl: resolveAssetUrl(str(row.avatar_url) || null),
    createdAt: iso(row.created_at) ?? '',
    deletedAt: iso(row.deleted_at),
  };
}

function mapAddress(row: Row): Address {
  return {
    id: str(row.id),
    profileId: str(row.profile_id),
    label: str(row.label),
    line1: str(row.line1),
    line2: row.line2 == null ? null : str(row.line2),
    area: str(row.area),
    city: str(row.city),
    pincode: str(row.pincode),
    isDefault: bool(row.is_default),
  };
}

function mapDog(row: Row): Dog {
  return {
    id: str(row.id),
    ownerId: str(row.owner_id),
    name: str(row.name),
    photoUrl: resolveAssetUrl(str(row.photo_url) || null),
    breed: str(row.breed),
    dob: dateOnly(row.dob) ?? '',
    weightKg: num(row.weight_kg),
    bodyCondition: (str(row.body_condition) || 'ideal') as Dog['bodyCondition'],
    activityLevel: (str(row.activity_level) || 'moderate') as Dog['activityLevel'],
    neutered: bool(row.neutered),
    allergies: strArray(row.allergies),
    medicalNotes: row.medical_notes == null ? null : str(row.medical_notes),
    currentFood: row.current_food == null ? null : str(row.current_food),
    picky: bool(row.picky),
    createdAt: iso(row.created_at) ?? '',
  };
}

function mapWeight(row: Row): DogWeight {
  return {
    id: str(row.id),
    dogId: str(row.dog_id),
    weightKg: num(row.weight_kg),
    recordedAt: dateOnly(row.recorded_at) ?? '',
  };
}

function mapDietPlan(row: Row): DietPlan {
  return {
    id: str(row.id),
    dogId: str(row.dog_id),
    vetId: str(row.vet_id),
    recipeIds: strArray(row.recipe_ids),
    portionOverrideG: row.portion_override_g == null ? null : num(row.portion_override_g),
    notes: str(row.notes),
    status: str(row.status) as DietPlan['status'],
    approvedAt: iso(row.approved_at),
    createdAt: iso(row.created_at) ?? '',
  };
}

function mapSubscription(row: Row): Subscription {
  return {
    id: str(row.id),
    customerId: str(row.customer_id),
    dogId: str(row.dog_id),
    planId: str(row.plan_id),
    status: str(row.status) as Subscription['status'],
    startDate: dateOnly(row.start_date) ?? '',
    nextDeliveryDate: dateOnly(row.next_delivery_date) ?? '',
    addressId: str(row.address_id),
    priceSnapshotInr: num(row.price_snapshot_inr),
    couponId: row.coupon_id == null ? null : str(row.coupon_id),
    createdAt: iso(row.created_at) ?? '',
    pausedUntil: dateOnly(row.paused_until),
    addonIds: strArray(row.addon_ids),
  };
}

function mapOrder(row: Row): OrderWithItems {
  const snapshot = (row.address_snapshot ?? {}) as Row;
  return {
    id: str(row.id),
    subscriptionId: row.subscription_id == null ? null : str(row.subscription_id),
    customerId: str(row.customer_id),
    dogId: str(row.dog_id),
    deliveryDate: dateOnly(row.delivery_date) ?? '',
    status: str(row.status) as OrderWithItems['status'],
    subtotalInr: num(row.subtotal_inr),
    discountInr: num(row.discount_inr),
    totalInr: num(row.total_inr),
    addressSnapshot: {
      label: str(snapshot.label) || 'Home',
      line1: str(snapshot.line1) || 'Address on file',
      line2: snapshot.line2 == null ? null : str(snapshot.line2),
      area: str(snapshot.area) || 'Hyderabad',
      city: str(snapshot.city) || 'Hyderabad',
      pincode: str(snapshot.pincode) || '500000',
    },
    notes: row.notes == null ? null : str(row.notes),
    createdAt: iso(row.created_at) ?? '',
    items: [],
    payment: null,
  };
}

function mapOrderItem(row: Row): OrderItem {
  return {
    id: str(row.id),
    orderId: str(row.order_id),
    itemType: str(row.item_type) as OrderItem['itemType'],
    itemId: str(row.item_id),
    nameSnapshot: str(row.name_snapshot),
    qty: num(row.qty),
    unitPriceInr: num(row.unit_price_inr),
  };
}

function mapPayment(row: Row): Payment {
  return {
    id: str(row.id),
    orderId: str(row.order_id),
    customerId: str(row.customer_id),
    amountInr: num(row.amount_inr),
    status: str(row.status) as Payment['status'],
    method: str(row.method) || 'UPI',
    gatewayRef: str(row.gateway_ref),
    createdAt: iso(row.created_at) ?? '',
  };
}

function mapTicket(row: Row): SupportTicket {
  return {
    id: str(row.id),
    customerId: str(row.customer_id),
    subject: str(row.subject),
    category: str(row.category),
    priority: str(row.priority) as SupportTicket['priority'],
    status: str(row.status) as SupportTicket['status'],
    assignedTo: row.assigned_to == null ? null : str(row.assigned_to),
    createdAt: iso(row.created_at) ?? '',
  };
}

function mapMessage(row: Row): SupportMessage {
  return {
    id: str(row.id),
    ticketId: str(row.ticket_id),
    senderId: str(row.sender_id),
    body: str(row.body),
    isInternal: bool(row.is_internal),
    createdAt: iso(row.created_at) ?? '',
  };
}

/* -------------------------------------------------------------- small utils */

async function requireRows<T>(
  promise: PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const { data, error } = await promise;
  if (error) fail(error);
  return data ?? [];
}

async function requireRow<T>(
  promise: PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T | null> {
  const rows = await requireRows(promise);
  return rows[0] ?? null;
}

function toAuthUser(profile: Profile, email: string): AuthUser {
  return { id: profile.id, email, role: profile.role, fullName: profile.fullName };
}

async function buildSession(userId: string): Promise<Session | null> {
  const profile = await requireRow<Row>(
    supabase().from('profiles').select('*').eq('id', userId).limit(1),
  );
  if (!profile || profile.deleted_at != null) return null;
  const mapped = mapProfile(profile);
  return { user: toAuthUser(mapped, mapped.email), mode: 'supabase' };
}

/** Fetch a subscription together with its plan, dog, address and add-ons. */
async function withSubscriptionDetails(subscription: Subscription): Promise<SubscriptionWithDetails> {
  const [planRow, dogRow, addressRow, addonRows] = await Promise.all([
    requireRow<Row>(supabase().from('plans').select('*').eq('id', subscription.planId).limit(1)),
    requireRow<Row>(supabase().from('dogs').select('*').eq('id', subscription.dogId).limit(1)),
    subscription.addressId
      ? requireRow<Row>(supabase().from('addresses').select('*').eq('id', subscription.addressId).limit(1))
      : Promise.resolve(null),
    subscription.addonIds.length
      ? requireRows<Row>(
          supabase()
            .from('addons')
            .select('*')
            .in('id', subscription.addonIds),
        )
      : Promise.resolve([]),
  ]);

  if (!planRow || !dogRow) {
    throw new DataError('Subscription is missing its plan or dog.', 'corrupt_subscription');
  }

  return {
    ...subscription,
    plan: mapPlan(planRow),
    dog: mapDog(dogRow),
    addons: addonRows.map(mapAddon),
    address: addressRow ? mapAddress(addressRow) : null,
  };
}

/** Attach order items + payment to an order. */
async function withOrderItems(order: OrderWithItems): Promise<OrderWithItems> {
  const [itemRows, paymentRow] = await Promise.all([
    requireRows<Row>(supabase().from('order_items').select('*').eq('order_id', order.id)),
    requireRow<Row>(supabase().from('payments').select('*').eq('order_id', order.id).limit(1)),
  ]);
  return {
    ...order,
    items: itemRows.map(mapOrderItem),
    payment: paymentRow ? mapPayment(paymentRow) : null,
  };
}

/** Attach messages (and the customer name) to a ticket. */
async function withTicketMessages(ticket: SupportTicket): Promise<SupportTicketWithMessages> {
  const [messageRows, profileRow] = await Promise.all([
    requireRows<Row>(
      supabase()
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true }),
    ),
    requireRow<Row>(
      supabase().from('profiles').select('*').eq('id', ticket.customerId).limit(1),
    ),
  ]);
  return {
    ...ticket,
    customerName: profileRow ? str(profileRow.full_name) : 'Customer',
    messages: messageRows.map(mapMessage),
  };
}

/* ---------------------------------------------------------------- the adapter */

/** Cancel any not-yet-delivered orders for a subscription (pause/cancel). */
async function cancelPlannedOrders(subscriptionId: string, note: string): Promise<void> {
  const { error } = await supabase()
    .from('orders')
    .update({ status: 'cancelled', notes: note })
    .eq('subscription_id', subscriptionId)
    .eq('status', 'planned');
  if (error) fail(error);
}

async function couponDiscount(couponId: string, subtotal: number): Promise<number> {
  const row = await requireRow<Row>(
    supabase().from('coupons').select('*').eq('id', couponId).limit(1),
  );
  if (!row) return 0;
  return str(row.type) === 'percent'
    ? Math.round((subtotal * num(row.value)) / 100)
    : Math.min(num(row.value), subtotal);
}

/** Re-price the next planned order after a plan/add-on/address change. */
async function refreshPlannedOrder(subscriptionId: string): Promise<void> {
  const subscription = await supabaseClient.subscriptions.get(subscriptionId);
  if (!subscription) return;
  const { data: order, error } = await supabase()
    .from('orders')
    .select('*')
    .eq('subscription_id', subscriptionId)
    .eq('status', 'planned')
    .order('delivery_date', { ascending: true })
    .limit(1);
  if (error) fail(error);
  const planned = order?.[0] as Row | undefined;
  if (!planned) return;

  const subtotal = subscription.plan.priceInr + subscription.addons.reduce((sum, a) => sum + a.priceInr, 0);
  let discount = 0;
  if (subscription.couponId) {
    discount = Math.min(subtotal, await couponDiscount(subscription.couponId, subtotal));
  }
  const { error: updateError } = await supabase()
    .from('orders')
    .update({
      subtotal_inr: subtotal,
      discount_inr: discount,
      total_inr: Math.max(0, subtotal - discount),
      address_snapshot: subscription.address
        ? {
            label: subscription.address.label,
            line1: subscription.address.line1,
            line2: subscription.address.line2,
            area: subscription.address.area,
            city: subscription.address.city,
            pincode: subscription.address.pincode,
          }
        : planned.address_snapshot,
    })
    .eq('id', str(planned.id));
  if (updateError) fail(updateError);
}

async function emailForProfile(profileId: string): Promise<string> {
  const row = await requireRow<Row>(
    supabase().from('profiles').select('email').eq('id', profileId).limit(1),
  );
  return row ? str(row.email) : '';
}

export const supabaseClient: DataClient = {
  mode: 'supabase',

  auth: {
    async getSession() {
      const { data } = await supabase().auth.getSession();
      const userId = data.session?.user.id;
      if (!userId) return null;
      return buildSession(userId);
    },

    async signIn(email, password) {
      const { data, error } = await supabase().auth.signInWithPassword({ email, password });
      if (error) fail(error, 'invalid_credentials');
      const session = await buildSession(data.user.id);
      if (!session) {
        throw new DataError('This account has been deactivated. Contact support to restore it.', 'account_deleted');
      }
      return session;
    },

    async signUp(input: SignUpInput) {
      const { data, error } = await supabase().auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            full_name: input.fullName,
            phone: input.phone || undefined,
          },
        },
      });
      if (error) fail(error, 'email_taken');
      if (!data.user) throw new DataError('Could not create your account. Please try again.');
      // mailer_autoconfirm is on, so the account is active immediately: establish a session.
      const { error: signInError } = await supabase().auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });
      if (signInError) fail(signInError, 'invalid_credentials');
      const session = await buildSession(data.user.id);
      if (!session) {
        throw new DataError('Could not create your account. Please try again.');
      }
      return session;
    },

    async signOut() {
      const { error } = await supabase().auth.signOut();
      if (error) fail(error);
    },

    async resetPassword(email) {
      const { error } = await supabase().auth.resetPasswordForEmail(email);
      // Never leak account existence — Supabase returns the same surface either way.
      if (error) fail(error, 'reset_failed');
    },
  },

  catalog: {
    async listPlans(options) {
      const rows = await requireRows<Row>(
        supabase()
          .from('plans')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('price_inr', { ascending: true }),
      );
      return rows
        .filter((row) => (options?.includeInactive ? true : bool(row.is_active)))
        .map(mapPlan);
    },

    async getPlanBySlug(slug) {
      const row = await requireRow<Row>(
        supabase().from('plans').select('*').eq('slug', slug).limit(1),
      );
      return row ? mapPlan(row) : null;
    },

    async listAddons(options) {
      const rows = await requireRows<Row>(
        supabase()
          .from('addons')
          .select('*')
          .order('sort_order', { ascending: true }),
      );
      return rows
        .filter((row) => (options?.includeInactive ? true : bool(row.is_active)))
        .map(mapAddon);
    },

    async listRecipes(options) {
      const rows = await requireRows<Row>(
        supabase()
          .from('recipes')
          .select('*')
          .order('sort_order', { ascending: true }),
      );
      return rows
        .filter((row) => (options?.includeInactive ? true : bool(row.is_active)))
        .map(mapRecipe);
    },

    async getWeeklyMenu(options): Promise<WeeklyMenuWithRecipes | null> {
      const target = options?.weekStart;
      const menu = await requireRow<Row>(
        target
          ? supabase()
              .from('weekly_menus')
              .select('*')
              .eq('week_start', target)
              .eq('is_published', true)
              .limit(1)
          : supabase()
              .from('weekly_menus')
              .select('*')
              .eq('is_published', true)
              .lte('week_start', toIsoDate(new Date()))
              .order('week_start', { ascending: false })
              .limit(1),
      );
      if (!menu) return null;
      const recipeIds = strArray(menu.recipe_ids);
      const recipeRows = recipeIds.length
        ? await requireRows<Row>(supabase().from('recipes').select('*').in('id', recipeIds))
        : [];
      const byId = new Map(recipeRows.map((row) => [str(row.id), mapRecipe(row)]));
      return {
        id: str(menu.id),
        weekStart: dateOnly(menu.week_start) ?? '',
        recipeIds,
        isPublished: bool(menu.is_published),
        publishedAt: iso(menu.published_at),
        recipes: recipeIds.map((id) => byId.get(id)).filter((recipe): recipe is Recipe => Boolean(recipe)),
      };
    },

    async listDeliveryZones(): Promise<DeliveryZone[]> {
      const rows = await requireRows<Row>(
        supabase()
          .from('delivery_zones')
          .select('*')
          .eq('is_active', true)
          .order('area_name', { ascending: true }),
      );
      return rows.map(mapZone);
    },

    async checkPincode(pincode) {
      const cleaned = pincode.replace(/\D/g, '');
      const rows = await requireRows<Row>(
        supabase()
          .from('delivery_zones')
          .select('*')
          .eq('is_active', true)
          .eq('pincode', cleaned),
      );
      return { pincode: cleaned, served: rows.length > 0, areas: rows.map(mapZone) };
    },
  },

  profiles: {
    async get(profileId) {
      const row = await requireRow<Row>(
        supabase().from('profiles').select('*').eq('id', profileId).limit(1),
      );
      return row ? mapProfile(row) : null;
    },

    async update(profileId, patch) {
      const payload: Row = {};
      if (patch.fullName !== undefined) payload.full_name = patch.fullName;
      if (patch.phone !== undefined) payload.phone = patch.phone;
      if (patch.avatarUrl !== undefined) payload.avatar_url = patch.avatarUrl;
      const { data, error } = await supabase()
        .from('profiles')
        .update(payload)
        .eq('id', profileId)
        .select('*')
        .single();
      if (error) fail(error);
      return mapProfile(data as Row);
    },
  },

  addresses: {
    async list(profileId) {
      const rows = await requireRows<Row>(
        supabase()
          .from('addresses')
          .select('*')
          .eq('profile_id', profileId)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: true }),
      );
      return rows.map(mapAddress);
    },

    async create(input: AddressInput) {
      const shouldDefault = input.isDefault ?? (await this.list(input.profileId)).length === 0;
      if (shouldDefault) {
        const { error } = await supabase()
          .from('addresses')
          .update({ is_default: false })
          .eq('profile_id', input.profileId);
        if (error) fail(error);
      }
      const { data, error } = await supabase()
        .from('addresses')
        .insert({
          profile_id: input.profileId,
          label: input.label,
          line1: input.line1,
          line2: input.line2 ?? null,
          area: input.area,
          city: input.city,
          pincode: input.pincode,
          is_default: shouldDefault,
        })
        .select('*')
        .single();
      if (error) fail(error);
      return mapAddress(data as Row);
    },

    async update(addressId, patch) {
      const payload: Row = {};
      if (patch.label !== undefined) payload.label = patch.label;
      if (patch.line1 !== undefined) payload.line1 = patch.line1;
      if (patch.line2 !== undefined) payload.line2 = patch.line2;
      if (patch.area !== undefined) payload.area = patch.area;
      if (patch.city !== undefined) payload.city = patch.city;
      if (patch.pincode !== undefined) payload.pincode = patch.pincode;
      if (patch.isDefault !== undefined) payload.is_default = patch.isDefault;
      const { data, error } = await supabase()
        .from('addresses')
        .update(payload)
        .eq('id', addressId)
        .select('*')
        .single();
      if (error) fail(error);
      if (patch.isDefault) {
        const { error: defaultError } = await supabase().rpc('set_default_address', {
          p_address_id: addressId,
        });
        if (defaultError) fail(defaultError);
      }
      return mapAddress(data as Row);
    },

    async setDefault(profileId, addressId) {
      const { error } = await supabase().rpc('set_default_address', { p_address_id: addressId });
      if (error) fail(error);
      return this.list(profileId);
    },
  },

  dogs: {
    async list(ownerId) {
      const rows = await requireRows<Row>(
        supabase()
          .from('dogs')
          .select('*')
          .eq('owner_id', ownerId)
          .eq('is_active', true)
          .order('name', { ascending: true }),
      );
      return rows.map(mapDog);
    },

    async get(dogId) {
      const row = await requireRow<Row>(
        supabase().from('dogs').select('*').eq('id', dogId).limit(1),
      );
      return row ? mapDog(row) : null;
    },

    async create(input: DogInput & { ownerId: string }) {
      const { data, error } = await supabase()
        .from('dogs')
        .insert({
          owner_id: input.ownerId,
          name: input.name,
          photo_url: input.photoUrl,
          breed: input.breed || null,
          dob: input.dob || null,
          weight_kg: input.weightKg,
          body_condition: input.bodyCondition,
          activity_level: input.activityLevel,
          neutered: input.neutered,
          allergies: input.allergies,
          medical_notes: input.medicalNotes || null,
          current_food: input.currentFood || null,
          picky: input.picky,
        })
        .select('*')
        .single();
      if (error) fail(error);
      const dog = mapDog(data as Row);

      await supabase().from('dog_weights').insert({
        dog_id: dog.id,
        weight_kg: dog.weightKg,
        recorded_at: toIsoDate(new Date()),
      });

      /* A suggested plan goes straight to the vet queue, exactly like sign-up. */
      const recipes = await requireRows<Row>(
        supabase()
          .from('recipes')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
      );
      const suggested = recipes
        .filter(
          (recipe) =>
            !input.allergies.some((allergy) =>
              str(recipe.name).toLowerCase().includes(allergy.toLowerCase()),
            ),
        )
        .slice(0, 2)
        .map((recipe) => str(recipe.id));
      const dailyG = estimateDailyPortionG(dog.weightKg, dog.activityLevel);
      await supabase().rpc('create_suggested_diet_plan', {
        p_dog_id: dog.id,
        p_recipe_ids: suggested,
        p_notes: `Suggested portion ${dailyG} g per day, split across 2 meals. Pending veterinary-nutritionist review.`,
      });

      return dog;
    },

    async update(dogId, patch) {
      const payload: Row = {};
      if (patch.name !== undefined) payload.name = patch.name;
      if (patch.photoUrl !== undefined) payload.photo_url = patch.photoUrl;
      if (patch.breed !== undefined) payload.breed = patch.breed;
      if (patch.dob !== undefined) payload.dob = patch.dob;
      if (patch.weightKg !== undefined) payload.weight_kg = patch.weightKg;
      if (patch.bodyCondition !== undefined) payload.body_condition = patch.bodyCondition;
      if (patch.activityLevel !== undefined) payload.activity_level = patch.activityLevel;
      if (patch.neutered !== undefined) payload.neutered = patch.neutered;
      if (patch.allergies !== undefined) payload.allergies = patch.allergies;
      if (patch.medicalNotes !== undefined) payload.medical_notes = patch.medicalNotes;
      if (patch.currentFood !== undefined) payload.current_food = patch.currentFood;
      if (patch.picky !== undefined) payload.picky = patch.picky;
      const { data, error } = await supabase()
        .from('dogs')
        .update(payload)
        .eq('id', dogId)
        .select('*')
        .single();
      if (error) fail(error);
      return mapDog(data as Row);
    },

    async listWeights(dogId) {
      const rows = await requireRows<Row>(
        supabase()
          .from('dog_weights')
          .select('*')
          .eq('dog_id', dogId)
          .order('recorded_at', { ascending: true }),
      );
      return rows.map(mapWeight);
    },

    async addWeight(dogId, weightKg) {
      const { data, error } = await supabase()
        .from('dog_weights')
        .insert({ dog_id: dogId, weight_kg: Number(weightKg.toFixed(1)), recorded_at: toIsoDate(new Date()) })
        .select('*')
        .single();
      if (error) fail(error);
      const entry = mapWeight(data as Row);
      await supabase()
        .from('dogs')
        .update({ weight_kg: entry.weightKg })
        .eq('id', dogId);
      return entry;
    },

    async getDietPlan(dogId) {
      const row = await requireRow<Row>(
        supabase()
          .from('diet_plans')
          .select('*')
          .eq('dog_id', dogId)
          .neq('status', 'rejected')
          .order('created_at', { ascending: false })
          .limit(1),
      );
      return row ? mapDietPlan(row) : null;
    },
  },

  subscriptions: {
    async list(customerId) {
      const rows = await requireRows<Row>(
        supabase()
          .from('subscriptions')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false }),
      );
      const plans = await requireRows<Row>(
        supabase().from('plans').select('*').in('id', rows.map((row) => str(row.plan_id))),
      );
      const dogs = await requireRows<Row>(
        supabase().from('dogs').select('*').in('id', rows.map((row) => str(row.dog_id))),
      );
      const addresses = await requireRows<Row>(
        supabase()
          .from('addresses')
          .select('*')
          .in('id', rows.map((row) => str(row.address_id)).filter(Boolean)),
      );
      const addonIds = Array.from(new Set(rows.flatMap((row) => strArray(row.addon_ids))));
      const addons = addonIds.length
        ? await requireRows<Row>(supabase().from('addons').select('*').in('id', addonIds))
        : [];

      const planById = new Map(plans.map((row) => [str(row.id), mapPlan(row)]));
      const dogById = new Map(dogs.map((row) => [str(row.id), mapDog(row)]));
      const addressById = new Map(addresses.map((row) => [str(row.id), mapAddress(row)]));
      const addonById = new Map(addons.map((row) => [str(row.id), mapAddon(row)]));

      return rows.map((row) => {
        const subscription = mapSubscription(row);
        const plan = planById.get(subscription.planId);
        const dog = dogById.get(subscription.dogId);
        if (!plan || !dog) {
          throw new DataError('Subscription is missing its plan or dog.', 'corrupt_subscription');
        }
        return {
          ...subscription,
          plan,
          dog,
          addons: subscription.addonIds
            .map((id) => addonById.get(id))
            .filter((addon): addon is Addon => Boolean(addon)),
          address: addressById.get(subscription.addressId) ?? null,
        };
      });
    },

    async get(subscriptionId) {
      const row = await requireRow<Row>(
        supabase().from('subscriptions').select('*').eq('id', subscriptionId).limit(1),
      );
      if (!row) return null;
      return withSubscriptionDetails(mapSubscription(row));
    },

    async create(input: CreateSubscriptionInput): Promise<CheckoutResult> {
      const { data, error } = await supabase().rpc('create_subscription_checkout', {
        p_dog_id: input.dogId,
        p_plan_id: input.planId,
        p_addon_ids: input.addonIds,
        p_address_id: input.addressId,
        p_coupon_code: input.couponCode ?? null,
        p_notes: input.notes ?? null,
        p_payment_method: 'UPI',
      });
      if (error) fail(error);
      const result = (data ?? null) as Row | null;
      if (!result?.subscriptionId) {
        throw new DataError('Checkout could not be completed. Please try again.', 'checkout_failed');
      }
      const [subscription, orderRow] = await Promise.all([
        this.get(str(result.subscriptionId)),
        requireRow<Row>(supabase().from('orders').select('*').eq('id', str(result.orderId)).limit(1)),
      ]);
      if (!subscription) throw new DataError('Subscription could not be loaded.', 'checkout_failed');
      if (!orderRow) throw new DataError('Order could not be loaded.', 'checkout_failed');
      const orderWithItems = await withOrderItems(mapOrder(orderRow));
      const paymentRow = await requireRow<Row>(
        supabase().from('payments').select('*').eq('id', str(result.paymentId)).limit(1),
      );
      return {
        subscription,
        order: orderWithItems,
        payment: paymentRow ? mapPayment(paymentRow) : orderWithItems.payment ?? emptyPayment(orderWithItems),
      };
    },

    async pause(subscriptionId, untilIso) {
      const pausedUntil = untilIso.slice(0, 10);
      const { data, error } = await supabase()
        .from('subscriptions')
        .update({
          status: 'paused',
          paused_until: pausedUntil,
          next_delivery_date: toIsoDate(upcomingDeliveryDate(new Date(`${pausedUntil}T00:00:00`))),
        })
        .eq('id', subscriptionId)
        .select('*')
        .single();
      if (error) fail(error);
      await cancelPlannedOrders(subscriptionId, `Paused until ${pausedUntil}`);
      return withSubscriptionDetails(mapSubscription(data as Row));
    },

    async resume(subscriptionId) {
      const nextDelivery = toIsoDate(upcomingDeliveryDate(new Date()));
      const { data, error } = await supabase()
        .from('subscriptions')
        .update({ status: 'active', paused_until: null, next_delivery_date: nextDelivery })
        .eq('id', subscriptionId)
        .select('*')
        .single();
      if (error) fail(error);
      const hasPlanned = await requireRow<Row>(
        supabase()
          .from('orders')
          .select('id')
          .eq('subscription_id', subscriptionId)
          .eq('status', 'planned')
          .eq('delivery_date', nextDelivery)
          .limit(1),
      );
      if (!hasPlanned) {
        const { error: scheduleError } = await supabase().rpc('schedule_subscription_delivery', {
          p_subscription_id: subscriptionId,
          p_delivery_date: nextDelivery,
        });
        if (scheduleError) fail(scheduleError);
      }
      return withSubscriptionDetails(mapSubscription(data as Row));
    },

    async skipNext(subscriptionId) {
      const subscription = await this.get(subscriptionId);
      if (!subscription) throw new DataError('Subscription not found.', 'not_found');
      if (subscription.status !== 'active') {
        throw new DataError('Only active subscriptions can skip a delivery.', 'invalid_state');
      }
      const previousDate = subscription.nextDeliveryDate;
      const nextDate = toIsoDate(addDays(new Date(`${previousDate}T00:00:00`), 7));
      const { data, error } = await supabase()
        .from('subscriptions')
        .update({ next_delivery_date: nextDate })
        .eq('id', subscriptionId)
        .select('*')
        .single();
      if (error) fail(error);
      await supabase()
        .from('orders')
        .update({ delivery_date: nextDate, notes: `Skipped ${previousDate} — moved to ${nextDate}` })
        .eq('subscription_id', subscriptionId)
        .eq('status', 'planned')
        .eq('delivery_date', previousDate);
      return withSubscriptionDetails(mapSubscription(data as Row));
    },

    async cancel(subscriptionId, reason) {
      const { data, error } = await supabase()
        .from('subscriptions')
        .update({
          status: 'cancelled',
          paused_until: null,
          cancellation_reason: reason ? `Cancelled: ${reason}` : 'Subscription cancelled by customer',
        })
        .eq('id', subscriptionId)
        .select('*')
        .single();
      if (error) fail(error);
      await cancelPlannedOrders(
        subscriptionId,
        reason ? `Cancelled: ${reason}` : 'Subscription cancelled by customer',
      );
      return withSubscriptionDetails(mapSubscription(data as Row));
    },

    async changePlan(subscriptionId, planId) {
      const { data, error } = await supabase()
        .from('subscriptions')
        .update({ plan_id: planId })
        .eq('id', subscriptionId)
        .select('*')
        .single();
      if (error) fail(error);
      await refreshPlannedOrder(subscriptionId);
      return withSubscriptionDetails(mapSubscription(data as Row));
    },

    async updateAddons(subscriptionId, addonIds) {
      const { data, error } = await supabase()
        .from('subscriptions')
        .update({ addon_ids: addonIds })
        .eq('id', subscriptionId)
        .select('*')
        .single();
      if (error) fail(error);
      await refreshPlannedOrder(subscriptionId);
      return withSubscriptionDetails(mapSubscription(data as Row));
    },

    async updateAddress(subscriptionId, addressId) {
      const { data, error } = await supabase()
        .from('subscriptions')
        .update({ address_id: addressId })
        .eq('id', subscriptionId)
        .select('*')
        .single();
      if (error) fail(error);
      await refreshPlannedOrder(subscriptionId);
      return withSubscriptionDetails(mapSubscription(data as Row));
    },
  },

  orders: {
    async list(customerId) {
      const rows = await requireRows<Row>(
        supabase()
          .from('orders')
          .select('*')
          .eq('customer_id', customerId)
          .order('delivery_date', { ascending: false }),
      );
      const itemRows = await requireRows<Row>(
        supabase()
          .from('order_items')
          .select('*')
          .in('order_id', rows.map((row) => str(row.id))),
      );
      const paymentRows = await requireRows<Row>(
        supabase()
          .from('payments')
          .select('*')
          .in('order_id', rows.map((row) => str(row.id))),
      );
      const itemsByOrder = new Map<string, OrderItem[]>();
      for (const item of itemRows) {
        const key = str(item.order_id);
        const list = itemsByOrder.get(key) ?? [];
        list.push(mapOrderItem(item));
        itemsByOrder.set(key, list);
      }
      const paymentByOrder = new Map(paymentRows.map((row) => [str(row.order_id), mapPayment(row)]));
      return rows.map((row) => {
        const order = mapOrder(row);
        return {
          ...order,
          items: itemsByOrder.get(order.id) ?? [],
          payment: paymentByOrder.get(order.id) ?? null,
        };
      });
    },

    async get(orderId) {
      const row = await requireRow<Row>(
        supabase().from('orders').select('*').eq('id', orderId).limit(1),
      );
      if (!row) return null;
      return withOrderItems(mapOrder(row));
    },
  },

  support: {
    async list(customerId) {
      const rows = await requireRows<Row>(
        supabase()
          .from('support_tickets')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false }),
      );
      const messageRows = await requireRows<Row>(
        supabase()
          .from('support_messages')
          .select('*')
          .in('ticket_id', rows.map((row) => str(row.id)))
          .order('created_at', { ascending: true }),
      );
      const profileRows = await requireRows<Row>(
        supabase()
          .from('profiles')
          .select('*')
          .in('id', rows.map((row) => str(row.customer_id))),
      );
      const messagesByTicket = new Map<string, SupportMessage[]>();
      for (const message of messageRows) {
        const key = str(message.ticket_id);
        const list = messagesByTicket.get(key) ?? [];
        list.push(mapMessage(message));
        messagesByTicket.set(key, list);
      }
      const nameById = new Map(profileRows.map((row) => [str(row.id), str(row.full_name)]));
      return rows.map((row) => {
        const ticket = mapTicket(row);
        return {
          ...ticket,
          customerName: nameById.get(ticket.customerId) ?? 'Customer',
          messages: messagesByTicket.get(ticket.id) ?? [],
        };
      });
    },

    async get(ticketId) {
      const row = await requireRow<Row>(
        supabase().from('support_tickets').select('*').eq('id', ticketId).limit(1),
      );
      if (!row) return null;
      return withTicketMessages(mapTicket(row));
    },

    async create(input) {
      const { data, error } = await supabase().rpc('create_support_ticket', {
        p_subject: input.subject,
        p_category: input.category,
        p_priority: input.priority,
        p_message: input.message,
      });
      if (error) fail(error);
      const ticket = await this.get(str(data));
      if (!ticket) throw new DataError('Ticket could not be created. Please try again.', 'not_found');
      return ticket;
    },

    async reply(ticketId, senderId, body) {
      const { error } = await supabase().from('support_messages').insert({
        ticket_id: ticketId,
        sender_id: senderId,
        body: body.trim(),
        is_internal: false,
      });
      if (error) fail(error);
      const { error: statusError } = await supabase()
        .from('support_tickets')
        .update({ status: 'open' })
        .eq('id', ticketId)
        .in('status', ['resolved', 'closed']);
      if (statusError) fail(statusError);
      const ticket = await this.get(ticketId);
      if (!ticket) throw new DataError('Ticket not found.', 'not_found');
      return ticket;
    },
  },

  coupons: {
    async validate(code, orderValueInr): Promise<CouponValidation> {
      const { data, error } = await supabase().rpc('validate_coupon', {
        p_code: code,
        p_order_value_inr: orderValueInr,
      });
      if (error) fail(error);
      const result = (data ?? null) as Row | null;
      if (!result) {
        return { valid: false, coupon: null, discountInr: 0, message: 'That code is not valid.' };
      }
      const couponRow = result.coupon as Row | null;
      const coupon: Coupon | null = couponRow
        ? {
            id: str(couponRow.id),
            code: str(couponRow.code),
            type: str(couponRow.type) as Coupon['type'],
            value: num(couponRow.value),
            minOrderInr: num(couponRow.minOrderInr),
            maxRedemptions: num(couponRow.maxRedemptions),
            timesRedeemed: num(couponRow.timesRedeemed),
            expiresAt: str(couponRow.expiresAt),
            isActive: bool(couponRow.isActive),
          }
        : null;
      return {
        valid: bool(result.valid),
        coupon,
        discountInr: num(result.discountInr),
        message: str(result.message) || (bool(result.valid) ? 'Coupon applied.' : 'That code is not valid.'),
      };
    },
  },

  settings: {
    async getNotificationPrefs(profileId) {
      const row = await requireRow<Row>(
        supabase()
          .from('notification_prefs')
          .select('*')
          .eq('profile_id', profileId)
          .limit(1),
      );
      return {
        profileId,
        orderUpdates: row ? bool(row.order_updates, true) : true,
        deliveryReminders: row ? bool(row.delivery_reminders, true) : true,
        offers: row ? bool(row.offers, false) : false,
        whatsapp: row ? bool(row.whatsapp, true) : true,
      };
    },

    async updateNotificationPrefs(profileId, patch) {
      const payload: Row = {};
      if (patch.orderUpdates !== undefined) payload.order_updates = patch.orderUpdates;
      if (patch.deliveryReminders !== undefined) payload.delivery_reminders = patch.deliveryReminders;
      if (patch.offers !== undefined) payload.offers = patch.offers;
      if (patch.whatsapp !== undefined) payload.whatsapp = patch.whatsapp;
      const { data, error } = await supabase()
        .from('notification_prefs')
        .upsert({ profile_id: profileId, ...payload })
        .select('*')
        .single();
      if (error) fail(error);
      const row = data as Row;
      return {
        profileId,
        orderUpdates: bool(row.order_updates, true),
        deliveryReminders: bool(row.delivery_reminders, true),
        offers: bool(row.offers, false),
        whatsapp: bool(row.whatsapp, true),
      };
    },

    async changePassword(profileId, currentPassword, nextPassword) {
      // Re-authenticate with the current password, then rotate it.
      const { error } = await supabase().auth.signInWithPassword({
        email: await emailForProfile(profileId),
        password: currentPassword,
      });
      if (error) {
        throw new DataError('Your current password is not correct.', 'invalid_credentials');
      }
      const { error: updateError } = await supabase().auth.updateUser({ password: nextPassword });
      if (updateError) fail(updateError, 'password_update_failed');
    },

    async deleteAccount(profileId) {
      const { error } = await supabase().rpc('delete_my_account');
      if (error) fail(error);
      await supabase().auth.signOut();
      void profileId;
    },
  },

  waitlist: {
    async join(input): Promise<WaitlistEntry> {
      const { data, error } = await supabase().rpc('join_waitlist', {
        p_email: input.email,
        p_pincode: input.pincode,
      });
      if (error) fail(error);
      const row = (data ?? null) as Row | null;
      if (!row) throw new DataError('Could not join the waitlist. Please try again.', 'waitlist_failed');
      return {
        id: str(row.id),
        email: str(row.email),
        pincode: str(row.pincode),
        createdAt: iso(row.createdAt) ?? new Date().toISOString(),
      };
    },
  },

  contact: {
    async submit(input) {
      const { data, error } = await supabase().rpc(
        'submit_contact_message',
        {
          p_full_name: input.name,
          p_email: input.email,
          p_phone: input.phone ?? '',
          p_topic: input.topic,
          p_message: input.message,
        },
      );
      if (error) fail(error);
      const id = (data ?? null) as string | null;
      if (!id) throw new DataError('Could not send your message. Please try again.', 'contact_failed');
      return { id };
    },
  },
};

function emptyPayment(order: OrderWithItems): Payment {
  return {
    id: '',
    orderId: order.id,
    customerId: order.customerId,
    amountInr: order.totalInr,
    status: 'pending',
    method: 'UPI',
    gatewayRef: '',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Upload a dog photo to the `dog-photos` storage bucket. Returns the public URL
 * to store on the dog profile. Folder-per-user isolation is enforced by RLS.
 */
export async function uploadDogPhoto(
  userId: string,
  file: File,
  dogId: string,
): Promise<string> {
  const path = `${userId}/${dogId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const { error } = await supabase().storage.from('dog-photos').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) fail(error, 'upload_failed');
  return supabase().storage.from('dog-photos').getPublicUrl(path).data.publicUrl;
}

/** Exported for tests and the auth provider's reactive state wiring. */
export function getSupabaseClient(): SupabaseClient {
  return supabase();
}

/**
 * Subscribe to Supabase auth state changes (sign-in, sign-out, token refresh,
 * other-tab logins). Returns an unsubscribe function. supabase-js handles the
 * PKCE flow for OTP/magic-link sign-ins internally.
 */
export function subscribeAuthState(callback: (userId: string | null) => void): () => void {
  const client = supabase();
  void client.auth.getSession().then((data) => {
    callback(data.data.session?.user.id ?? null);
  });
  const { data } = client.auth.onAuthStateChange((_event, session) => {
    callback(session?.user.id ?? null);
  });
  return () => data.subscription.unsubscribe();
}
