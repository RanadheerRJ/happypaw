import {
  addonFixtures,
  deliveryZoneFixtures,
  planFixtures,
} from '@/config/pricing';
import { recipeFixtures } from '@/data/fixtures/recipes';
import { DEMO_PASSWORD, demoProfiles, demoVets } from '@/data/fixtures/demoUsers';
import type {
  Address,
  AdminNotes,
  Coupon,
  DietPlan,
  Dog,
  DogWeight,
  Order,
  OrderItem,
  Payment,
  Profile,
  RouteRun,
  RouteStop,
  Subscription,
  SupportMessage,
  SupportTicket,
  WeeklyMenu,
  WaitlistEntry,
} from '@/data/types';
import { addDays, currentWeekStart, toIsoDate, upcomingDeliveryDate } from '@/lib/dates';
import { mulberry32, pick, shuffle } from '@/lib/utils';

/** Shape of the mock database. Supabase mirrors this across normalised tables. */
export interface MockDb {
  version: number;
  profiles: Profile[];
  credentials: Record<string, string>;
  addresses: Address[];
  dogs: Dog[];
  dogWeights: DogWeight[];
  plans: typeof planFixtures;
  addons: typeof addonFixtures;
  recipes: typeof recipeFixtures;
  weeklyMenus: WeeklyMenu[];
  deliveryZones: typeof deliveryZoneFixtures;
  subscriptions: Subscription[];
  orders: Order[];
  orderItems: OrderItem[];
  payments: Payment[];
  supportTickets: SupportTicket[];
  supportMessages: SupportMessage[];
  vets: typeof demoVets;
  dietPlans: DietPlan[];
  coupons: Coupon[];
  waitlist: WaitlistEntry[];
  routeRuns: RouteRun[];
  routeStops: RouteStop[];
  adminNotes: AdminNotes[];
  sessionProfileId: string | null;
}

const firstNames = [
  'Ananya', 'Karthik', 'Sneha', 'Vikram', 'Divya', 'Nikhil', 'Meghana', 'Siddharth',
  'Ritika', 'Aarav', 'Pooja', 'Rahul', 'Shreya', 'Tarun', 'Neha', 'Varun',
  'Lavanya', 'Aditya', 'Swati', 'Manoj', 'Anjali', 'Harsha', 'Keerthi', 'Ravi',
  'Bhavana', 'Surya', 'Deepika', 'Eshwar', 'Sravani', 'Kunal', 'Mounika', 'Pranav',
];
const lastNames = [
  'Reddy', 'Sharma', 'Rao', 'Nair', 'Iyer', 'Kulkarni', 'Mehta', 'Chowdhury',
  'Naidu', 'Verma', 'Bhat', 'Kapoor', 'Desai', 'Pillai', 'Shetty', 'Gupta',
];
const dogNames = [
  'Coco', 'Simba', 'Biscuit', 'Momo', 'Bruno', 'Ladoo', 'Pepper', 'Toffee', 'Oreo',
  'Chutney', 'Bella', 'Rocky', 'Muffin', 'Zen', 'Kulfi', 'Rumi', 'Maggie', 'Noodle',
  'Tofu', 'Pumpkin', 'Jalebi', 'Bandit', 'Ginger', 'Luna', 'Bruno', 'Nimbu',
];
const breeds = [
  { breed: 'Indie', weight: 16 },
  { breed: 'Labrador Retriever', weight: 28 },
  { breed: 'Golden Retriever', weight: 30 },
  { breed: 'Beagle', weight: 11 },
  { breed: 'Shih Tzu', weight: 6 },
  { breed: 'German Shepherd', weight: 33 },
  { breed: 'Indian Spitz', weight: 7 },
  { breed: 'Cocker Spaniel', weight: 13 },
  { breed: 'Pomeranian', weight: 4 },
  { breed: 'Rajapalayam', weight: 25 },
];
const addressesAreas = deliveryZoneFixtures.map((zone) => ({
  area: zone.areaName,
  pincode: zone.pincode,
}));
const couponFixtures: Coupon[] = [
  { id: 'coupon-firstpaw', code: 'FIRSTPAW', type: 'percent', value: 15, minOrderInr: 749, maxRedemptions: 500, timesRedeemed: 63, expiresAt: toIsoDate(addDays(new Date(), 45)), isActive: true },
  { id: 'coupon-hyd100', code: 'HYD100', type: 'flat', value: 100, minOrderInr: 999, maxRedemptions: 200, timesRedeemed: 41, expiresAt: toIsoDate(addDays(new Date(), 21)), isActive: true },
  { id: 'coupon-vetlove', code: 'VETLOVE', type: 'percent', value: 10, minOrderInr: 749, maxRedemptions: 100, timesRedeemed: 12, expiresAt: toIsoDate(addDays(new Date(), 90)), isActive: true },
  { id: 'coupon-sunday50', code: 'SUNDAY50', type: 'flat', value: 50, minOrderInr: 749, maxRedemptions: 50, timesRedeemed: 50, expiresAt: toIsoDate(addDays(new Date(), -4)), isActive: false },
];

