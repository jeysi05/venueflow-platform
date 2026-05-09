import type { OperatingHours, TimeSlot } from "../types";

function timeToMinutes(time: string): number {
  const [hour = "0", minute = "0"] = time.split(":");
  return Number(hour) * 60 + Number(minute);
}

function minutesToTime(minutes: number): string {
  const normalizedMinutes = minutes % (24 * 60);
  const hours = Math.floor(normalizedMinutes / 60).toString().padStart(2, "0");
  const mins = (normalizedMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
}

export function formatDisplayTime(time: string): string {
  const [hourValue = "0", minute = "00"] = time.split(":");
  const hour = Number(hourValue);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${period}`;
}

function getDeterministicStatus(date: Date, resourceId: string, time: string): TimeSlot["status"] {
  const seed = `${date.toISOString().slice(0, 10)}-${resourceId}-${time}`
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  if (seed % 19 === 0) return "booked";
  if (seed % 17 === 0) return "pending";
  return "available";
}

export function generateTimeSlots(date: Date, resourceId: string, hours: OperatingHours): TimeSlot[] {
  const startMinutes = timeToMinutes(hours.open);
  const closeMinutes = timeToMinutes(hours.close);
  const endMinutes = closeMinutes <= startMinutes ? closeMinutes + 24 * 60 : closeMinutes;
  const slots: TimeSlot[] = [];

  for (let cursor = startMinutes; cursor < endMinutes; cursor += hours.slotDurationMinutes) {
    const time = minutesToTime(cursor);
    slots.push({
      id: `${resourceId}-${date.toISOString().slice(0, 10)}-${time}`,
      time,
      displayTime: formatDisplayTime(time),
      status: getDeterministicStatus(date, resourceId, time)
    });
  }

  return slots;
}
