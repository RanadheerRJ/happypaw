import type { Plan, Addon, DeliveryZone } from '@/data/types';

/**
 * Pricing, subscription mechanics and marketing copy that depends on numbers.
 * The plan list below seeds both the mock fixture DB and the Supabase seed SQL.
 */

export const CURRENCY_SYMBOL = '₹';

export const deliverySchedule = {
  orderCutoffWeekday: 'Thursday',
  orderCutoffTime: '11:59 PM',
  deliveryWeekday: 'Sunday',
  deliveryWindow: '7 AM – 12 PM',
  summary: 'Order by Thursday 11:59 PM for Sunday delivery, 7 AM – 12 PM.',
  cutoffSummary: 'Order by Thu 11:59 PM · Delivered Sun, 7 AM – 12 PM',
} as const;

export const planFixtures: Plan[] = [
  {
    id: 'plan-trial',
    slug: 'starter-trial-box',
    name: 'Starter Trial Box',
    weightBand: 'small',
    durationDays: 3,
    mealsPerDay: 2,
    priceInr: 299,
    compareAtInr: 420,
    description:
      'Three days of gently cooked meals so your dog can try real food before you commit. One per household.',
    features: ['3 days of meals', '2 meals per day', 'One per household', 'Intro offer'],
    isActive: true,
    sortOrder: 1,
    badge: 'New here?',
    perDayLabel: '~₹100/day',
  },
  {
    id: 'plan-weekly-small',
    slug: 'weekly-fresh-small',
    name: 'Weekly Fresh — Small',
    weightBand: 'small',
    durationDays: 7,
    mealsPerDay: 2,
    priceInr: 749,
    compareAtInr: null,
    description:
      'For dogs up to 10 kg. Portioned by weight and activity, cooked this week, delivered Sunday.',
    features: ['Dogs up to 10 kg', '2 meals/day', 'Free delivery in-zone', 'Pause or skip anytime'],
    isActive: true,
    sortOrder: 2,
    badge: 'Most popular',
    perDayLabel: '~₹107/day',
  },
  {
    id: 'plan-weekly-medium',
    slug: 'weekly-fresh-medium',
    name: 'Weekly Fresh — Medium',
    weightBand: 'medium',
    durationDays: 7,
    mealsPerDay: 2,
    priceInr: 1099,
    compareAtInr: null,
    description:
      'For dogs between 10 and 25 kg. A full week of portioned, gently cooked meals delivered to your door.',
    features: ['Dogs 10–25 kg', '2 meals/day', 'Free delivery in-zone', 'Pause or skip anytime'],
    isActive: true,
    sortOrder: 3,
    badge: null,
    perDayLabel: '~₹157/day',
  },
  {
    id: 'plan-weekly-large',
    slug: 'weekly-fresh-large',
    name: 'Weekly Fresh — Large',
    weightBand: 'large',
    durationDays: 7,
    mealsPerDay: 2,
    priceInr: 1499,
    compareAtInr: null,
    description:
      'For dogs between 25 and 40 kg. Bigger portions, same weekly freshness, delivered in our Hyderabad zones.',
    features: ['Dogs 25–40 kg', '2 meals/day', 'Free delivery in-zone', 'Pause or skip anytime'],
    isActive: true,
    sortOrder: 4,
    badge: null,
    perDayLabel: '~₹214/day',
  },
  {
    id: 'plan-monthly-small',
    slug: 'monthly-fresh-small',
    name: 'Monthly Fresh — Small',
    weightBand: 'small',
    durationDays: 28,
    mealsPerDay: 2,
    priceInr: 2696,
    compareAtInr: 2996,
    description:
      'Four weeks prepaid for dogs up to 10 kg — 10% less than paying weekly, with priority delivery slots.',
    features: ['28 days of meals', '10% savings', 'Priority Sunday slot', 'Free delivery in-zone'],
    isActive: true,
    sortOrder: 5,
    badge: 'Best value',
    perDayLabel: '~₹96/day',
  },
  {
    id: 'plan-monthly-medium',
    slug: 'monthly-fresh-medium',
    name: 'Monthly Fresh — Medium',
    weightBand: 'medium',
    durationDays: 28,
    mealsPerDay: 2,
    priceInr: 3956,
    compareAtInr: 4396,
    description:
      'Four weeks prepaid for dogs between 10 and 25 kg. Best value for steadily growing appetites.',
    features: ['28 days of meals', '10% savings', 'Priority Sunday slot', 'Free delivery in-zone'],
    isActive: true,
    sortOrder: 6,
    badge: 'Best value',
    perDayLabel: '~₹141/day',
  },
  {
    id: 'plan-monthly-large',
    slug: 'monthly-fresh-large',
    name: 'Monthly Fresh — Large',
    weightBand: 'large',
    durationDays: 28,
    mealsPerDay: 2,
    priceInr: 5396,
    compareAtInr: 5996,
    description:
      'Four weeks prepaid for dogs between 25 and 40 kg — 10% less than weekly, delivered every Sunday.',
    features: ['28 days of meals', '10% savings', 'Priority Sunday slot', 'Free delivery in-zone'],
    isActive: true,
    sortOrder: 7,
    badge: 'Best value',
    perDayLabel: '~₹193/day',
  },
  {
    id: 'plan-topper',
    slug: 'fresh-topper',
    name: 'Fresh Topper',
    weightBand: 'topper',
    durationDays: 7,
    mealsPerDay: 1,
    priceInr: 349,
    compareAtInr: null,
    description:
      'A week of fresh topper to mix into your existing food. A gentle upgrade, no full switch required.',
    features: ['7 days of topper', 'Mix into current food', 'Great for picky eaters', 'Free delivery in-zone'],
    isActive: true,
    sortOrder: 8,
    badge: null,
    perDayLabel: '~₹50/day',
  },
  {
    id: 'plan-special',
    slug: 'special-diet',
    name: 'Special Diet',
    weightBand: 'special',
    durationDays: 7,
    mealsPerDay: 2,
    priceInr: 1299,
    compareAtInr: null,
    description:
      'Therapeutic-style recipes built with your vet for allergies, kidney support or weight management. Requires a vet consult.',
    features: ['Custom recipe', 'Vet consult included', 'Weekly review', 'Portion override by your vet'],
    isActive: true,
    sortOrder: 9,
    badge: 'Vet consult',
    perDayLabel: 'from ₹1,299/week',
  },
];

