/**
 * Domain types shared by the mock adapter, the Supabase adapter and the UI.
 * These mirror `supabase/migrations/0001_init.sql` (camelCase here, snake_case there).
 */

export type Role = 'customer' | 'vet' | 'admin';
export type DataMode = 'supabase';

export type WeightBand = 'small' | 'medium' | 'large' | 'topper' | 'special';

export interface Plan {
  id: string;
  slug: string;
  name: string;
  weightBand: WeightBand;
  durationDays: number;
  mealsPerDay: number;
  priceInr: number;
  compareAtInr: number | null;
  description: string;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  badge: string | null;
  perDayLabel: string | null;
}

export interface Addon {
  id: string;
  name: string;
  priceInr: number;
  description: string;
  isActive: boolean;
}

export interface RecipeIngredient {
  item: string;
  quantity: string;
}

export interface Recipe {
  id: string;
  slug: string;
  name: string;
  protein: 'chicken' | 'lamb' | 'fish' | 'vegetarian';
  tagline: string;
  description: string;
  ingredients: RecipeIngredient[];
  caloriesPer100g: number;
  allergens: string[];
  photoUrl: string;
  isActive: boolean;
}

export interface WeeklyMenu {
  id: string;
  weekStart: string; // ISO date (Sunday)
  recipeIds: string[];
  isPublished: boolean;
  publishedAt: string | null;
}

export interface WeeklyMenuWithRecipes extends WeeklyMenu {
  recipes: Recipe[];
}

export interface DeliveryZone {
  id: string;
  areaName: string;
  pincode: string;
  city: string;
  isActive: boolean;
  deliveryDays: string[];
}

export interface PincodeCheckResult {
  pincode: string;
  served: boolean;
  areas: DeliveryZone[];
}

export interface WaitlistEntry {
  id: string;
  email: string;
  pincode: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  topic: string;
  message: string;
}

export interface Profile {
  id: string;
  role: Role;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
  /** Soft-delete marker for "delete my account"; deleted accounts cannot sign in. */
  deletedAt?: string | null;
}

export interface NotificationPrefs {
  profileId: string;
  orderUpdates: boolean;
  deliveryReminders: boolean;
  offers: boolean;
  whatsapp: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  fullName: string;
}

export interface Session {
  user: AuthUser;
  mode: DataMode;
}

export interface SignUpInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface Address {
  id: string;
  profileId: string;
  label: string;
  line1: string;
  line2: string | null;
  area: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

export type BodyCondition = 'underweight' | 'ideal' | 'overweight';
export type ActivityLevel = 'low' | 'moderate' | 'high';

export interface Dog {
  id: string;
  ownerId: string;
  name: string;
  photoUrl: string | null;
  breed: string;
  dob: string;
  weightKg: number;
  bodyCondition: BodyCondition;
  activityLevel: ActivityLevel;
  neutered: boolean;
  allergies: string[];
  medicalNotes: string | null;
  currentFood: string | null;
  picky: boolean;
  createdAt: string;
}

export interface DogWeight {
  id: string;
  dogId: string;
  weightKg: number;
  recordedAt: string;
}

export type SubscriptionStatus =
  | 'trial'
  | 'active'
  | 'paused'
  | 'cancelled'
  | 'expired'
  | 'past_due';

export interface Subscription {
  id: string;
  customerId: string;
  dogId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  nextDeliveryDate: string;
  addressId: string;
  priceSnapshotInr: number;
  couponId: string | null;
  createdAt: string;
  pausedUntil: string | null;
  addonIds: string[];
}

export type OrderStatus =
  | 'planned'
  | 'in_kitchen'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'cancelled';

export interface OrderItem {
  id: string;
  orderId: string;
  itemType: 'plan' | 'addon';
  itemId: string;
  nameSnapshot: string;
  qty: number;
  unitPriceInr: number;
}

export interface AddressSnapshot {
  label: string;
  line1: string;
  line2: string | null;
  area: string;
  city: string;
  pincode: string;
}

export interface Order {
  id: string;
  subscriptionId: string | null;
  customerId: string;
  dogId: string;
  deliveryDate: string;
  status: OrderStatus;
  subtotalInr: number;
  discountInr: number;
  totalInr: number;
  addressSnapshot: AddressSnapshot;
  notes: string | null;
  createdAt: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  /** Present once the simulated checkout has recorded a payment. */
  payment: Payment | null;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  orderId: string;
  customerId: string;
  amountInr: number;
  status: PaymentStatus;
  method: string;
  gatewayRef: string;
  createdAt: string;
}

export type TicketStatus = 'open' | 'in_progress' | 'waiting_on_user' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'normal' | 'high';

export interface SupportTicket {
  id: string;
  customerId: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string | null;
  createdAt: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
}

export interface SupportTicketWithMessages extends SupportTicket {
  messages: SupportMessage[];
  customerName: string;
}

export type VetStatus = 'pending' | 'approved' | 'suspended';

export interface Vet {
  id: string;
  profileId: string;
  clinicName: string;
  city: string;
  licenseNo: string;
  status: VetStatus;
  referralCode: string;
  fullName: string;
  email: string;
}

export type DietPlanStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface DietPlan {
  id: string;
  dogId: string;
  vetId: string;
  recipeIds: string[];
  portionOverrideG: number | null;
  notes: string;
  status: DietPlanStatus;
  approvedAt: string | null;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'flat';
  value: number;
  minOrderInr: number;
  maxRedemptions: number;
  timesRedeemed: number;
  expiresAt: string;
  isActive: boolean;
}

export type RouteStatus = 'draft' | 'in_progress' | 'completed';
export type StopStatus = 'pending' | 'delivered' | 'failed';

export interface RouteRun {
  id: string;
  routeDate: string;
  driverName: string;
  status: RouteStatus;
  notes: string | null;
  areaLabel: string;
}

export interface RouteStop {
  id: string;
  routeRunId: string;
  orderId: string;
  sequence: number;
  status: StopStatus;
  deliveredAt: string | null;
  proofNote: string | null;
}

export interface AuditEntry {
  id: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  meta: Record<string, unknown>;
  createdAt: string;
}

export interface FeatureFlags {
  showDemoBanner: boolean;
  allowNewSignups: boolean;
  waitlistEnabled: boolean;
}

export interface AdminNotes {
  profileId: string;
  note: string;
  updatedAt: string;
}


// ---------------------------------------------------------------------------
// Customer portal (Phase 3)
// ---------------------------------------------------------------------------

/** A subscription joined with everything the customer portal needs to render it. */
export interface SubscriptionWithDetails extends Subscription {
  plan: Plan;
  dog: Dog;
  addons: Addon[];
  address: Address | null;
}

export type DogInput = Omit<Dog, 'id' | 'ownerId' | 'createdAt'>;

export interface AddressInput {
  profileId: string;
  label: string;
  line1: string;
  line2?: string | null;
  area: string;
  city: string;
  pincode: string;
  isDefault?: boolean;
}

export interface CreateSubscriptionInput {
  customerId: string;
  dogId: string;
  planId: string;
  addonIds: string[];
  addressId: string;
  couponCode?: string | null;
  notes?: string | null;
}

export interface CheckoutResult {
  subscription: SubscriptionWithDetails;
  order: OrderWithItems;
  payment: Payment;
}

export interface CouponValidation {
  valid: boolean;
  coupon: Coupon | null;
  discountInr: number;
  message: string;
}

export interface NewTicketInput {
  customerId: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  message: string;
}
