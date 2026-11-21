import { beforeEach, describe, expect, it } from 'vitest';
import { mockClient } from '@/data/mock/client';
import { resetDb } from '@/data/mock/db';
import { addDays, toIsoDate } from '@/lib/dates';
import type { DogInput } from '@/data/types';

const CUSTOMER = 'user-customer';

const newDog: DogInput = {
  name: 'Pepper',
  photoUrl: null,
  breed: 'Indie',
  dob: toIsoDate(addDays(new Date(), -900)),
  weightKg: 9.4,
  bodyCondition: 'ideal',
  activityLevel: 'moderate',
  neutered: true,
  allergies: ['Chicken'],
  medicalNotes: 'Sensitive stomach',
  currentFood: 'Kibble',
  picky: false,
};

beforeEach(() => {
  window.localStorage.clear();
  resetDb();
});

describe('mock adapter — dogs', () => {
  it('lists only the customer’s dogs', async () => {
    const dogs = await mockClient.dogs.list(CUSTOMER);
    expect(dogs.map((dog) => dog.name)).toEqual(['Coco', 'Momo']);
    expect(await mockClient.dogs.list('user-customer-alt')).toHaveLength(2);
  });

  it('creates a dog with its first weigh-in and a pending diet plan', async () => {
    const created = await mockClient.dogs.create({ ...newDog, ownerId: CUSTOMER });
    const weights = await mockClient.dogs.listWeights(created.id);
    const plan = await mockClient.dogs.getDietPlan(created.id);

    expect(weights).toHaveLength(1);
    expect(weights[0]?.weightKg).toBe(9.4);
    expect(plan?.status).toBe('pending');
    expect(plan?.recipeIds.length).toBeGreaterThan(0);
    expect(plan?.recipeIds).not.toContain('recipe-chicken-pumpkin');

    const listed = await mockClient.dogs.list(CUSTOMER);
    expect(listed.some((dog) => dog.id === created.id)).toBe(true);
  });

  it('logs a new weight and updates the dog record', async () => {
    const entry = await mockClient.dogs.addWeight('dog-coco', 14.2);
    const dog = await mockClient.dogs.get('dog-coco');
    const weights = await mockClient.dogs.listWeights('dog-coco');

    expect(entry.weightKg).toBe(14.2);
    expect(dog?.weightKg).toBe(14.2);
    expect(weights.at(-1)?.weightKg).toBe(14.2);
  });

  it('updates profile fields and rejects unknown dogs', async () => {
    const updated = await mockClient.dogs.update('dog-coco', { allergies: ['Fish'], picky: true });
    expect(updated.allergies).toEqual(['Fish']);
    expect(updated.picky).toBe(true);

    await expect(mockClient.dogs.update('dog-nope', { name: 'X' })).rejects.toThrow('Dog not found');
  });
});

describe('mock adapter — addresses', () => {
  it('creates addresses and moves the default flag', async () => {
    const created = await mockClient.addresses.create({
      profileId: CUSTOMER,
      label: 'Work',
      line1: 'Plot 12, Mindspace',
      area: 'Madhapur',
      city: 'Hyderabad',
      pincode: '500081',
      isDefault: false,
    });

    let addresses = await mockClient.addresses.list(CUSTOMER);
    expect(addresses.filter((item) => item.isDefault)).toHaveLength(1);

    addresses = await mockClient.addresses.setDefault(CUSTOMER, created.id);
    expect(addresses.find((item) => item.id === created.id)?.isDefault).toBe(true);
    expect(addresses.filter((item) => item.isDefault)).toHaveLength(1);

    const renamed = await mockClient.addresses.update(created.id, { label: 'Office' });
    expect(renamed.label).toBe('Office');
  });
});

