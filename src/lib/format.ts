import { brand } from '@/config/brand';
import { CURRENCY_SYMBOL } from '@/config/pricing';

const inrFormatter = new Intl.NumberFormat(brand.locale, {
  style: 'currency',
  currency: brand.currency,
  maximumFractionDigits: 0,
});

/** ₹1,099 */
export function formatINR(amount: number): string {
  return inrFormatter.format(amount).replace(/\u00a0/g, ' ');
}

/** 1099 → "1,099" (no symbol, for tight table cells). */
export function formatNumber(amount: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(brand.locale, options).format(amount);
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat(brand.locale, { notation: 'compact', maximumFractionDigits: 1 })
    .format(value)
    .replace('T', 'K');
}

export function formatPricePerDay(priceInr: number, durationDays: number): string {
  if (durationDays <= 0) return '—';
  return `${CURRENCY_SYMBOL}${Math.round(priceInr / durationDays)}/day`;
}

export function parseDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  // Full ISO timestamps (e.g. "2026-11-26T17:01:50.414318+00") must not get the
  // date-only "T00:00:00" suffix appended — that produces an Invalid Date.
  if (/^\d{4}-\d{2}-\d{2}T/i.test(value)) return new Date(value);
  return new Date(`${value}T00:00:00`);
}

export function formatDate(value: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  const date = parseDate(value);
  return new Intl.DateTimeFormat(brand.locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...opts,
  }).format(date);
}

export function formatDateShort(value: string | Date): string {
  return formatDate(value, { day: 'numeric', month: 'short' });
}

export function formatDateTime(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(brand.locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatWeekRange(startIso: string): string {
  const start = parseDate(startIso);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = new Intl.DateTimeFormat(brand.locale, {
    day: 'numeric',
    month: 'short',
  }).format(start);
  const endLabel = new Intl.DateTimeFormat(brand.locale, {
    day: 'numeric',
    month: sameMonth ? undefined : 'short',
  }).format(end);
  return `${startLabel} – ${endLabel}`;
}

export function formatWeight(kg: number): string {
  return `${Number(kg.toFixed(1))} kg`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural;
}

export function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}${'•'.repeat(Math.max(1, name.length - 2))}@${domain}`;
}
