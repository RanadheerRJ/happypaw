import { describe, expect, it } from 'vitest';
import {
  addonFixtures,
  deliveryZoneFixtures,
  perDayPrice,
  planFixtures,
  savingsPercent,
} from '@/config/pricing';

describe('pricing fixtures', () => {
  it('contains the published plan prices', () => {
    const bySlug = Object.fromEntries(planFixtures.map((plan) => [plan.slug, plan]));
    expect(bySlug['starter-trial-box']?.priceInr).toBe(299);
    expect(bySlug['weekly-fresh-small']?.priceInr).toBe(749);
    expect(bySlug['weekly-fresh-medium']?.priceInr).toBe(1099);
    expect(bySlug['weekly-fresh-large']?.priceInr).toBe(1499);
    expect(bySlug['monthly-fresh-small']?.priceInr).toBe(2696);
    expect(bySlug['monthly-fresh-medium']?.priceInr).toBe(3956);
    expect(bySlug['monthly-fresh-large']?.priceInr).toBe(5396);
    expect(bySlug['fresh-topper']?.priceInr).toBe(349);
    expect(bySlug['special-diet']?.priceInr).toBe(1299);
  });

  it('prices the monthly plans at 10% off four weekly boxes', () => {
    for (const band of ['small', 'medium', 'large'] as const) {
      const weekly = planFixtures.find((plan) => plan.slug === `weekly-fresh-${band}`);
      const monthly = planFixtures.find((plan) => plan.slug === `monthly-fresh-${band}`);
      expect(weekly).toBeTruthy();
      expect(monthly).toBeTruthy();
      if (!weekly || !monthly) continue;
      const fourWeeks = weekly.priceInr * 4;
      const expected = Math.round(fourWeeks * 0.9);
      expect(monthly.priceInr).toBe(expected);
      expect(monthly.compareAtInr).toBe(fourWeeks);
    }
  });

  it('rounds per-day prices to whole rupees', () => {
    expect(perDayPrice(749, 7)).toBe(107);
    expect(perDayPrice(1099, 7)).toBe(157);
    expect(perDayPrice(2696, 28)).toBe(96);
    expect(perDayPrice(100, 0)).toBe(0);
  });

  it('computes the savings badge percentage', () => {
    const monthly = planFixtures.find((plan) => plan.slug === 'monthly-fresh-small');
    expect(monthly).toBeTruthy();
    if (monthly) expect(savingsPercent(monthly)).toBe(10);
    expect(savingsPercent({ priceInr: 749, compareAtInr: null })).toBeNull();
    expect(savingsPercent({ priceInr: 900, compareAtInr: 800 })).toBeNull();
  });

  it('has unique slugs and the ten seeded delivery areas', () => {
    const slugs = planFixtures.map((plan) => plan.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(deliveryZoneFixtures).toHaveLength(10);
    expect(deliveryZoneFixtures.map((zone) => zone.areaName)).toEqual(
      expect.arrayContaining(['Madhapur', 'Gachibowli', 'Kondapur', 'HITEC City']),
    );
    expect(addonFixtures).toHaveLength(4);
  });
});
