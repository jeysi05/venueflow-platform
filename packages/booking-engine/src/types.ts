export type BookingMode = "hourly" | "nightly" | "daily";
export type ResourceKind = "court" | "studio" | "villa" | "stay" | "resort" | "space";

export interface BrandConfig {
  id: string;
  name: string;
  eyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  primaryColor: string;
  supportLabel: string;
  contact: {
    chatUrl: string;
    phone: string;
    sms: string;
  };
}

export interface OperatingHours {
  open: string;
  close: string;
  slotDurationMinutes: number;
}

export interface ResourceConfig {
  id: string;
  label: string;
  kind: ResourceKind;
  description: string;
  meta: string;
  image?: string;
  rate: number;
}

export interface AddonConfig {
  id: string;
  label: string;
  description: string;
  price: number;
  maxQuantity: number;
}

export interface BookingCopy {
  dateHeading: string;
  resourceHeading: string;
  timeHeading: string;
  addOnHeading: string;
  emptyCheckout: string;
  reserveCta: string;
  unitLabel: string;
}

export interface BookingProfile {
  id: string;
  mode: BookingMode;
  brand: BrandConfig;
  operatingHours?: OperatingHours;
  bookingWindowDays: number;
  minimumUnits: number;
  resources: ResourceConfig[];
  addons: AddonConfig[];
  copy: BookingCopy;
}

export interface TimeSlot {
  id: string;
  time: string;
  displayTime: string;
  status: "available" | "pending" | "booked";
}

export interface AddonSelection {
  addonId: string;
  quantity: number;
}
