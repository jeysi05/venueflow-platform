import type { BookingProfile } from "@venueflow/booking-engine";

export const resortProfile: BookingProfile = {
  id: "resortflow-demo",
  mode: "daily",
  bookingWindowDays: 14,
  minimumUnits: 1,
  brand: {
    id: "resortflow",
    name: "ResortFlow Demo",
    eyebrow: "Private resort reservations",
    heroTitle: "Plan Your Resort Escape",
    heroSubtitle: "A polished booking experience for day passes, private cabanas, and overnight resort stays.",
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
      meta: "Best for families",
      description: "Full-day access to the pool deck, lounge areas, shower rooms, and guest facilities.",
      rate: 2500
    },
    {
      id: "cabana-access",
      label: "Cabana Access",
      kind: "resort",
      meta: "Premium day use",
      description: "Private cabana access for celebrations, family gatherings, and relaxed resort visits.",
      rate: 4200
    },
    {
      id: "overnight-suite",
      label: "Overnight Suite",
      kind: "resort",
      meta: "Most immersive",
      description: "A premium overnight suite experience for private resort stays and weekend escapes.",
      rate: 9500
    }
  ],
  addons: [
    {
      id: "meal-voucher",
      label: "Meal Voucher",
      description: "Food and beverage credit prepared for your group.",
      price: 500,
      maxQuantity: 12
    },
    {
      id: "towel-package",
      label: "Towel Package",
      description: "Fresh towels prepared for day-pass and overnight guests.",
      price: 250,
      maxQuantity: 12
    },
    {
      id: "extra-guest-pass",
      label: "Extra Guest Pass",
      description: "Add more guests beyond the included group size.",
      price: 750,
      maxQuantity: 10
    },
    {
      id: "celebration-setup",
      label: "Celebration Setup",
      description: "Simple welcome styling for birthdays, proposals, or family events.",
      price: 1800,
      maxQuantity: 1
    }
  ],
  copy: {
    dateHeading: "Choose your visit date",
    resourceHeading: "Choose a resort experience",
    timeHeading: "Review your resort stay",
    addOnHeading: "Resort add-ons",
    emptyCheckout: "Select a resort experience to continue",
    reserveCta: "Reserve",
    unitLabel: "day"
  }
};