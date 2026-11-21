import { beforeEach, describe, expect, it } from 'vitest';
import { mockClient } from '@/data/mock/client';
import { MOCK_DB_KEY, loadDb, resetDb } from '@/data/mock/db';
import { demoAccounts } from '@/data/fixtures/demoUsers';

describe('mock data adapter — catalog', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetDb();
  });

  it('returns active plans in sort order', async () => {
    const plans = await mockClient.catalog.listPlans();
    expect(plans.length).toBeGreaterThanOrEqual(9);
    expect(plans.every((plan) => plan.isActive)).toBe(true);
    const orders = plans.map((plan) => plan.sortOrder);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it('includes inactive plans only when asked', async () => {
    const db = loadDb();
    const plan = db.plans[0]!;
    plan.isActive = false;
    window.localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db));

    const active = await mockClient.catalog.listPlans();
    expect(active.find((item) => item.id === plan.id)).toBeUndefined();

    const all = await mockClient.catalog.listPlans({ includeInactive: true });
    expect(all.find((item) => item.id === plan.id)).toBeDefined();
  });

  it('finds a plan by slug and returns null for an unknown slug', async () => {
    const plan = await mockClient.catalog.getPlanBySlug('weekly-fresh-medium');
    expect(plan?.priceInr).toBe(1099);
    expect(await mockClient.catalog.getPlanBySlug('does-not-exist')).toBeNull();
  });

  it('returns the current published weekly menu with three recipes', async () => {
    const menu = await mockClient.catalog.getWeeklyMenu();
    expect(menu).not.toBeNull();
    expect(menu?.isPublished).toBe(true);
    expect(menu?.recipes).toHaveLength(3);
    expect(menu?.recipes[0]?.ingredients.length).toBeGreaterThan(0);
  });

  it('checks pincodes against active delivery zones', async () => {
    const served = await mockClient.catalog.checkPincode('500081');
    expect(served.served).toBe(true);
    expect(served.areas.map((area) => area.areaName)).toEqual(
      expect.arrayContaining(['Madhapur', 'HITEC City']),
    );

    const unserved = await mockClient.catalog.checkPincode('500090');
    expect(unserved.served).toBe(false);
    expect(unserved.areas).toHaveLength(0);
  });

  it('strips formatting from pincodes before matching', async () => {
    const result = await mockClient.catalog.checkPincode('500 032');
    expect(result.pincode).toBe('500032');
    expect(result.areas.length).toBeGreaterThan(0);
  });
});

describe('mock data adapter — waitlist', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetDb();
  });

  it('adds an entry and de-duplicates by email + pincode', async () => {
    const before = loadDb().waitlist.length;
    await mockClient.waitlist.join({ email: 'New@Example.com ', pincode: '500090' });
    await mockClient.waitlist.join({ email: 'new@example.com', pincode: '500090' });
    const db = loadDb();
    expect(db.waitlist.length).toBe(before + 1);
    expect(db.waitlist.at(-1)?.email).toBe('new@example.com');
  });

  it('persists entries to localStorage', async () => {
    await mockClient.waitlist.join({ email: 'persist@example.com', pincode: '500081' });
    const raw = window.localStorage.getItem(MOCK_DB_KEY);
    expect(raw).toContain('persist@example.com');
  });
});

describe('mock data adapter — auth', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    resetDb();
    await mockClient.auth.signOut();
  });

  it('starts with no session', async () => {
    expect(await mockClient.auth.getSession()).toBeNull();
  });

  it('signs in a seeded account and persists the session', async () => {
    const session = await mockClient.auth.signIn(
      demoAccounts.customer.email,
      demoAccounts.customer.password,
    );
    expect(session.user.role).toBe('customer');
    expect(session.mode).toBe('mock');

    const restored = await mockClient.auth.getSession();
    expect(restored?.user.email).toBe(demoAccounts.customer.email);
  });

  it('rejects a wrong password and unknown email', async () => {
    await expect(
      mockClient.auth.signIn(demoAccounts.customer.email, 'wrong-password'),
    ).rejects.toThrow(/password/i);
    await expect(mockClient.auth.signIn('nobody@example.com', 'Demo@1234')).rejects.toThrow(
      /no account/i,
    );
  });

  it('signs in demo roles without a password', async () => {
    const vet = await mockClient.auth.signInAsDemo('vet');
    expect(vet.user.role).toBe('vet');

    const admin = await mockClient.auth.signInAsDemo('admin');
    expect(admin.user.role).toBe('admin');
  });

  it('creates a customer on signup and rejects duplicate emails', async () => {
    const session = await mockClient.auth.signUp({
      fullName: 'Test Person',
      email: 'test@example.com',
      phone: '9876543210',
      password: 'Demo@1234',
    });
    expect(session.user.role).toBe('customer');
    expect(loadDb().profiles.find((profile) => profile.email === 'test@example.com')?.phone).toBe(
      '+919876543210',
    );

    await expect(
      mockClient.auth.signUp({
        fullName: 'Test Person',
        email: 'test@example.com',
        phone: '9876543210',
        password: 'Demo@1234',
      }),
    ).rejects.toThrow(/already exists/i);
  });

  it('clears the session on sign out', async () => {
    await mockClient.auth.signInAsDemo('customer');
    await mockClient.auth.signOut();
    expect(await mockClient.auth.getSession()).toBeNull();
  });
});

describe('mock data adapter — reset', () => {
  it('restores seeded fixtures', async () => {
    await mockClient.catalog.listPlans();
    const db = loadDb();
    db.waitlist.push({ id: 'x', email: 'x@example.com', pincode: '500001', createdAt: new Date().toISOString() });
    window.localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db));

    await mockClient.demo.reset();
    expect(loadDb().waitlist.some((entry) => entry.id === 'x')).toBe(false);
  });
});
