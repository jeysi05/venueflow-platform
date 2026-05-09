# VenueFlow Platform

A monorepo for vertical-specific booking demos powered by one shared booking engine.

## Apps

- `apps/courtflow-demo` — hourly court booking demo.
- `apps/luxestay-demo` — nightly villa / staycation booking demo.
- `apps/resortflow-demo` — daily resort booking demo.

## Shared package

- `packages/booking-engine` — reusable booking UI, pricing, date, slot, and checkout logic.

## Commands

```bash
npm install
npm run dev:courts
npm run dev:villas
npm run dev:resorts
npm run verify
```

Each app is intentionally separate for client demos, but they all reuse the shared base engine.
