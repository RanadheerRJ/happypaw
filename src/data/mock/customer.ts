import { DataError } from '@/data/client';
import type {
  AddressApi,
  CouponApi,
  DogApi,
  OrderApi,
  SettingsApi,
  SubscriptionApi,
  SupportApi,
} from '@/data/client';
import type { MockDb } from '@/data/fixtures/seed';
import { loadDb, mutate, newId, simulateNetwork } from '@/data/mock/db';
import type {
  Address,
  AddressSnapshot,
  Coupon,
  CouponValidation,
  CreateSubscriptionInput,
  DietPlan,
  Dog,
  DogInput,
  DogWeight,
  NotificationPrefs,
  Order,
  OrderItem,
  OrderWithItems,
  Payment,
  Profile,
  SimulatedCheckoutResult,
  Subscription,
  SubscriptionWithDetails,
  SupportMessage,
  SupportTicket,
  SupportTicketWithMessages,
} from '@/data/types';
import { addDays, toIsoDate, upcomingDeliveryDate } from '@/lib/dates';
import { estimateDailyPortionG } from '@/lib/validators';

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function snapshotAddress(address: Address | null): AddressSnapshot {
  if (!address) {
    return {
      label: 'Home',
      line1: 'Address on file',
      line2: null,
      area: 'Hyderabad',
      city: 'Hyderabad',
      pincode: '500000',
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

function addonTotal(db: MockDb, addonIds: string[]): number {
  return addonIds.reduce((sum, id) => {
    const addon = db.addons.find((item) => item.id === id && item.isActive);
    return sum + (addon?.priceInr ?? 0);
  }, 0);
}

function discountFor(db: MockDb, couponId: string | null, subtotal: number): number {
  if (!couponId) return 0;
  const coupon = db.coupons.find((item) => item.id === couponId);
  if (!coupon) return 0;
  const raw = coupon.type === 'percent' ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  return Math.min(raw, subtotal);
}

function subscriptionSubtotal(db: MockDb, subscription: Subscription): number {
  const plan = db.plans.find((item) => item.id === subscription.planId);
  return (plan?.priceInr ?? subscription.priceSnapshotInr) + addonTotal(db, subscription.addonIds);
}

function itemsForSubscription(db: MockDb, subscription: Subscription): Omit<OrderItem, 'orderId'>[] {
  const plan = db.plans.find((item) => item.id === subscription.planId);
  const items: Omit<OrderItem, 'orderId'>[] = [];
  if (plan) {
    items.push({
      id: newId('item'),
      itemType: 'plan',
      itemId: plan.id,
      nameSnapshot: plan.name,
      qty: 1,
      unitPriceInr: plan.priceInr,
    });
  }
  for (const addonId of subscription.addonIds) {
    const addon = db.addons.find((item) => item.id === addonId);
    if (addon) {
      items.push({
        id: newId('item'),
        itemType: 'addon',
        itemId: addon.id,
        nameSnapshot: addon.name,
        qty: 1,
        unitPriceInr: addon.priceInr,
      });
    }
  }
  return items;
}

function withDetails(db: MockDb, subscription: Subscription): SubscriptionWithDetails {
  const plan = db.plans.find((item) => item.id === subscription.planId);
  const dog = db.dogs.find((item) => item.id === subscription.dogId);
  if (!plan || !dog) {
    throw new DataError('Subscription is missing its plan or dog.', 'corrupt_subscription');
  }
  return {
    ...subscription,
    plan,
    dog,
    addons: subscription.addonIds
      .map((id) => db.addons.find((addon) => addon.id === id))
      .filter((addon): addon is NonNullable<typeof addon> => Boolean(addon)),
    address: db.addresses.find((address) => address.id === subscription.addressId) ?? null,
  };
}

function orderWithItems(db: MockDb, order: Order): OrderWithItems {
  return {
    ...order,
    items: db.orderItems.filter((item) => item.orderId === order.id),
    payment: db.payments.find((payment) => payment.orderId === order.id) ?? null,
  };
}

/** Build a fresh "planned" order for a subscription (used on resume/plan changes). */
function buildPlannedOrder(
  db: MockDb,
  subscription: Subscription,
  deliveryDate: string,
  notes: string | null,
): Order {
  const subtotal = subscriptionSubtotal(db, subscription);
  const discount = discountFor(db, subscription.couponId, subtotal);
  const order: Order = {
    id: newId('order'),
    subscriptionId: subscription.id,
    customerId: subscription.customerId,
    dogId: subscription.dogId,
    deliveryDate,
    status: 'planned',
    subtotalInr: subtotal,
    discountInr: discount,
    totalInr: subtotal - discount,
    addressSnapshot: snapshotAddress(
      db.addresses.find((address) => address.id === subscription.addressId) ?? null,
    ),
    notes,
    createdAt: new Date().toISOString(),
  };
  db.orders.push(order);
  for (const item of itemsForSubscription(db, subscription)) {
    db.orderItems.push({ ...item, orderId: order.id });
  }
  return order;
}

/** Re-price the next planned order after a plan/add-on/coupon change. */
function refreshPlannedOrder(db: MockDb, subscription: Subscription): void {
  const planned = db.orders.find(
    (order) => order.subscriptionId === subscription.id && order.status === 'planned',
  );
  if (!planned) return;
  planned.subtotalInr = subscriptionSubtotal(db, subscription);
  planned.discountInr = discountFor(db, subscription.couponId, planned.subtotalInr);
  planned.totalInr = planned.subtotalInr - planned.discountInr;
  planned.addressSnapshot = snapshotAddress(
    db.addresses.find((address) => address.id === subscription.addressId) ?? null,
  );
  db.orderItems = db.orderItems.filter((item) => item.orderId !== planned.id);
  for (const item of itemsForSubscription(db, subscription)) {
    db.orderItems.push({ ...item, orderId: planned.id });
  }
}

function cancelPlannedOrders(db: MockDb, subscriptionId: string, note: string): void {
  for (const order of db.orders) {
    if (order.subscriptionId === subscriptionId && order.status === 'planned') {
      order.status = 'cancelled';
      order.notes = note;
    }
  }
}

function requireSubscription(db: MockDb, subscriptionId: string): Subscription {
  const subscription = db.subscriptions.find((item) => item.id === subscriptionId);
  if (!subscription) throw new DataError('Subscription not found.', 'not_found');
  return subscription;
}

function ticketWithMessages(db: MockDb, ticket: SupportTicket): SupportTicketWithMessages {
  const customer = db.profiles.find((profile) => profile.id === ticket.customerId);
  return {
    ...ticket,
    customerName: customer?.fullName ?? 'Customer',
    messages: db.supportMessages
      .filter((message) => message.ticketId === ticket.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  };
}

// ---------------------------------------------------------------------------
// dogs
// ---------------------------------------------------------------------------

export const mockDogs: DogApi = {
  async list(ownerId) {
    await simulateNetwork();
    return loadDb()
      .dogs.filter((dog) => dog.ownerId === ownerId)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((dog) => ({ ...dog }));
  },

  async get(dogId) {
    await simulateNetwork(120, 260);
    const dog = loadDb().dogs.find((item) => item.id === dogId);
    return dog ? { ...dog } : null;
  },

  async create(input: DogInput & { ownerId: string }) {
    await simulateNetwork();
    const dog: Dog = {
      ...input,
      id: newId('dog'),
      ownerId: input.ownerId,
      createdAt: new Date().toISOString(),
    };
    mutate((db) => {
      db.dogs.push(dog);
      db.dogWeights.push({
        id: newId('weight'),
        dogId: dog.id,
        weightKg: dog.weightKg,
        recordedAt: toIsoDate(new Date()),
      });

      /* A suggested plan goes straight to the vet queue, exactly like sign-up. */
      const dailyG = estimateDailyPortionG(dog.weightKg, dog.activityLevel);
      const recipes = db.recipes
        .filter((recipe) => !dog.allergies.some((allergy) => recipe.name.toLowerCase().includes(allergy.toLowerCase())))
        .slice(0, 2);
      db.dietPlans.push({
        id: newId('diet'),
        dogId: dog.id,
        vetId: 'user-vet',
        recipeIds: recipes.map((recipe) => recipe.id),
        portionOverrideG: null,
        notes: `Suggested portion ${dailyG} g per day, split across ${2} meals. Pending veterinary-nutritionist review.`,
        status: 'pending',
        approvedAt: null,
        createdAt: new Date().toISOString(),
      });
    });
    return dog;
  },

  async update(dogId, patch) {
    await simulateNetwork();
    return mutate((db) => {
      const dog = db.dogs.find((item) => item.id === dogId);
      if (!dog) throw new DataError('Dog not found.', 'not_found');
      Object.assign(dog, patch);
      return { ...dog };
    });
  },

  async listWeights(dogId) {
    await simulateNetwork(120, 260);
    return loadDb()
      .dogWeights.filter((entry) => entry.dogId === dogId)
      .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
      .map((entry) => ({ ...entry }));
  },

  async addWeight(dogId, weightKg) {
    await simulateNetwork();
    const entry: DogWeight = {
      id: newId('weight'),
      dogId,
      weightKg: Number(weightKg.toFixed(1)),
      recordedAt: toIsoDate(new Date()),
    };
    mutate((db) => {
      const dog = db.dogs.find((item) => item.id === dogId);
      if (!dog) throw new DataError('Dog not found.', 'not_found');
      db.dogWeights.push(entry);
      dog.weightKg = entry.weightKg;
    });
    return entry;
  },

  async getDietPlan(dogId) {
    await simulateNetwork(120, 260);
    const plans = loadDb()
      .dietPlans.filter((plan) => plan.dogId === dogId && plan.status !== 'rejected')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return (plans[0] as DietPlan | undefined) ?? null;
  },
};

// ---------------------------------------------------------------------------
// addresses
// ---------------------------------------------------------------------------

export const mockAddresses: AddressApi = {
  async list(profileId) {
    await simulateNetwork(120, 260);
    return loadDb()
      .addresses.filter((address) => address.profileId === profileId)
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
      .map((address) => ({ ...address }));
  },

  async create(input) {
    await simulateNetwork();
    return mutate((db) => {
      const existing = db.addresses.filter((address) => address.profileId === input.profileId);
      const shouldDefault = input.isDefault ?? existing.length === 0;
      if (shouldDefault) {
        existing.forEach((address) => {
          address.isDefault = false;
        });
      }
      const address: Address = {
        id: newId('addr'),
        profileId: input.profileId,
        label: input.label,
        line1: input.line1,
        line2: input.line2 ?? null,
        area: input.area,
        city: input.city,
        pincode: input.pincode,
        isDefault: shouldDefault,
      };
      db.addresses.push(address);
      return { ...address };
    });
  },

  async update(addressId, patch) {
    await simulateNetwork();
    return mutate((db) => {
      const address = db.addresses.find((item) => item.id === addressId);
      if (!address) throw new DataError('Address not found.', 'not_found');
      Object.assign(address, patch);
      return { ...address };
    });
  },

  async setDefault(profileId, addressId) {
    await simulateNetwork();
    return mutate((db) => {
      db.addresses
        .filter((address) => address.profileId === profileId)
        .forEach((address) => {
          address.isDefault = address.id === addressId;
        });
      return db.addresses.filter((address) => address.profileId === profileId).map((a) => ({ ...a }));
    });
  },
};

// ---------------------------------------------------------------------------
// coupons
// ---------------------------------------------------------------------------

export const mockCoupons: CouponApi = {
  async validate(code, orderValueInr): Promise<CouponValidation> {
    await simulateNetwork(200, 380);
    const normalised = code.trim().toUpperCase();
    if (!normalised) {
      return { valid: false, coupon: null, discountInr: 0, message: 'Enter a coupon code.' };
    }
    const db = loadDb();
    const coupon = db.coupons.find((item) => item.code.toUpperCase() === normalised);
    if (!coupon) {
      return { valid: false, coupon: null, discountInr: 0, message: 'That code is not valid.' };
    }
    if (!coupon.isActive) {
      return { valid: false, coupon, discountInr: 0, message: 'That code is no longer active.' };
    }
    if (new Date(coupon.expiresAt) < new Date(toIsoDate(new Date()))) {
      return { valid: false, coupon, discountInr: 0, message: 'That code has expired.' };
    }
    if (coupon.timesRedeemed >= coupon.maxRedemptions) {
      return { valid: false, coupon, discountInr: 0, message: 'That code has been fully redeemed.' };
    }
    if (orderValueInr < coupon.minOrderInr) {
      return {
        valid: false,
        coupon,
        discountInr: 0,
        message: `Minimum order for this code is ₹${coupon.minOrderInr.toLocaleString('en-IN')}.`,
      };
    }
    const discountInr =
      coupon.type === 'percent'
        ? Math.round((orderValueInr * coupon.value) / 100)
        : Math.min(coupon.value, orderValueInr);
    return {
      valid: true,
      coupon,
      discountInr,
      message:
        coupon.type === 'percent'
          ? `${coupon.value}% off applied — you save ₹${discountInr.toLocaleString('en-IN')}.`
          : `₹${discountInr.toLocaleString('en-IN')} off applied.`,
    };
  },
};

// ---------------------------------------------------------------------------
// subscriptions
// ---------------------------------------------------------------------------

export const mockSubscriptions: SubscriptionApi = {
  async list(customerId) {
    await simulateNetwork();
    const db = loadDb();
    return db.subscriptions
      .filter((subscription) => subscription.customerId === customerId)
      .map((subscription) => withDetails(db, subscription));
  },

  async get(subscriptionId) {
    await simulateNetwork(120, 260);
    const db = loadDb();
    const subscription = db.subscriptions.find((item) => item.id === subscriptionId);
    return subscription ? withDetails(db, subscription) : null;
  },

  async create(input: CreateSubscriptionInput): Promise<SimulatedCheckoutResult> {
    await simulateNetwork(400, 800);
    const db = loadDb();
    const dog = db.dogs.find((item) => item.id === input.dogId);
    const plan = db.plans.find((item) => item.id === input.planId);
    const address = db.addresses.find((item) => item.id === input.addressId);
    if (!dog || dog.ownerId !== input.customerId) throw new DataError('Dog not found.', 'not_found');
    if (!plan) throw new DataError('Plan not found.', 'not_found');
    if (!address) throw new DataError('Delivery address not found.', 'not_found');

    const coupon = input.couponCode
      ? db.coupons.find(
          (item) => item.code.toUpperCase() === input.couponCode?.trim().toUpperCase() && item.isActive,
        )
      : null;

    const subtotal = plan.priceInr + addonTotal(db, input.addonIds);
    const discount = coupon ? discountFor(db, coupon.id, subtotal) : 0;
    const deliveryDate = toIsoDate(upcomingDeliveryDate(new Date()));
    const now = new Date().toISOString();

    const subscription: Subscription = {
      id: newId('sub'),
      customerId: input.customerId,
      dogId: dog.id,
      planId: plan.id,
      status: 'active',
      startDate: toIsoDate(new Date()),
      nextDeliveryDate: deliveryDate,
      addressId: address.id,
      priceSnapshotInr: plan.priceInr,
      couponId: coupon?.id ?? null,
      createdAt: now,
      pausedUntil: null,
      addonIds: [...input.addonIds],
    };

    const order: Order = {
      id: newId('order'),
      subscriptionId: subscription.id,
      customerId: input.customerId,
      dogId: dog.id,
      deliveryDate,
      status: 'planned',
      subtotalInr: subtotal,
      discountInr: discount,
      totalInr: subtotal - discount,
      addressSnapshot: snapshotAddress(address),
      notes: input.notes ?? null,
      createdAt: now,
    };

    const items: OrderItem[] = itemsForSubscription(db, subscription).map((item) => ({
      ...item,
      orderId: order.id,
    }));

    const payment: Payment = {
      id: newId('payment'),
      orderId: order.id,
      customerId: input.customerId,
      amountInr: order.totalInr,
      status: 'simulated',
      method: 'Simulated checkout',
      gatewayRef: `sim_${newId('pay')}`,
      createdAt: now,
    };

    mutate((next) => {
      next.subscriptions.push(subscription);
      next.orders.push(order);
      next.orderItems.push(...items);
      next.payments.push(payment);
      if (coupon) {
        const stored = next.coupons.find((item) => item.id === coupon.id);
        if (stored) stored.timesRedeemed += 1;
      }
    });

    const fresh = loadDb();
    const stored = fresh.subscriptions.find((item) => item.id === subscription.id)!;
    return {
      subscription: withDetails(fresh, stored),
      order: orderWithItems(fresh, order),
      payment,
    };
  },

  async pause(subscriptionId, untilIso) {
    await simulateNetwork();
    return mutate((db) => {
      const subscription = requireSubscription(db, subscriptionId);
      if (subscription.status === 'cancelled') {
        throw new DataError('Cancelled subscriptions cannot be paused.', 'invalid_state');
      }
      subscription.status = 'paused';
      subscription.pausedUntil = untilIso;
      subscription.nextDeliveryDate = toIsoDate(upcomingDeliveryDate(new Date(untilIso)));
      cancelPlannedOrders(db, subscription.id, `Paused until ${untilIso}`);
      return withDetails(db, subscription);
    });
  },

  async resume(subscriptionId) {
    await simulateNetwork();
    return mutate((db) => {
      const subscription = requireSubscription(db, subscriptionId);
      if (subscription.status === 'cancelled') {
        throw new DataError('Cancelled subscriptions cannot be resumed.', 'invalid_state');
      }
      subscription.status = 'active';
      subscription.pausedUntil = null;
      subscription.nextDeliveryDate = toIsoDate(upcomingDeliveryDate(new Date()));
      const hasPlanned = db.orders.some(
        (order) =>
          order.subscriptionId === subscription.id &&
          order.status === 'planned' &&
          order.deliveryDate === subscription.nextDeliveryDate,
      );
      if (!hasPlanned) {
        buildPlannedOrder(db, subscription, subscription.nextDeliveryDate, null);
      }
      return withDetails(db, subscription);
    });
  },

  async skipNext(subscriptionId) {
    await simulateNetwork();
    return mutate((db) => {
      const subscription = requireSubscription(db, subscriptionId);
      if (subscription.status !== 'active') {
        throw new DataError('Only active subscriptions can skip a delivery.', 'invalid_state');
      }
      const previousDate = subscription.nextDeliveryDate;
      const nextDate = toIsoDate(addDays(new Date(`${previousDate}T00:00:00`), 7));
      subscription.nextDeliveryDate = nextDate;
      for (const order of db.orders) {
        if (
          order.subscriptionId === subscription.id &&
          order.deliveryDate === previousDate &&
          order.status === 'planned'
        ) {
          order.deliveryDate = nextDate;
          order.notes = `Skipped ${previousDate} — moved to ${nextDate}`;
        }
      }
      return withDetails(db, subscription);
    });
  },

  async cancel(subscriptionId, reason) {
    await simulateNetwork();
    return mutate((db) => {
      const subscription = requireSubscription(db, subscriptionId);
      subscription.status = 'cancelled';
      subscription.pausedUntil = null;
      cancelPlannedOrders(
        db,
        subscription.id,
        reason ? `Cancelled: ${reason}` : 'Subscription cancelled by customer',
      );
      return withDetails(db, subscription);
    });
  },

  async changePlan(subscriptionId, planId) {
    await simulateNetwork();
    return mutate((db) => {
      const subscription = requireSubscription(db, subscriptionId);
      const plan = db.plans.find((item) => item.id === planId && item.isActive);
      if (!plan) throw new DataError('Plan not found.', 'not_found');
      subscription.planId = plan.id;
      subscription.priceSnapshotInr = plan.priceInr;
      refreshPlannedOrder(db, subscription);
      return withDetails(db, subscription);
    });
  },

  async updateAddons(subscriptionId, addonIds) {
    await simulateNetwork();
    return mutate((db) => {
      const subscription = requireSubscription(db, subscriptionId);
      subscription.addonIds = addonIds.filter((id) =>
        db.addons.some((addon) => addon.id === id && addon.isActive),
      );
      refreshPlannedOrder(db, subscription);
      return withDetails(db, subscription);
    });
  },

  async updateAddress(subscriptionId, addressId) {
    await simulateNetwork();
    return mutate((db) => {
      const subscription = requireSubscription(db, subscriptionId);
      const address = db.addresses.find((item) => item.id === addressId);
      if (!address) throw new DataError('Address not found.', 'not_found');
      subscription.addressId = address.id;
      refreshPlannedOrder(db, subscription);
      return withDetails(db, subscription);
    });
  },
};

// ---------------------------------------------------------------------------
// orders
// ---------------------------------------------------------------------------

export const mockOrders: OrderApi = {
  async list(customerId) {
    await simulateNetwork();
    const db = loadDb();
    return db.orders
      .filter((order) => order.customerId === customerId)
      .sort((a, b) => b.deliveryDate.localeCompare(a.deliveryDate))
      .map((order) => orderWithItems(db, order));
  },

  async get(orderId) {
    await simulateNetwork(150, 300);
    const db = loadDb();
    const order = db.orders.find((item) => item.id === orderId);
    return order ? orderWithItems(db, order) : null;
  },
};

// ---------------------------------------------------------------------------
// support
// ---------------------------------------------------------------------------

export const mockSupport: SupportApi = {
  async list(customerId) {
    await simulateNetwork();
    const db = loadDb();
    return db.supportTickets
      .filter((ticket) => ticket.customerId === customerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((ticket) => ticketWithMessages(db, ticket));
  },

  async get(ticketId) {
    await simulateNetwork(150, 300);
    const db = loadDb();
    const ticket = db.supportTickets.find((item) => item.id === ticketId);
    return ticket ? ticketWithMessages(db, ticket) : null;
  },

  async create(input) {
    await simulateNetwork();
    const now = new Date().toISOString();
    const ticket: SupportTicket = {
      id: newId('ticket'),
      customerId: input.customerId,
      subject: input.subject,
      category: input.category,
      priority: input.priority,
      status: 'open',
      assignedTo: null,
      createdAt: now,
    };
    const message: SupportMessage = {
      id: newId('msg'),
      ticketId: ticket.id,
      senderId: input.customerId,
      body: input.message,
      isInternal: false,
      createdAt: now,
    };
    /* A canned acknowledgement keeps the demo thread realistic. */
    const acknowledgement: SupportMessage = {
      id: newId('msg'),
      ticketId: ticket.id,
      senderId: 'user-admin',
      body: 'Thanks for writing in — a member of the Happy Paw team will reply here shortly. If this is about an upcoming delivery, mention the delivery date so we can check the route.',
      isInternal: false,
      createdAt: now,
    };
    ticket.status = 'in_progress';
    mutate((db) => {
      db.supportTickets.push(ticket);
      db.supportMessages.push(message, acknowledgement);
    });
    return { ...ticket, customerName: 'You', messages: [message, acknowledgement] };
  },

  async reply(ticketId, senderId, body) {
    await simulateNetwork(200, 380);
    return mutate((db) => {
      const ticket = db.supportTickets.find((item) => item.id === ticketId);
      if (!ticket) throw new DataError('Ticket not found.', 'not_found');
      const message: SupportMessage = {
        id: newId('msg'),
        ticketId,
        senderId,
        body: body.trim(),
        isInternal: false,
        createdAt: new Date().toISOString(),
      };
      db.supportMessages.push(message);
      if (ticket.status === 'resolved' || ticket.status === 'closed') {
        ticket.status = 'open';
      }
      return ticketWithMessages(db, ticket);
    });
  },
};

// ---------------------------------------------------------------------------
// settings
// ---------------------------------------------------------------------------

const defaultPrefs = (profileId: string): NotificationPrefs => ({
  profileId,
  orderUpdates: true,
  deliveryReminders: true,
  offers: false,
  whatsapp: true,
});

export const mockSettings: SettingsApi = {
  async getNotificationPrefs(profileId) {
    await simulateNetwork(100, 220);
    const db = loadDb();
    return db.notificationPrefs.find((prefs) => prefs.profileId === profileId) ?? defaultPrefs(profileId);
  },

  async updateNotificationPrefs(profileId, patch) {
    await simulateNetwork();
    return mutate((db) => {
      let prefs = db.notificationPrefs.find((item) => item.profileId === profileId);
      if (!prefs) {
        prefs = defaultPrefs(profileId);
        db.notificationPrefs.push(prefs);
      }
      Object.assign(prefs, patch);
      return { ...prefs };
    });
  },

  async changePassword(profileId, currentPassword, nextPassword) {
    await simulateNetwork();
    const db = loadDb();
    const profile = db.profiles.find((item) => item.id === profileId) as Profile | undefined;
    if (!profile) throw new DataError('Profile not found.', 'not_found');
    const expected = db.credentials[profile.email] ?? 'Demo@1234';
    if (currentPassword !== expected) {
      throw new DataError('Your current password is not correct.', 'invalid_credentials');
    }
    mutate((next) => {
      next.credentials[profile.email] = nextPassword;
    });
  },

  async deleteAccount(profileId) {
    await simulateNetwork(300, 600);
    mutate((db) => {
      const profile = db.profiles.find((item) => item.id === profileId);
      if (!profile) throw new DataError('Profile not found.', 'not_found');
      profile.deletedAt = new Date().toISOString();
      if (db.sessionProfileId === profileId) db.sessionProfileId = null;
    });
  },
};

/** Used by the auth adapter to reject soft-deleted accounts. */
export function isAccountDeleted(profile: Profile): boolean {
  return Boolean(profile.deletedAt);
}

export type { Coupon };
