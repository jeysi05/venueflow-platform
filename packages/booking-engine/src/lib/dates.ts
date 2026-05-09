const shortDateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const longDateFormatter = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });
const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });

export function startOfDay(date: Date): Date {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

export function addDays(date: Date, days: number): Date {
  const value = startOfDay(date);
  value.setDate(value.getDate() + days);
  return value;
}

export function getUpcomingDates(count: number): Date[] {
  const today = startOfDay(new Date());
  return Array.from({ length: count }, (_, index) => addDays(today, index));
}

export function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function getDayDifference(start: Date, end: Date): number {
  return Math.max(0, Math.round((startOfDay(end).getTime() - startOfDay(start).getTime()) / 86_400_000));
}

export function formatShortDate(date: Date): string {
  return shortDateFormatter.format(date);
}

export function formatLongDate(date: Date): string {
  return longDateFormatter.format(date);
}

export function formatWeekday(date: Date): string {
  return weekdayFormatter.format(date);
}