const today = new Date();
const weekStart = currentWeekStart(today);
const nextDelivery = toIsoDate(upcomingDeliveryDate(today));

export function buildSeedDatabase(): MockDb {
  const random = mulberry32(20251121);

  const profiles: Profile[] = [...demoProfiles];
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
    {
      id: 'addr-arjun',
      profileId: 'user-customer-alt',
      label: 'Home',
      line1: 'Villa 12, My Home Avatar',
      line2: 'Narsingi',
      area: 'Narsingi',
      city: 'Hyderabad',
      pincode: '500089',
      isDefault: true,
    },
  ];

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
    {
      id: 'dog-simba',
      ownerId: 'user-customer-alt',
      name: 'Simba',
      photoUrl: null,
      breed: 'Golden Retriever',
      dob: '2020-11-03',
      weightKg: 31.2,
      bodyCondition: 'ideal',
      activityLevel: 'moderate',
      neutered: true,
      allergies: ['Fish'],
      medicalNotes: 'Mild hip stiffness — vet recommended weight maintenance.',
      currentFood: 'Premium kibble',
      picky: false,
      createdAt: '2025-03-03T11:45:00.000Z',
    },
    {
      id: 'dog-biscuit',
      ownerId: 'user-customer-alt',
      name: 'Biscuit',
      photoUrl: null,
      breed: 'Beagle',
      dob: '2019-08-30',
      weightKg: 14.8,
      bodyCondition: 'overweight',
      activityLevel: 'low',
      neutered: true,
      allergies: [],
      medicalNotes: 'On a weight-management plan; target 13 kg.',
      currentFood: 'Kibble + topper',
      picky: true,
      createdAt: '2025-03-03T11:50:00.000Z',
    },
  ];

  const dogWeights: DogWeight[] = [];
  dogs.forEach((dog, dogIndex) => {
    for (let week = 7; week >= 0; week -= 1) {
      const drift = (random() - 0.5) * 0.5 + (dogIndex % 2 === 0 ? 0.05 : -0.03) * week;
      dogWeights.push({
        id: `weight-${dog.id}-${week}`,
        dogId: dog.id,
        weightKg: Number(Math.max(2, dog.weightKg + drift).toFixed(1)),
        recordedAt: toIsoDate(addDays(today, -week * 7)),
      });
    }
  });

  // ---- generated customers, dogs, subscriptions, orders -------------------
  const generatedProfiles: Profile[] = [];
  const generatedDogs: Dog[] = [];
  const subscriptions: Subscription[] = [];
  const orders: Order[] = [];
  const orderItems: OrderItem[] = [];
  const payments: Payment[] = [];
  const supportTickets: SupportTicket[] = [];
  const supportMessages: SupportMessage[] = [];

  const activePlans = planFixtures.filter((plan) => plan.weightBand !== 'special');

  for (let index = 0; index < 40; index += 1) {
    const id = `user-gen-${index + 1}`;
    const first = firstNames[index % firstNames.length] as string;
    const last = lastNames[(index * 3) % lastNames.length] as string;
    const createdAt = addDays(today, -Math.floor(random() * 120) - 2);
    generatedProfiles.push({
      id,
      role: 'customer',
      fullName: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${index}@example.com`,
      phone: `+9198${String(10000000 + index * 137).slice(0, 8)}`,
      avatarUrl: null,
      createdAt: createdAt.toISOString(),
    });

    const area = addressesAreas[index % addressesAreas.length]!;
    addresses.push({
      id: `addr-gen-${index + 1}`,
      profileId: id,
      label: index % 3 === 0 ? 'Work' : 'Home',
      line1: `${10 + index} ${pick(['Aparna Heights', 'My Home Bhooja', 'Ramky Towers', 'Lodha Bellezza', 'Cyber Heights'], random)}`,
      line2: `Flat ${100 + index}`,
      area: area.area,
      city: 'Hyderabad',
      pincode: area.pincode,
      isDefault: true,
    });

    const breed = breeds[index % breeds.length]!;
    const dogId = `dog-gen-${index + 1}`;
    const dogName = dogNames[index % dogNames.length] as string;
    const weight = Number((breed.weight + (random() - 0.5) * 4).toFixed(1));
    const generatedDog: Dog = {
      id: dogId,
      ownerId: id,
      name: dogName,
      photoUrl: null,
      breed: breed.breed,
      dob: toIsoDate(addDays(today, -Math.floor(random() * 2000 + 400))),
      weightKg: Math.min(46, Math.max(2, weight)),
      bodyCondition: pick(['ideal', 'ideal', 'ideal', 'overweight', 'underweight'], random),
      activityLevel: pick(['low', 'moderate', 'moderate', 'high'], random),
      neutered: random() > 0.3,
      allergies: random() > 0.78 ? [pick(['Chicken', 'Fish', 'Wheat / gluten'], random)] : [],
      medicalNotes: null,
      currentFood: pick(['Kibble', 'Home-cooked', 'Kibble + topper', 'Raw (transitioning)'], random),
      picky: random() > 0.6,
      createdAt: createdAt.toISOString(),
    };
    generatedDogs.push(generatedDog);

    const plan =
      generatedDog.weightKg <= 10
        ? activePlans.find((item) => item.slug === 'weekly-fresh-small')!
        : generatedDog.weightKg <= 25
          ? activePlans.find((item) => item.slug === 'weekly-fresh-medium')!
          : activePlans.find((item) => item.slug === 'weekly-fresh-large')!;

    const status = index % 9 === 0 ? 'paused' : index % 13 === 0 ? 'cancelled' : 'active';
    const subscriptionId = `sub-gen-${index + 1}`;
    subscriptions.push({
      id: subscriptionId,
      customerId: id,
      dogId,
      planId: plan.id,
      status,
      startDate: toIsoDate(addDays(today, -Math.floor(random() * 90) - 7)),
      nextDeliveryDate: toIsoDate(addDays(upcomingDeliveryDate(today), status === 'active' ? 0 : 7)),
      addressId: `addr-gen-${index + 1}`,
      priceSnapshotInr: plan.priceInr,
      couponId: null,
      createdAt: createdAt.toISOString(),
      pausedUntil: status === 'paused' ? toIsoDate(addDays(today, 14)) : null,
      addonIds: random() > 0.7 ? ['addon-treats'] : [],
    });

    if (status === 'active' && index % 2 === 0) {
      const total = plan.priceInr;
      const orderId = `order-gen-${index + 1}`;
      const orderStatus =
        index % 6 === 0 ? 'delivered' : index % 6 === 2 ? 'in_kitchen' : index % 6 === 4 ? 'planned' : 'out_for_delivery';
      orders.push({
        id: orderId,
        subscriptionId,
        customerId: id,
        dogId,
        deliveryDate: orderStatus === 'delivered' ? toIsoDate(addDays(today, -7)) : nextDelivery,
        status: orderStatus,
        subtotalInr: total,
        discountInr: 0,
        totalInr: total,
        addressSnapshot: {
          label: 'Home',
          line1: `Flat ${100 + index}`,
          line2: null,
          area: area.area,
          city: 'Hyderabad',
          pincode: area.pincode,
        },
        notes: null,
        createdAt: createdAt.toISOString(),
      });
      orderItems.push({
        id: `item-gen-${index + 1}`,
        orderId,
        itemType: 'plan',
        itemId: plan.id,
        nameSnapshot: plan.name,
        qty: 1,
        unitPriceInr: plan.priceInr,
      });
      payments.push({
        id: `payment-gen-${index + 1}`,
        orderId,
        customerId: id,
        amountInr: total,
        status: index % 7 === 0 ? 'refunded' : 'simulated',
        method: 'Simulated checkout',
        gatewayRef: `sim_${orderId}`,
        createdAt: createdAt.toISOString(),
      });
    }
  }

  // ---- demo customer orders & subscriptions (rich, hand-written) ----------
  const demoSubscriptions: Subscription[] = [
    {
      id: 'sub-coco',
      customerId: 'user-customer',
      dogId: 'dog-coco',
      planId: 'plan-weekly-medium',
      status: 'active',
      startDate: toIsoDate(addDays(today, -35)),
      nextDeliveryDate: nextDelivery,
      addressId: 'addr-priya',
      priceSnapshotInr: 1099,
      couponId: null,
      createdAt: addDays(today, -35).toISOString(),
      pausedUntil: null,
      addonIds: ['addon-salmon-oil'],
    },
    {
      id: 'sub-momo',
      customerId: 'user-customer',
      dogId: 'dog-momo',
      planId: 'plan-weekly-small',
      status: 'paused',
      startDate: toIsoDate(addDays(today, -56)),
      nextDeliveryDate: toIsoDate(addDays(upcomingDeliveryDate(today), 14)),
      addressId: 'addr-priya',
      priceSnapshotInr: 749,
      couponId: 'coupon-firstpaw',
      createdAt: addDays(today, -56).toISOString(),
      pausedUntil: toIsoDate(addDays(today, 12)),
      addonIds: [],
    },
    {
      id: 'sub-simba',
      customerId: 'user-customer-alt',
      dogId: 'dog-simba',
      planId: 'plan-monthly-large',
      status: 'active',
      startDate: toIsoDate(addDays(today, -21)),
      nextDeliveryDate: nextDelivery,
      addressId: 'addr-arjun',
      priceSnapshotInr: 5396,
      couponId: null,
      createdAt: addDays(today, -21).toISOString(),
      pausedUntil: null,
      addonIds: ['addon-treats'],
    },
    {
      id: 'sub-biscuit',
      customerId: 'user-customer-alt',
      dogId: 'dog-biscuit',
      planId: 'plan-topper',
      status: 'cancelled',
      startDate: toIsoDate(addDays(today, -90)),
      nextDeliveryDate: toIsoDate(addDays(today, -10)),
      addressId: 'addr-arjun',
      priceSnapshotInr: 349,
      couponId: null,
      createdAt: addDays(today, -90).toISOString(),
      pausedUntil: null,
      addonIds: [],
    },
  ];
  subscriptions.unshift(...demoSubscriptions);

  const demoOrders: Order[] = [
    {
      id: 'order-coco-current',
      subscriptionId: 'sub-coco',
      customerId: 'user-customer',
      dogId: 'dog-coco',
      deliveryDate: nextDelivery,
      status: 'planned',
      subtotalInr: 1099,
      discountInr: 0,
      totalInr: 1099,
      addressSnapshot: { label: 'Home', line1: 'Flat 402, Aparna Cyber Life', line2: 'Nallagandla Main Road', area: 'Gachibowli', city: 'Hyderabad', pincode: '500032' },
      notes: 'Leave at the door if we do not answer.',
      createdAt: addDays(today, -2).toISOString(),
    },
    {
      id: 'order-coco-last',
      subscriptionId: 'sub-coco',
      customerId: 'user-customer',
      dogId: 'dog-coco',
      deliveryDate: toIsoDate(addDays(today, -7)),
      status: 'delivered',
      subtotalInr: 1099,
      discountInr: 165,
      totalInr: 934,
      addressSnapshot: { label: 'Home', line1: 'Flat 402, Aparna Cyber Life', line2: 'Nallagandla Main Road', area: 'Gachibowli', city: 'Hyderabad', pincode: '500032' },
      notes: null,
      createdAt: addDays(today, -9).toISOString(),
    },
    {
      id: 'order-momo-last',
      subscriptionId: 'sub-momo',
      customerId: 'user-customer',
      dogId: 'dog-momo',
      deliveryDate: toIsoDate(addDays(today, -14)),
      status: 'delivered',
      subtotalInr: 749,
      discountInr: 0,
      totalInr: 749,
      addressSnapshot: { label: 'Home', line1: 'Flat 402, Aparna Cyber Life', line2: 'Nallagandla Main Road', area: 'Gachibowli', city: 'Hyderabad', pincode: '500032' },
      notes: null,
      createdAt: addDays(today, -16).toISOString(),
    },
    {
      id: 'order-simba-current',
      subscriptionId: 'sub-simba',
      customerId: 'user-customer-alt',
      dogId: 'dog-simba',
      deliveryDate: nextDelivery,
      status: 'in_kitchen',
      subtotalInr: 1499,
      discountInr: 0,
      totalInr: 1499,
      addressSnapshot: { label: 'Home', line1: 'Villa 12, My Home Avatar', line2: 'Narsingi', area: 'Narsingi', city: 'Hyderabad', pincode: '500089' },
      notes: 'Ring the bell twice.',
      createdAt: addDays(today, -1).toISOString(),
    },
  ];
  orders.unshift(...demoOrders);

  const demoOrderItems: OrderItem[] = [
    { id: 'item-coco-1', orderId: 'order-coco-current', itemType: 'plan', itemId: 'plan-weekly-medium', nameSnapshot: 'Weekly Fresh — Medium', qty: 1, unitPriceInr: 1099 },
    { id: 'item-coco-2', orderId: 'order-coco-last', itemType: 'plan', itemId: 'plan-weekly-medium', nameSnapshot: 'Weekly Fresh — Medium', qty: 1, unitPriceInr: 1099 },
    { id: 'item-momo-1', orderId: 'order-momo-last', itemType: 'plan', itemId: 'plan-weekly-small', nameSnapshot: 'Weekly Fresh — Small', qty: 1, unitPriceInr: 749 },
    { id: 'item-simba-1', orderId: 'order-simba-current', itemType: 'plan', itemId: 'plan-monthly-large', nameSnapshot: 'Monthly Fresh — Large', qty: 1, unitPriceInr: 1499 },
    { id: 'item-simba-2', orderId: 'order-simba-current', itemType: 'addon', itemId: 'addon-treats', nameSnapshot: 'Dehydrated treats', qty: 1, unitPriceInr: 0 },
  ];
  orderItems.unshift(...demoOrderItems);

  payments.push(
    { id: 'payment-coco-1', orderId: 'order-coco-current', customerId: 'user-customer', amountInr: 1099, status: 'simulated', method: 'Simulated checkout', gatewayRef: 'sim_order_coco_current', createdAt: addDays(today, -2).toISOString() },
    { id: 'payment-coco-2', orderId: 'order-coco-last', customerId: 'user-customer', amountInr: 934, status: 'simulated', method: 'Simulated checkout', gatewayRef: 'sim_order_coco_last', createdAt: addDays(today, -9).toISOString() },
    { id: 'payment-simba-1', orderId: 'order-simba-current', customerId: 'user-customer-alt', amountInr: 1499, status: 'simulated', method: 'Simulated checkout', gatewayRef: 'sim_order_simba_current', createdAt: addDays(today, -1).toISOString() },
  );

  const demoSupport: SupportTicket[] = [
    { id: 'ticket-1', customerId: 'user-customer', subject: 'Delivery arrived later than the window', category: 'Delivery', priority: 'normal', status: 'resolved', assignedTo: 'user-admin', createdAt: addDays(today, -10).toISOString() },
    { id: 'ticket-2', customerId: 'user-customer', subject: 'Coco is leaving a little food in the bowl', category: 'Food & portions', priority: 'normal', status: 'in_progress', assignedTo: 'user-admin', createdAt: addDays(today, -3).toISOString() },
    { id: 'ticket-3', customerId: 'user-customer-alt', subject: 'Invoice for my last order', category: 'Billing', priority: 'low', status: 'open', assignedTo: null, createdAt: addDays(today, -1).toISOString() },
    { id: 'ticket-4', customerId: 'user-customer-alt', subject: 'Allergy question about the fish recipe', category: 'Food & portions', priority: 'high', status: 'open', assignedTo: null, createdAt: addDays(today, -2).toISOString() },
    { id: 'ticket-5', customerId: 'user-gen-5', subject: 'Can I pause for two weeks?', category: 'Subscription', priority: 'normal', status: 'in_progress', assignedTo: 'user-admin', createdAt: addDays(today, -4).toISOString() },
    { id: 'ticket-6', customerId: 'user-gen-11', subject: 'Portion size for a very active indie', category: 'Food & portions', priority: 'normal', status: 'closed', assignedTo: 'user-vet', createdAt: addDays(today, -18).toISOString() },
  ];
  supportTickets.push(...demoSupport);
  supportMessages.push(
    { id: 'msg-1', ticketId: 'ticket-1', senderId: 'user-customer', body: 'Hi team, the delivery came around 1 PM instead of the 7–12 window. Not a big deal, but letting you know.', isInternal: false, createdAt: addDays(today, -10).toISOString() },
    { id: 'msg-2', ticketId: 'ticket-1', senderId: 'user-admin', body: 'Thanks for flagging, Priya. Our driver was held up by a road closure in Gachibowli. We have noted your route for an earlier slot next Sunday.', isInternal: false, createdAt: addDays(today, -10).toISOString() },
    { id: 'msg-3', ticketId: 'ticket-1', senderId: 'user-admin', body: 'Internal: route G2 driver changed to Suresh from next week.', isInternal: true, createdAt: addDays(today, -9).toISOString() },
    { id: 'msg-4', ticketId: 'ticket-2', senderId: 'user-customer', body: 'She eats most of it but leaves the spinach behind. Should I warm it slightly?', isInternal: false, createdAt: addDays(today, -3).toISOString() },
    { id: 'msg-5', ticketId: 'ticket-2', senderId: 'user-admin', body: 'Warming to room temperature is perfect. We can also swap in the Chicken & Rice (Sensitive) recipe for a week to see if that helps.', isInternal: false, createdAt: addDays(today, -2).toISOString() },
    { id: 'msg-6', ticketId: 'ticket-3', senderId: 'user-customer-alt', body: 'Could you email me a GST invoice for the order delivered last Sunday?', isInternal: false, createdAt: addDays(today, -1).toISOString() },
    { id: 'msg-7', ticketId: 'ticket-4', senderId: 'user-customer-alt', body: 'Our vet suspects a fish sensitivity. Can we switch to the chicken recipe from next week?', isInternal: false, createdAt: addDays(today, -2).toISOString() },
    { id: 'msg-8', ticketId: 'ticket-5', senderId: 'user-gen-5', body: 'We are travelling from the 12th to the 26th. Could you pause the subscription and resume after?', isInternal: false, createdAt: addDays(today, -4).toISOString() },
    { id: 'msg-9', ticketId: 'ticket-6', senderId: 'user-gen-11', body: 'He is 18 kg, runs twice a day, and still seems hungry after meals. Is the portion right?', isInternal: false, createdAt: addDays(today, -18).toISOString() },
    { id: 'msg-10', ticketId: 'ticket-6', senderId: 'user-vet', body: 'Try adding 10% to the portion and re-weigh in two weeks. If weight is stable, keep it.', isInternal: false, createdAt: addDays(today, -17).toISOString() },
  );

  const dietPlans: DietPlan[] = [
    {
      id: 'diet-1',
      dogId: 'dog-coco',
      vetId: 'user-vet',
      recipeIds: ['recipe-chicken-rice-sensitive', 'recipe-fish-rice'],
      portionOverrideG: 260,
      notes: 'Chicken sensitivity — avoid the chicken & pumpkin bowl. Split into two meals.',
      status: 'approved',
      approvedAt: addDays(today, -20).toISOString(),
      createdAt: addDays(today, -24).toISOString(),
    },
    {
      id: 'diet-2',
      dogId: 'dog-simba',
      vetId: 'user-vet',
      recipeIds: ['recipe-lamb-sweet-potato'],
      portionOverrideG: 420,
      notes: 'Weight maintenance for hip support. Keep treats under 10% of intake.',
      status: 'approved',
      approvedAt: addDays(today, -12).toISOString(),
      createdAt: addDays(today, -14).toISOString(),
    },
    {
      id: 'diet-3',
      dogId: 'dog-biscuit',
      vetId: 'user-vet',
      recipeIds: ['recipe-chicken-rice-sensitive'],
      portionOverrideG: 190,
      notes: 'Weight management: target 13 kg. Recheck in 4 weeks.',
      status: 'pending',
      approvedAt: null,
      createdAt: addDays(today, -2).toISOString(),
    },
    {
      id: 'diet-4',
      dogId: 'dog-momo',
      vetId: 'user-vet',
      recipeIds: ['recipe-fish-rice', 'recipe-chicken-rice-sensitive'],
      portionOverrideG: 120,
      notes: 'Small breed, low activity. Watch for tear staining.',
      status: 'draft',
      approvedAt: null,
      createdAt: addDays(today, -1).toISOString(),
    },
    {
      id: 'diet-5',
      dogId: 'dog-gen-3',
      vetId: 'user-vet',
      recipeIds: ['recipe-lamb-sweet-potato'],
      portionOverrideG: 300,
      notes: 'Owner reports itchy skin; trial lamb only for 3 weeks.',
      status: 'rejected',
      approvedAt: null,
      createdAt: addDays(today, -8).toISOString(),
    },
  ];

  // ---- delivery routes for the upcoming Sunday ---------------------------
  const upcomingStr = nextDelivery;
  const routeRuns: RouteRun[] = [
    { id: 'route-1', routeDate: upcomingStr, driverName: 'Suresh Kumar', status: 'draft', notes: 'West zone — start at 7 AM', areaLabel: 'Gachibowli · Narsingi' },
    { id: 'route-2', routeDate: upcomingStr, driverName: 'Imran Ali', status: 'draft', notes: 'Central zone', areaLabel: 'Jubilee Hills · Banjara Hills' },
    { id: 'route-3', routeDate: toIsoDate(addDays(today, -7)), driverName: 'Suresh Kumar', status: 'completed', notes: null, areaLabel: 'Madhapur · Kondapur' },
  ];
  const deliverableOrders = orders.filter((order) => order.deliveryDate === upcomingStr).slice(0, 8);
  const routeStops: RouteStop[] = deliverableOrders.map((order, index) => ({
    id: `stop-${index + 1}`,
    routeRunId: index < 4 ? 'route-1' : 'route-2',
    orderId: order.id,
    sequence: index < 4 ? index + 1 : index - 3,
    status: 'pending',
    deliveredAt: null,
    proofNote: null,
  }));

  const weeklyMenus: WeeklyMenu[] = [
    {
      id: 'menu-current',
      weekStart: toIsoDate(weekStart),
      recipeIds: shuffle(recipeFixtures.map((recipe) => recipe.id), mulberry32(7)).slice(0, 3),
      isPublished: true,
      publishedAt: addDays(weekStart, -3).toISOString(),
    },
    {
      id: 'menu-next',
      weekStart: toIsoDate(addDays(weekStart, 7)),
      recipeIds: ['recipe-chicken-pumpkin', 'recipe-fish-rice', 'recipe-lamb-sweet-potato'],
      isPublished: true,
      publishedAt: addDays(today, -1).toISOString(),
    },
  ];

  return {
    version: 1,
    profiles: [...profiles, ...generatedProfiles],
    credentials: Object.fromEntries(demoProfiles.map((profile) => [profile.email, DEMO_PASSWORD])),
    addresses,
    dogs: [...dogs, ...generatedDogs],
    dogWeights,
    plans: planFixtures,
    addons: addonFixtures,
    recipes: recipeFixtures,
    weeklyMenus,
    deliveryZones: deliveryZoneFixtures,
    subscriptions,
    orders,
    orderItems,
    payments,
    supportTickets,
    supportMessages,
    vets: demoVets,
    dietPlans,
    coupons: couponFixtures,
    waitlist: [
      { id: 'waitlist-1', email: 'shruti@example.com', pincode: '500090', createdAt: addDays(today, -6).toISOString() },
    ],
    routeRuns,
    routeStops,
    adminNotes: [
      { profileId: 'user-customer', note: 'VIP — referred by Dr. Meera. Prefers WhatsApp updates.', updatedAt: addDays(today, -5).toISOString() },
    ],
    sessionProfileId: null,
  };
}
