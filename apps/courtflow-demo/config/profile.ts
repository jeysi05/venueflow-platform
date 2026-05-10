import type { BookingProfile } from "@venueflow/booking-engine";

export const profile: BookingProfile = {
  id: "courtflow-demo",
  mode: "hourly",
  bookingWindowDays: 14,
  minimumUnits: 1,
  brand: {
    id: "courtflow",
    name: "CourtFlow Demo",
    eyebrow: "Book a court",
    heroTitle: "Reserve Your Winning Moment",
    heroSubtitle: "A premium court booking flow for pickleball, badminton, private training, and sports facilities.",
    primaryColor: "#16A77A",
    supportLabel: "Need help with your court booking?",
    contact: {
      chatUrl: "https://m.me/placeholder",
      phone: "+639XXXXXXXXX",
      sms: "+639XXXXXXXXX"
    }
  },
  operatingHours: {
    open: "08:00",
    close: "24:00",
    slotDurationMinutes: 30
  },
  resources: [
    {
      id: "court-1",
      label: "Court 1",
      kind: "court",
      meta: "Premium indoor court",
      description: "A polished court setup for singles, doubles, casual rallies, and competitive play.",
      rate: 500
    },
    {
      id: "court-2",
      label: "Court 2",
      kind: "court",
      meta: "Tournament-ready court",
      description: "A clean indoor court built for fast-paced matches and private sessions.",
      rate: 500
    },
    {
      id: "court-3",
      label: "Court 3",
      kind: "court",
      meta: "Training-friendly court",
      description: "A flexible court for drills, coaching sessions, group training, and player development.",
      rate: 550
    },
    {
      id: "court-4",
      label: "Court 4",
      kind: "court",
      meta: "Group play court",
      description: "A spacious court option for doubles, friend groups, and casual club sessions.",
      rate: 550
    },
    {
      id: "court-5",
      label: "Court 5",
      kind: "court",
      meta: "Prime match court",
      description: "A premium match-ready court for competitive games and peak-hour reservations.",
      rate: 600
    }
  ],
  addons: [
    {
      id: "racket-rental",
      label: "Racket Rental",
      description: "Prepared rackets for guests who need equipment on arrival.",
      price: 120,
      maxQuantity: 8
    },
    {
      id: "ball-tube",
      label: "Ball Tube",
      description: "Fresh balls prepared for your court session.",
      price: 180,
      maxQuantity: 4
    },
    {
      id: "coach-session",
      label: "Coach Session",
      description: "Add a private coach for warmups, drills, or beginner guidance.",
      price: 900,
      maxQuantity: 1
    },
    {
      id: "extra-player-pass",
      label: "Extra Player Pass",
      description: "Add extra guests beyond the included player count.",
      price: 150,
      maxQuantity: 8
    }
  ],
  copy: {
    dateHeading: "Pick a Date",
    resourceHeading: "Choose a Court",
    timeHeading: "Session length & time",
    addOnHeading: "Court add-ons",
    emptyCheckout: "Select a court time to continue",
    reserveCta: "Reserve court",
    unitLabel: "hour"
  }
};