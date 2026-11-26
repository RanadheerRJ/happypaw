import { estimateDailyPortionG, recommendedWeightBand } from '@/lib/validators';
import type {
  Addon,
  Dog,
  Order,
  OrderStatus,
  Plan,
  Subscription,
  SubscriptionStatus,
  TicketStatus,
} from '@/data/types';

/** Daily portion for a dog, split across two meals. */
export function dailyPortion(dog: Pick<Dog, 'weightKg' | 'activityLevel'>): {
  totalG: number;
  perMealG: number;
} {
  const totalG = estimateDailyPortionG(dog.weightKg, dog.activityLevel);
  return { totalG, perMealG: Math.round(totalG / 2 / 10) * 10 };
}

/** The plan band a dog should be on, given its current weight. */
export function recommendedBand(dog: Pick<Dog, 'weightKg'>) {
  return recommendedWeightBand(dog.weightKg);
}

export function recommendedPlan(plans: Plan[], dog: Pick<Dog, 'weightKg'>): Plan | undefined {
  const band = recommendedBand(dog);
  return plans
    .filter((plan) => plan.isActive && plan.weightBand === band && plan.durationDays === 7)
    .sort((a, b) => a.sortOrder - b.sortOrder)[0];
}

export function subscriptionTotal(plan: Plan, addons: Addon[]): number {
  return plan.priceInr + addons.reduce((sum, addon) => sum + addon.priceInr, 0);
}

export function invoiceNumber(order: Pick<Order, 'id' | 'deliveryDate'>): string {
  const year = new Date(`${order.deliveryDate}T00:00:00`).getFullYear();
  const suffix = order.id.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();
  return `HP/${year}/${suffix}`;
}

export const orderTimeline: OrderStatus[] = [
  'planned',
  'in_kitchen',
  'out_for_delivery',
  'delivered',
];

export function orderStep(status: OrderStatus): number {
  return orderTimeline.indexOf(status);
}

export const orderStatusMeta: Record<
  OrderStatus,
  { label: string; tone: 'neutral' | 'soft' | 'warn' | 'accent' | 'success' | 'danger' }
> = {
  planned: { label: 'Planned', tone: 'soft' },
  in_kitchen: { label: 'In the kitchen', tone: 'warn' },
  out_for_delivery: { label: 'Out for delivery', tone: 'accent' },
  delivered: { label: 'Delivered', tone: 'success' },
  failed: { label: 'Delivery failed', tone: 'danger' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

export const subscriptionStatusMeta: Record<
  SubscriptionStatus,
  { label: string; tone: 'success' | 'warn' | 'neutral' | 'danger' }
> = {
  active: { label: 'Active', tone: 'success' },
  paused: { label: 'Paused', tone: 'warn' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
  past_due: { label: 'Payment due', tone: 'danger' },
  trial: { label: 'Trial', tone: 'warn' },
  expired: { label: 'Expired', tone: 'neutral' },
};

export const ticketStatusMeta: Record<
  TicketStatus,
  { label: string; tone: 'warn' | 'accent' | 'success' | 'neutral' }
> = {
  open: { label: 'Open', tone: 'warn' },
  in_progress: { label: 'In progress', tone: 'accent' },
  resolved: { label: 'Resolved', tone: 'success' },
  closed: { label: 'Closed', tone: 'neutral' },
  waiting_on_user: { label: 'Waiting on you', tone: 'accent' },
};

export function dogAgeLabel(dob: string): string {
  const birth = new Date(`${dob}T00:00:00`);
  const now = new Date();
  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) return 'Newborn';
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} old`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (rest === 0) return `${years} ${years === 1 ? 'year' : 'years'} old`;
  return `${years}y ${rest}m old`;
}

export function subscriptionWeeksRemaining(subscription: Subscription): number {
  if (subscription.status !== 'active') return 0;
  return Math.max(0, Math.ceil((new Date(subscription.nextDeliveryDate).getTime() - Date.now()) / (7 * 86_400_000)) + 1);
}

/** Chart-friendly weight series (oldest → newest). */
export function weightSeries(
  entries: { weightKg: number; recordedAt: string }[],
): { date: string; weight: number }[] {
  return [...entries]
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
    .map((entry) => ({ date: entry.recordedAt, weight: entry.weightKg }));
}

export function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}