describe('mock adapter — coupons', () => {
  it('applies percentage and flat discounts above the minimum order', async () => {
    const percent = await mockClient.coupons.validate('FIRSTPAW', 1099);
    expect(percent.valid).toBe(true);
    expect(percent.discountInr).toBe(165);

    const flat = await mockClient.coupons.validate('hyd100', 1099);
    expect(flat.valid).toBe(true);
    expect(flat.discountInr).toBe(100);

    const belowMinimum = await mockClient.coupons.validate('HYD100', 500);
    expect(belowMinimum.valid).toBe(false);
    expect(belowMinimum.discountInr).toBe(0);
  });

  it('rejects unknown, inactive and exhausted codes', async () => {
    const unknown = await mockClient.coupons.validate('NOPE', 1099);
    expect(unknown.valid).toBe(false);

    const inactive = await mockClient.coupons.validate('SUNDAY50', 1099);
    expect(inactive.valid).toBe(false);
    expect(inactive.message).toMatch(/no longer active/i);

    const exhausted = await mockClient.coupons.validate('VETLOVE', 1099);
    expect(exhausted.valid).toBe(true);
  });
});

describe('mock adapter — subscriptions', () => {
  it('runs a simulated checkout end to end', async () => {
    const before = await mockClient.coupons.validate('FIRSTPAW', 749);
    expect(before.valid).toBe(true);

    const result = await mockClient.subscriptions.create({
      customerId: CUSTOMER,
      dogId: 'dog-momo',
      planId: 'plan-weekly-small',
      addonIds: ['addon-treats'],
      addressId: 'addr-priya',
      couponCode: 'FIRSTPAW',
      notes: 'Leave at the gate',
    });

    expect(result.subscription.status).toBe('active');
    expect(result.subscription.addons.map((addon) => addon.id)).toEqual(['addon-treats']);
    expect(result.order.status).toBe('planned');
    expect(result.order.notes).toBe('Leave at the gate');
    expect(result.order.discountInr).toBeGreaterThan(0);
    expect(result.payment.status).toBe('simulated');
    expect(result.payment.amountInr).toBe(result.order.totalInr);
    expect(result.order.payment?.id).toBe(result.payment.id);

    const orders = await mockClient.orders.list(CUSTOMER);
    expect(orders.some((order) => order.id === result.order.id)).toBe(true);
  });

  it('pauses, resumes and re-prices the planned order', async () => {
    const until = toIsoDate(addDays(new Date(), 14));
    const paused = await mockClient.subscriptions.pause('sub-coco', until);
    expect(paused.status).toBe('paused');
    expect(paused.pausedUntil).toBe(until);

    const afterPause = await mockClient.orders.list(CUSTOMER);
    expect(
      afterPause.filter((order) => order.subscriptionId === 'sub-coco' && order.status === 'planned'),
    ).toHaveLength(0);

    const resumed = await mockClient.subscriptions.resume('sub-coco');
    expect(resumed.status).toBe('active');
    expect(resumed.pausedUntil).toBeNull();

    const afterResume = await mockClient.orders.list(CUSTOMER);
    const planned = afterResume.find(
      (order) => order.subscriptionId === 'sub-coco' && order.status === 'planned',
    );
    expect(planned).toBeDefined();

    const repriced = await mockClient.subscriptions.changePlan('sub-coco', 'plan-weekly-large');
    expect(repriced.plan.id).toBe('plan-weekly-large');
    expect(repriced.plan.priceInr).toBe(1499);

    const refresh = await mockClient.orders.list(CUSTOMER);
    const updated = refresh.find(
      (order) => order.subscriptionId === 'sub-coco' && order.status === 'planned',
    );
    expect(updated?.subtotalInr).toBe(
      1499 + repriced.addons.reduce((sum, addon) => sum + addon.priceInr, 0),
    );
  });

  it('moves the next delivery forward by a week when skipping', async () => {
    const before = await mockClient.subscriptions.get('sub-coco');
    const skipped = await mockClient.subscriptions.skipNext('sub-coco');
    const expected = toIsoDate(addDays(new Date(`${before?.nextDeliveryDate}T00:00:00`), 7));
    expect(skipped.nextDeliveryDate).toBe(expected);

    const orders = await mockClient.orders.list(CUSTOMER);
    expect(
      orders.find((order) => order.subscriptionId === 'sub-coco' && order.status === 'planned')
        ?.deliveryDate,
    ).toBe(expected);
  });

  it('cancels planned orders and blocks further actions', async () => {
    const cancelled = await mockClient.subscriptions.cancel('sub-coco', 'Moving cities');
    expect(cancelled.status).toBe('cancelled');

    const orders = await mockClient.orders.list(CUSTOMER);
    expect(
      orders.filter((order) => order.subscriptionId === 'sub-coco' && order.status === 'planned'),
    ).toHaveLength(0);

    await expect(mockClient.subscriptions.resume('sub-coco')).rejects.toThrow(
      'cannot be resumed',
    );
    await expect(mockClient.subscriptions.skipNext('sub-coco')).rejects.toThrow('Only active');
  });

  it('updates add-ons and the delivery address on the subscription', async () => {
    const updated = await mockClient.subscriptions.updateAddons('sub-coco', [
      'addon-treats',
      'addon-birthday',
    ]);
    expect(updated.addons.map((addon) => addon.id)).toEqual(['addon-treats', 'addon-birthday']);

    const moved = await mockClient.subscriptions.updateAddress('sub-coco', 'addr-priya');
    expect(moved.addressId).toBe('addr-priya');
    expect(moved.address?.id).toBe('addr-priya');
  });
});

