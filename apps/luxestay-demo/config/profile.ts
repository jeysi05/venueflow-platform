import type { BookingProfile } from "@venueflow/booking-engine";

export const profile: BookingProfile = {
  id: "luxestay-demo",
  mode: "nightly",
  bookingWindowDays: 21,
  minimumUnits: 1,
  brand: {
    id: "luxestay",
    name: "LuxeStay Demo",
    eyebrow: "Private villa reservations",
    heroTitle: "Your private stay, reserved beautifully.",
    heroSubtitle: "A premium booking experience for villas, staycations, pool homes, and private overnight spaces.",
    primaryColor: "#6B4F3B",
    supportLabel: "Questions before booking?",
    contact: {
      chatUrl: "https://m.me/placeholder",
      phone: "+639XXXXXXXXX",
      sms: "+639XXXXXXXXX"
    }
  },
  resources: [
    {
      id: "garden-villa",
      label: "Garden Villa",
      kind: "villa",
      meta: "Up to 12 guests · Garden lounge",
      description: "A warm private villa with open-air dining, garden seating, and a calm overnight stay experience.",
      rate: 8500
    },
    {
      id: "pool-villa",
      label: "Pool Villa",
      kind: "villa",
      meta: "Up to 16 guests · Private pool",
      description: "A spacious pool stay for weekend groups, family celebrations, and private gatherings.",
      rate: 12500
    },
    {
      id: "family-suite",
      label: "Family Staycation Suite",
      kind: "stay",
      meta: "Up to 8 guests · Family-ready",
      description: "A polished staycation suite designed for small groups, birthdays, and relaxed overnight escapes.",
      rate: 6800
    }
  ],
  addons: [
    {
      id: "early-check-in",
      label: "Early Check-in",
      description: "Arrive two hours before the standard check-in window.",
      price: 1200,
      maxQuantity: 1
    },
    {
      id: "breakfast-package",
      label: "Breakfast Package",
      description: "Prepared breakfast set for guests the next morning.",
      price: 650,
      maxQuantity: 16
    },
    {
      id: "extra-guest",
      label: "Extra Guest Pass",
      description: "Add guests beyond the included headcount.",
      price: 900,
      maxQuantity: 10
    },
    {
      id: "celebration-setup",
      label: "Celebration Setup",
      description: "Simple styling for birthdays, anniversaries, or intimate gatherings.",
      price: 2500,
      maxQuantity: 1
    }
  ],
  copy: {
    dateHeading: "Select your stay dates",
    resourceHeading: "Choose your private stay",
    timeHeading: "Stay details",
    addOnHeading: "Curate your stay",
    emptyCheckout: "Choose your stay dates to continue",
    reserveCta: "Reserve stay",
    unitLabel: "night"
  }
};
