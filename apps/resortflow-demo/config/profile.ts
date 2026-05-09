import type { BookingProfile } from "@venueflow/booking-engine";

export const profile: BookingProfile = {
  id: "resortflow-demo",
  mode: "daily",
  bookingWindowDays: 14,
  minimumUnits: 1,
  brand: {
    id: "resortflow",
    name: "ResortFlow Demo",
    eyebrow: "Resort access and day-pass booking",
    heroTitle: "Plan Your Resort Escape",
    heroSubtitle: "Day-pass and resort amenity reservations built for private getaways and group visits.",
    primaryColor: "#17483E",
    supportLabel: "Need help planning your visit?",
    contact: {
      chatUrl: "https://m.me/placeholder",
      phone: "+639XXXXXXXXX",
      sms: "+639XXXXXXXXX"
    }
  },
  resources: [
    {
      id: "pool-day-pass",
      label: "Pool Day Pass",
      kind: "resort",
      meta: "Per guest group",
      description: "Access to pool amenities, seating, shower areas, and guest facilities.",
      rate: 2500
    },
    {
      id: "cabana-access",
      label: "Cabana Access",
      kind: "resort",
      meta: "Up to 8 guests",
      description: "Private cabana reservation for daytime resort visits and celebrations.",
      rate: 4200
    },
    {
      id: "overnight-suite",
      label: "Overnight Suite",
      kind: "resort",
      meta: "Up to 6 guests",
      description: "Premium suite access for private resort stays and special occasions.",
      rate: 9500
    }
  ],
  addons: [
    { id: "towel-package", label: "Towel Package", description: "Prepared towels for your group.", price: 250, maxQuantity: 10 },
    { id: "meal-voucher", label: "Meal Voucher", description: "Food and beverage credit for the visit.", price: 500, maxQuantity: 12 },
    { id: "extra-guest", label: "Extra Guest Pass", description: "Add more guests to the reservation.", price: 750, maxQuantity: 10 }
  ],
  copy: {
    dateHeading: "Choose your visit date",
    resourceHeading: "Choose a resort space",
    timeHeading: "Visit details",
    addOnHeading: "Resort add-ons",
    emptyCheckout: "Select a resort space and visit date",
    reserveCta: "Reserve",
    unitLabel: "day"
  }
};