export const addonFixtures: Addon[] = [
  {
    id: 'addon-treats',
    name: 'Dehydrated treats',
    priceInr: 199,
    description: 'Single-ingredient chicken or fish treats, dehydrated slowly. 80 g pouch.',
    isActive: true,
  },
  {
    id: 'addon-salmon-oil',
    name: 'Salmon oil',
    priceInr: 299,
    description: 'Cold-pressed salmon oil for skin and coat. 100 ml bottle with pump.',
    isActive: true,
  },
  {
    id: 'addon-birthday',
    name: 'Birthday box',
    priceInr: 499,
    description: 'A dog-safe cake, a bandana and a treat tin. Add it to any delivery week.',
    isActive: true,
  },
  {
    id: 'addon-puppy-kit',
    name: 'Puppy starter kit',
    priceInr: 399,
    description: 'Slow-feeder bowl, transition schedule card and a 3-day trial pack.',
    isActive: true,
  },
];

export const deliveryZoneFixtures: DeliveryZone[] = [
  { id: 'zone-madhapur', areaName: 'Madhapur', pincode: '500081', city: 'Hyderabad', isActive: true, deliveryDays: ['Sunday'] },
  { id: 'zone-gachibowli', areaName: 'Gachibowli', pincode: '500032', city: 'Hyderabad', isActive: true, deliveryDays: ['Sunday'] },
  { id: 'zone-kondapur', areaName: 'Kondapur', pincode: '500084', city: 'Hyderabad', isActive: true, deliveryDays: ['Sunday'] },
  { id: 'zone-hitec', areaName: 'HITEC City', pincode: '500081', city: 'Hyderabad', isActive: true, deliveryDays: ['Sunday'] },
  { id: 'zone-jubilee-hills', areaName: 'Jubilee Hills', pincode: '500033', city: 'Hyderabad', isActive: true, deliveryDays: ['Sunday'] },
  { id: 'zone-banjara-hills', areaName: 'Banjara Hills', pincode: '500034', city: 'Hyderabad', isActive: true, deliveryDays: ['Sunday'] },
  { id: 'zone-kukatpally', areaName: 'Kukatpally', pincode: '500072', city: 'Hyderabad', isActive: true, deliveryDays: ['Sunday'] },
  { id: 'zone-narsingi', areaName: 'Narsingi', pincode: '500089', city: 'Hyderabad', isActive: true, deliveryDays: ['Sunday'] },
  { id: 'zone-financial-district', areaName: 'Financial District', pincode: '500032', city: 'Hyderabad', isActive: true, deliveryDays: ['Sunday'] },
  { id: 'zone-manikonda', areaName: 'Manikonda', pincode: '500089', city: 'Hyderabad', isActive: true, deliveryDays: ['Sunday'] },
];

export const servingNotes = {
  transition:
    'Transition over 5–7 days: start with 25% fresh and 75% of the old food, then shift the ratio every two days.',
  storage: 'Keep sealed in the fridge for up to 4 days, or freeze portions for up to 30 days.',
  delivery: 'Delivered chilled in insulated bags with ice packs, every Sunday between 7 AM and 12 PM.',
} as const;

/** Per-day price used across pricing UI — rounded to the nearest rupee. */
export function perDayPrice(priceInr: number, durationDays: number): number {
  if (durationDays <= 0) return 0;
  return Math.round(priceInr / durationDays);
}

/** Savings against the weekly equivalent, for the monthly plans. */
export function savingsPercent(plan: Pick<Plan, 'priceInr' | 'compareAtInr'>): number | null {
  if (!plan.compareAtInr || plan.compareAtInr <= plan.priceInr) return null;
  return Math.round(((plan.compareAtInr - plan.priceInr) / plan.compareAtInr) * 100);
}
