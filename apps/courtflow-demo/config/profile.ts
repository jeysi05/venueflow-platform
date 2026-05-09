import type { BookingProfile } from "@venueflow/booking-engine";

export const profile: BookingProfile = {
  id: "courtflow-demo",
  mode: "hourly",
  bookingWindowDays: 10,
  minimumUnits: 1,
  brand: {
    id: "courtflow",
    name: "CourtFlow Demo",
    eyebrow: "Premium court reservations",
    heroTitle: "Book Your Court. Own Your Game.",
    heroSubtitle: "A fast, premium reservation experience for pickleball, badminton, and private sports facilities.",
    primaryColor: "#113F2D",
    supportLabel: "Need help choosing a court?",
    contact: {
      chatUrl: "https://m.me/placeholder",
      phone: "+639XXXXXXXXX",
      sms: "+639XXXXXXXXX"
    }
  },
  operatingHours: {
    open: "06:00",
    close: "23:00",
    slotDurationMinutes: 60
  },
  resources: [
    {
      id: "premium-pickleball-court",
      label: "Premium Pickleball Court",
      kind: "court",
      meta: "Indoor · Pro surface · Up to 4 players",
      description: "Tournament-ready pickleball court with clean sightlines, premium flooring, and private group access.",
      rate: 620
    },
    {
      id: "indoor-badminton-court",
      label: "Indoor Badminton Court",
      kind: "court",
      meta: "Wood flooring · Doubles-ready",
      description: "A polished indoor badminton court for casual games, weekly groups, and competitive rallies.",
      rate: 520
    },
    {
      id: "training-court",
      label: "Training Court",
      kind: "court",
      meta: "Coach-ready · Drills & lessons",
      description: "A focused training space for private coaching, skills development, and recurring practice sessions.",
      rate: 750
    }
  ],
  addons: [
    {
      id: "racket-rental",
      label: "Racket Rental",
      description: "Reserve clean rental rackets for the session.",
      price: 90,
      maxQuantity: 6
    },
    {
      id: "ball-tube",
      label: "Ball Tube",
      description: "Fresh balls prepared before your court time.",
      price: 140,
      maxQuantity: 4
    },
    {
      id: "coach-session",
      label: "Coach Session",
      description: "Add a private coach for drills and guided play.",
      price: 850,
      maxQuantity: 2
    },
    {
      id: "extra-player-pass",
      label: "Extra Player Pass",
      description: "Add additional players for larger groups.",
      price: 120,
      maxQuantity: 8
    }
  ],
  copy: {
    dateHeading: "Pick a play date",
    resourceHeading: "Choose a court",
    timeHeading: "Available court times",
    addOnHeading: "Court add-ons",
    emptyCheckout: "Select a court time to continue",
    reserveCta: "Reserve court",
    unitLabel: "hour"
  }
};
