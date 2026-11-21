import { deliverySchedule } from '@/config/pricing';

/** ISO date (yyyy-mm-dd) in the local timezone — avoids UTC off-by-one bugs. */
export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function startOfDay(date: Date = new Date()): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Most recent Sunday (or today if today is Sunday). */
export function currentWeekStart(now: Date = new Date()): Date {
  const start = startOfDay(now);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

/** The upcoming Sunday delivery. If today is Sunday, schedule the following week. */
export function upcomingDeliveryDate(now: Date = new Date()): Date {
  const base = startOfDay(now);
  const day = base.getDay(); // 0 = Sunday
  const offset = day === 0 ? 7 : 7 - day;
  return addDays(base, offset);
}

/** Ordering cut-off: the Thursday before the upcoming delivery, 11:59 PM. */
export function nextCutoff(now: Date = new Date()): Date {
  const delivery = upcomingDeliveryDate(now);
  const cutoff = addDays(delivery, -3);
  cutoff.setHours(23, 59, 0, 0);
  return cutoff;
}

export function isPastCutoff(now: Date = new Date()): boolean {
  return now.getTime() > nextCutoff(now).getTime();
}

export function daysUntil(target: string | Date, now: Date = new Date()): number {
  const targetDate = typeof target === 'string' ? new Date(`${target}T00:00:00`) : target;
  const diff = startOfDay(targetDate).getTime() - startOfDay(now).getTime();
  return Math.round(diff / 86_400_000);
}

export function lastNDays(days: number, now: Date = new Date()): Date[] {
  return Array.from({ length: days }, (_, index) => addDays(startOfDay(now), index - (days - 1)));
}

export function relativeDayLabel(iso: string, now: Date = new Date()): string {
  const diff = daysUntil(iso, now);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff > 1 && diff < 7) return `In ${diff} days`;
  if (diff < 0) return `${Math.abs(diff)} days ago`;
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(
    new Date(`${iso}T00:00:00`),
  );
}

export const weekdayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const scheduleCopy = deliverySchedule;
