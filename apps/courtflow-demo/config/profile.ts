import type { BookingProfile } from "@venueflow/booking-engine";

export const profile: BookingProfile = {
  id: "courtflow-demo",
  mode: "hourly",
  bookingWindowDays: 10,
  minimumUnits: 1,
  brand: {
    id: "courtflow",
    name: "CourtFlow Demo",
    eyebrow: "Hourly court reservations",
    heroTitle: "Reserve Your Court Without the Back-and-Forth",
    heroSubtitle: "A polished booking flow for pickleball, badminton, and private sports facilities.",
    primaryColor: "#164734",
    supportLabel: "Need help with your reservation?",
    contact: {
      chatUrl: "https://m.me/placeholder",
      phone: "+639XXXXXXXXX",
      sms: "+639XXXXXXXXX"
    }
  },
  operatingHours: {
    open: "08:00",
    close: "23:00",
    slotDurationMinutes: 60
  },
  resources: [
    {
      id: "pickleball-court",
      label: "Pickleball Court",
      kind: "court",
      meta: "Indoor court",
      description: "Private court access for singles, doubles, and group training.",
      rate: 500
    },
    {
      id: "badminton-court",
      label: "Badminton Court",
      kind: "court",
      meta: "Wood flooring",
      description: "Hourly badminton reservations with clear availability and peak pricing support.",
      rate: 450
    },
    {
      id: "training-court",
      label: "Training Court",
      kind: "court",
      meta: "Coach-ready",
      description: "A focused space for drills, coaching sessions, and recurring reservations.",
      rate: 650
    }
  ],
  addons: [
    { id: "racket-rental", label: "Racket Rental", description: "Add rental rackets during checkout.", price: 80, maxQuantity: 6 },
    { id: "ball-tube", label: "Ball Tube", description: "Fresh balls prepared for the session.", price: 120, maxQuantity: 4 },
    { id: "coach-session", label: "Coach Session", description: "Add a private coach for the selected hour.", price: 700, maxQuantity: 2 }
  ],
  copy: {
    dateHeading: "Pick a play date",
    resourceHeading: "Choose a court",
    timeHeading: "Available court times",
    addOnHeading: "Court add-ons",
    emptyCheckout: "Select a court time to continue",
    reserveCta: "Reserve",
    unitLabel: "hour"
  }
};
