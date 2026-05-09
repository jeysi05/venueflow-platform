import type { AddonConfig, AddonSelection, BookingMode, ResourceConfig, TimeSlot } from "../types";
import { getDayDifference } from "./dates";

export function getDurationUnits(mode: BookingMode, selectedSlots: TimeSlot[], checkInDate: Date, checkOutDate: Date | null): number {
  if (mode === "hourly") return selectedSlots.length;
  if (mode === "nightly") return checkOutDate ? Math.max(1, getDayDifference(checkInDate, checkOutDate)) : 1;
  return 1;
}

export function calculateBaseTotal(mode: BookingMode, resource: ResourceConfig, selectedSlots: TimeSlot[], checkInDate: Date, checkOutDate: Date | null): number {
  return resource.rate * getDurationUnits(mode, selectedSlots, checkInDate, checkOutDate);
}

export function calculateAddonTotal(addons: AddonConfig[], selections: AddonSelection[]): number {
  return selections.reduce((total, selection) => {
    const addon = addons.find((item) => item.id === selection.addonId);
    return addon ? total + addon.price * selection.quantity : total;
  }, 0);
}

export function calculateReservationTotal(
  mode: BookingMode,
  resource: ResourceConfig,
  slots: TimeSlot[],
  checkInDate: Date,
  checkOutDate: Date | null,
  addons: AddonConfig[],
  selections: AddonSelection[]
): number {
  return calculateBaseTotal(mode, resource, slots, checkInDate, checkOutDate) + calculateAddonTotal(addons, selections);
}