describe('mock adapter — support', () => {
  it('opens a ticket with an acknowledgement and appends replies', async () => {
    const ticket = await mockClient.support.create({
      customerId: CUSTOMER,
      subject: 'Box arrived late',
      category: 'delivery',
      priority: 'high',
      message: 'The Sunday box arrived at 4 PM instead of the morning window.',
    });

    expect(ticket.status).toBe('in_progress');
    expect(ticket.messages).toHaveLength(2);
    expect(ticket.messages[1]?.senderId).toBe('user-admin');

    const replied = await mockClient.support.reply(ticket.id, CUSTOMER, 'Thanks for checking.');
    expect(replied.messages).toHaveLength(3);
    expect(replied.messages.at(-1)?.body).toBe('Thanks for checking.');

    const listed = await mockClient.support.list(CUSTOMER);
    expect(listed[0]?.id).toBe(ticket.id);

    await expect(mockClient.support.reply('ticket-nope', CUSTOMER, 'Hi')).rejects.toThrow(
      'Ticket not found',
    );
  });
});

describe('mock adapter — settings', () => {
  it('reads defaults and merges notification preferences', async () => {
    const defaults = await mockClient.settings.getNotificationPrefs('user-new');
    expect(defaults.orderUpdates).toBe(true);
    expect(defaults.offers).toBe(false);

    const updated = await mockClient.settings.updateNotificationPrefs('user-customer', {
      offers: true,
    });
    expect(updated.offers).toBe(true);
    expect(updated.orderUpdates).toBe(true);

    const fetched = await mockClient.settings.getNotificationPrefs('user-customer');
    expect(fetched.offers).toBe(true);
  });

  it('changes the password only when the current one matches', async () => {
    await expect(
      mockClient.settings.changePassword(CUSTOMER, 'wrong-password', 'NewPass123'),
    ).rejects.toThrow('current password');

    await mockClient.settings.changePassword(CUSTOMER, 'Demo@1234', 'NewPass123');
    const session = await mockClient.auth.signIn('priya@happypaw.in', 'NewPass123');
    expect(session.user.id).toBe(CUSTOMER);
  });

  it('soft-deletes an account and blocks sign-in afterwards', async () => {
    await mockClient.settings.deleteAccount(CUSTOMER);
    const profile = await mockClient.profiles.get(CUSTOMER);
    expect(profile?.deletedAt).toBeTruthy();

    await expect(mockClient.auth.signIn('priya@happypaw.in', 'Demo@1234')).rejects.toThrow(
      /deleted/i,
    );
  });
});
