"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import type { AddonConfig, ResourceConfig } from "@venueflow/booking-engine";
import { resortProfile } from "@/config/profile";

const profile = resortProfile;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric"
});

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short"
});

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0
  }).format(amount);
}

function getDates(days: number): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return date;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

function differenceInDays(start: Date, end: Date): number {
  const startDate = new Date(start);
  const endDate = new Date(end);

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  return Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000));
}

function getUnitForResource(resource: ResourceConfig): "day" | "night" {
  const label = resource.label.toLowerCase();

  if (resource.id.includes("overnight") || label.includes("overnight") || label.includes("suite")) {
    return "night";
  }

  return "day";
}

function pluralize(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? "" : "s"}`;
}

function getResourceGradient(resource: ResourceConfig, index: number): string {
  const gradients = [
    "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.50), transparent 25%), linear-gradient(135deg, #D8D0C1 0%, #7C927F 46%, #17483E 100%)",
    "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.45), transparent 25%), linear-gradient(135deg, #E4D7C4 0%, #B59F82 48%, #6F604E 100%)",
    "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.42), transparent 25%), linear-gradient(135deg, #EFE5D5 0%, #8AA08A 50%, #1D5C4B 100%)"
  ];

  if (resource.image) {
    return `linear-gradient(180deg, rgba(15,23,42,0.05), rgba(15,23,42,0.40)), url(${resource.image})`;
  }

  return gradients[index % gradients.length] ?? gradients[0];
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="vf-min-w-0 vf-rounded-2xl vf-border vf-border-[#E5E1DA] vf-bg-[#FBF8F1] vf-p-4">
      <p className="vf-text-[11px] vf-font-medium vf-uppercase vf-tracking-[0.18em] vf-text-[#9A8F82]">
        {label}
      </p>
      <p className="vf-mt-1 vf-truncate vf-text-sm vf-font-semibold vf-text-[#1F211C]">
        {value}
      </p>
    </div>
  );
}

export default function ResortFlowPage() {
  const dates = useMemo(() => getDates(profile.bookingWindowDays), []);
  const [selectedResourceId, setSelectedResourceId] = useState(profile.resources[0]?.id ?? "");
  const [selectedDate, setSelectedDate] = useState(dates[0] ?? new Date());
  const [checkoutDate, setCheckoutDate] = useState(addDays(dates[0] ?? new Date(), 1));
  const [guestCount, setGuestCount] = useState(6);
  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>({});

  const selectedResource =
    profile.resources.find((resource) => resource.id === selectedResourceId) ?? profile.resources[0];

  const unit = selectedResource ? getUnitForResource(selectedResource) : "day";
  const duration = unit === "night" ? differenceInDays(selectedDate, checkoutDate) : 1;

  const stayLabel =
    unit === "night"
      ? `${dateFormatter.format(selectedDate)} – ${dateFormatter.format(checkoutDate)}`
      : dateFormatter.format(selectedDate);

  const resourceSubtotal = selectedResource ? selectedResource.rate * duration : 0;

  const addonSubtotal = profile.addons.reduce((total, addon) => {
    return total + (addonQuantities[addon.id] ?? 0) * addon.price;
  }, 0);

  const total = resourceSubtotal + addonSubtotal;

  function selectResource(resource: ResourceConfig) {
    setSelectedResourceId(resource.id);

    if (getUnitForResource(resource) === "night" && checkoutDate <= selectedDate) {
      setCheckoutDate(addDays(selectedDate, 1));
    }
  }

  function selectVisitDate(date: Date) {
    setSelectedDate(date);

    if (unit === "night" && checkoutDate <= date) {
      setCheckoutDate(addDays(date, 1));
    }
  }

  function updateAddon(addon: AddonConfig, delta: number) {
    setAddonQuantities((current) => {
      const nextQuantity = Math.min(addon.maxQuantity, Math.max(0, (current[addon.id] ?? 0) + delta));

      return {
        ...current,
        [addon.id]: nextQuantity
      };
    });
  }

  const heroStyle: CSSProperties = {
    background:
      "linear-gradient(90deg, rgba(31,33,28,0.70), rgba(23,72,62,0.88)), radial-gradient(circle at 18% 28%, rgba(255,255,255,0.30), transparent 28%), linear-gradient(135deg, #D8CDBA 0%, #9F927D 45%, #17483E 100%)"
  };

  return (
    <main className="vf-min-h-screen vf-overflow-x-hidden vf-bg-[#F8F4EC] vf-text-[#1F211C]">
      <header className="vf-sticky vf-top-0 vf-z-40 vf-border-b vf-border-[#E5E1DA] vf-bg-white/95 vf-backdrop-blur">
        <div className="vf-mx-auto vf-flex vf-h-16 vf-w-full vf-max-w-6xl vf-items-center vf-justify-between vf-gap-4 vf-px-4 sm:vf-px-6">
          <div className="vf-flex vf-min-w-0 vf-items-center vf-gap-3">
            <div className="vf-flex vf-h-10 vf-w-10 vf-shrink-0 vf-items-center vf-justify-center vf-rounded-xl vf-bg-[#17483E] vf-text-sm vf-font-semibold vf-text-white">
              RF
            </div>

            <div className="vf-min-w-0">
              <p className="vf-truncate vf-text-sm vf-font-semibold vf-text-[#1F211C] sm:vf-text-base">
                {profile.brand.name}
              </p>
              <p className="vf-truncate vf-text-xs vf-text-[#76685E]">
                Premium resort booking demo
              </p>
            </div>
          </div>

          <a
            href="/bookings"
            className="vf-shrink-0 vf-rounded-full vf-border vf-border-[#E5E1DA] vf-bg-white vf-px-4 vf-py-2 vf-text-sm vf-font-medium vf-text-[#1F211C] vf-transition hover:vf-border-[#BDB2A5] hover:vf-bg-[#F8F4EC]"
          >
            My Bookings
          </a>
        </div>
      </header>

      <section
        className="vf-relative vf-w-full vf-overflow-hidden vf-px-4 vf-py-12 sm:vf-px-6 md:vf-py-16 xl:vf-py-20"
        style={heroStyle}
      >
        <div className="vf-mx-auto vf-grid vf-w-full vf-max-w-6xl vf-gap-8 lg:vf-grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:vf-items-center">
          <div className="vf-min-w-0 vf-text-white">
            <p className="vf-text-xs vf-font-semibold vf-uppercase vf-tracking-[0.22em] vf-text-white/75">
              {profile.brand.eyebrow}
            </p>

            <h1 className="vf-mt-4 vf-max-w-3xl vf-font-serif vf-text-4xl vf-leading-[1] vf-tracking-[-0.04em] sm:vf-text-5xl md:vf-text-6xl xl:vf-text-7xl">
              {profile.brand.heroTitle}
            </h1>

            <p className="vf-mt-5 vf-max-w-2xl vf-text-sm vf-leading-7 vf-text-white/88 sm:vf-text-base md:vf-text-lg">
              {profile.brand.heroSubtitle}
            </p>

            <div className="vf-mt-7 vf-flex vf-flex-wrap vf-gap-2 sm:vf-gap-3">
              {["Day passes", "Private cabanas", "Overnight stays"].map((item) => (
                <span
                  key={item}
                  className="vf-rounded-full vf-border vf-border-white/25 vf-bg-white/15 vf-px-4 vf-py-2 vf-text-xs vf-font-medium vf-text-white vf-backdrop-blur"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {selectedResource ? (
            <div className="vf-min-w-0 vf-rounded-[1.75rem] vf-border vf-border-white/25 vf-bg-white/15 vf-p-3 vf-text-white vf-shadow-[0_24px_70px_rgba(15,23,42,0.18)] vf-backdrop-blur-md sm:vf-p-4">
              <div className="vf-rounded-[1.35rem] vf-bg-white vf-p-4 vf-text-[#1F211C]">
                <div
                  className="vf-h-36 vf-rounded-[1.1rem] vf-bg-cover vf-bg-center sm:vf-h-44"
                  style={{ background: getResourceGradient(selectedResource, 0) }}
                />

                <p className="vf-mt-4 vf-text-xs vf-font-medium vf-uppercase vf-tracking-[0.18em] vf-text-[#9A8F82]">
                  Featured experience
                </p>

                <h2 className="vf-mt-2 vf-font-serif vf-text-2xl vf-leading-tight">
                  {selectedResource.label}
                </h2>

                <p className="vf-mt-2 vf-text-sm vf-leading-6 vf-text-[#76685E]">
                  {selectedResource.description}
                </p>

                <p className="vf-mt-4 vf-text-sm vf-font-semibold">
                  Starts at {formatCurrency(selectedResource.rate)} / {unit}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <div className="vf-mx-auto vf-grid vf-w-full vf-max-w-6xl vf-gap-8 vf-px-4 vf-pb-36 vf-pt-8 sm:vf-px-6 lg:vf-grid-cols-[minmax(0,1fr)_340px] lg:vf-pb-20 xl:vf-grid-cols-[minmax(0,1fr)_360px]">
        <div className="vf-min-w-0 vf-space-y-6">
          <section className="vf-rounded-[1.75rem] vf-border vf-border-[#E5E1DA] vf-bg-white vf-p-5 vf-shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:vf-p-6">
            <p className="vf-text-xs vf-font-semibold vf-uppercase vf-tracking-[0.18em] vf-text-[#9A8F82]">
              Experience
            </p>

            <div className="vf-mt-2">
              <h2 className="vf-font-serif vf-text-3xl vf-leading-tight sm:vf-text-4xl">
                Choose your resort experience
              </h2>
              <p className="vf-mt-2 vf-max-w-2xl vf-text-sm vf-leading-6 vf-text-[#76685E]">
                Day access and overnight stays use different booking logic but share one polished reservation flow.
              </p>
            </div>

            <div className="vf-mt-5 vf-grid vf-gap-4 md:vf-grid-cols-3">
              {profile.resources.map((resource, index) => {
                const selected = resource.id === selectedResourceId;
                const resourceUnit = getUnitForResource(resource);

                return (
                  <button
                    key={resource.id}
                    type="button"
                    onClick={() => selectResource(resource)}
                    className="vf-min-w-0 vf-rounded-[1.4rem] vf-border vf-bg-white vf-p-3 vf-text-left vf-transition hover:vf-border-[#BDB2A5] hover:vf-shadow-[0_4px_16px_rgba(0,0,0,0.10)]"
                    style={{
                      borderColor: selected ? profile.brand.primaryColor : "#E5E1DA",
                      boxShadow: selected ? `0 0 0 2px ${profile.brand.primaryColor}22` : undefined
                    }}
                  >
                    <div
                      className="vf-h-36 vf-rounded-[1.1rem] vf-bg-cover vf-bg-center"
                      style={{ background: getResourceGradient(resource, index) }}
                    />

                    <p className="vf-mt-4 vf-text-xs vf-font-medium vf-uppercase vf-tracking-[0.15em] vf-text-[#9A8F82]">
                      {resource.meta}
                    </p>

                    <h3 className="vf-mt-1 vf-font-serif vf-text-2xl vf-leading-tight">
                      {resource.label}
                    </h3>

                    <p className="vf-mt-2 vf-text-sm vf-leading-6 vf-text-[#76685E]">
                      {resource.description}
                    </p>

                    <p className="vf-mt-4 vf-text-sm vf-font-semibold">
                      {formatCurrency(resource.rate)} / {resourceUnit}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="vf-rounded-[1.75rem] vf-border vf-border-[#E5E1DA] vf-bg-white vf-p-5 vf-shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:vf-p-6">
            <div className="vf-flex vf-flex-col vf-gap-2 sm:vf-flex-row sm:vf-items-end sm:vf-justify-between">
              <div className="vf-min-w-0">
                <p className="vf-text-xs vf-font-semibold vf-uppercase vf-tracking-[0.18em] vf-text-[#9A8F82]">
                  Dates
                </p>
                <h2 className="vf-mt-2 vf-font-serif vf-text-3xl vf-leading-tight sm:vf-text-4xl">
                  {unit === "night" ? "Select your stay dates" : "Choose your visit date"}
                </h2>
              </div>

              <p className="vf-text-sm vf-text-[#76685E]">
                Next {profile.bookingWindowDays} days
              </p>
            </div>

            <div className="vf-scrollbar-hide vf-mt-5 vf-flex vf-w-full vf-gap-3 vf-overflow-x-auto vf-pb-1">
              {dates.map((date, index) => {
                const selected = isSameDay(date, selectedDate);

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => selectVisitDate(date)}
                    className="vf-h-20 vf-w-20 vf-shrink-0 vf-rounded-2xl vf-border vf-border-[#E5E1DA] vf-bg-white vf-text-center vf-transition hover:vf-border-[#BDB2A5] active:vf-scale-[0.98]"
                    style={
                      selected
                        ? {
                            backgroundColor: profile.brand.primaryColor,
                            borderColor: profile.brand.primaryColor,
                            color: "white"
                          }
                        : undefined
                    }
                  >
                    <span className="vf-block vf-text-[11px] vf-font-medium vf-uppercase vf-tracking-[0.12em] vf-opacity-70">
                      {index === 0 ? "Today" : weekdayFormatter.format(date)}
                    </span>
                    <span className="vf-mt-1 vf-block vf-text-sm vf-font-semibold">
                      {dateFormatter.format(date)}
                    </span>
                  </button>
                );
              })}
            </div>

            {unit === "night" ? (
              <div className="vf-mt-5 vf-rounded-2xl vf-bg-[#F8F4EC] vf-p-4">
                <div className="vf-flex vf-flex-col vf-gap-3 sm:vf-flex-row sm:vf-items-center sm:vf-justify-between">
                  <div>
                    <p className="vf-text-xs vf-font-medium vf-uppercase vf-tracking-[0.18em] vf-text-[#9A8F82]">
                      Check-out
                    </p>
                    <p className="vf-mt-1 vf-text-sm vf-text-[#76685E]">
                      Minimum {pluralize(profile.minimumUnits, "night")}
                    </p>
                  </div>

                  <div className="vf-flex vf-flex-wrap vf-gap-2">
                    {[1, 2, 3, 4].map((nights) => (
                      <button
                        key={nights}
                        type="button"
                        onClick={() => setCheckoutDate(addDays(selectedDate, nights))}
                        className="vf-rounded-full vf-border vf-border-[#E5E1DA] vf-bg-white vf-px-4 vf-py-2 vf-text-sm vf-font-medium vf-transition hover:vf-border-[#BDB2A5]"
                        style={
                          duration === nights
                            ? {
                                backgroundColor: profile.brand.primaryColor,
                                borderColor: profile.brand.primaryColor,
                                color: "white"
                              }
                            : undefined
                        }
                      >
                        {pluralize(nights, "night")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <section className="vf-rounded-[1.75rem] vf-border vf-border-[#E5E1DA] vf-bg-white vf-p-5 vf-shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:vf-p-6">
            <p className="vf-text-xs vf-font-semibold vf-uppercase vf-tracking-[0.18em] vf-text-[#9A8F82]">
              Guests
            </p>

            <div className="vf-mt-2 vf-flex vf-flex-col vf-gap-4 sm:vf-flex-row sm:vf-items-center sm:vf-justify-between">
              <div className="vf-min-w-0">
                <h2 className="vf-font-serif vf-text-3xl vf-leading-tight sm:vf-text-4xl">
                  Set your group size
                </h2>
                <p className="vf-mt-2 vf-text-sm vf-leading-6 vf-text-[#76685E]">
                  Keep the reservation accurate for seating, towels, meals, and guest access.
                </p>
              </div>

              <div className="vf-flex vf-w-fit vf-items-center vf-gap-3 vf-rounded-full vf-bg-[#F8F4EC] vf-p-2">
                <button
                  type="button"
                  onClick={() => setGuestCount((count) => Math.max(1, count - 1))}
                  className="vf-flex vf-h-10 vf-w-10 vf-items-center vf-justify-center vf-rounded-full vf-bg-white vf-text-lg vf-font-semibold vf-text-[#1F211C] vf-shadow-sm"
                >
                  −
                </button>

                <span className="vf-w-12 vf-text-center vf-text-lg vf-font-semibold">
                  {guestCount}
                </span>

                <button
                  type="button"
                  onClick={() => setGuestCount((count) => Math.min(30, count + 1))}
                  className="vf-flex vf-h-10 vf-w-10 vf-items-center vf-justify-center vf-rounded-full vf-text-lg vf-font-semibold vf-text-white vf-shadow-sm"
                  style={{ backgroundColor: profile.brand.primaryColor }}
                >
                  +
                </button>
              </div>
            </div>
          </section>

          <section className="vf-rounded-[1.75rem] vf-border vf-border-[#E5E1DA] vf-bg-white vf-p-5 vf-shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:vf-p-6">
            <p className="vf-text-xs vf-font-semibold vf-uppercase vf-tracking-[0.18em] vf-text-[#9A8F82]">
              Optional
            </p>

            <h2 className="vf-mt-2 vf-font-serif vf-text-3xl vf-leading-tight sm:vf-text-4xl">
              Add resort extras
            </h2>

            <p className="vf-mt-2 vf-text-sm vf-leading-6 vf-text-[#76685E]">
              Add-ons help personalize the visit without complicating the main booking flow.
            </p>

            <div className="vf-mt-5 vf-grid vf-gap-3 sm:vf-grid-cols-2">
              {profile.addons.map((addon) => {
                const quantity = addonQuantities[addon.id] ?? 0;

                return (
                  <div
                    key={addon.id}
                    className="vf-min-w-0 vf-rounded-2xl vf-border vf-border-[#E5E1DA] vf-bg-[#FBF8F1] vf-p-4"
                  >
                    <div className="vf-flex vf-flex-col vf-gap-4 sm:vf-flex-row sm:vf-items-start sm:vf-justify-between">
                      <div className="vf-min-w-0">
                        <h3 className="vf-font-semibold vf-text-[#1F211C]">
                          {addon.label}
                        </h3>
                        <p className="vf-mt-1 vf-text-sm vf-leading-6 vf-text-[#76685E]">
                          {addon.description}
                        </p>
                        <p className="vf-mt-2 vf-text-sm vf-font-semibold">
                          {formatCurrency(addon.price)}
                        </p>
                      </div>

                      <div className="vf-flex vf-shrink-0 vf-items-center vf-gap-2">
                        <button
                          type="button"
                          onClick={() => updateAddon(addon, -1)}
                          className="vf-flex vf-h-8 vf-w-8 vf-items-center vf-justify-center vf-rounded-full vf-border vf-border-[#E5E1DA] vf-bg-white vf-font-semibold"
                        >
                          −
                        </button>

                        <span className="vf-w-5 vf-text-center vf-text-sm vf-font-semibold">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateAddon(addon, 1)}
                          className="vf-flex vf-h-8 vf-w-8 vf-items-center vf-justify-center vf-rounded-full vf-font-semibold vf-text-white"
                          style={{ backgroundColor: profile.brand.primaryColor }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="vf-hidden lg:vf-block">
          <div className="vf-sticky vf-top-24 vf-min-w-0 vf-rounded-[1.75rem] vf-border vf-border-[#E5E1DA] vf-bg-white vf-p-6 vf-shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <p className="vf-text-xs vf-font-semibold vf-uppercase vf-tracking-[0.18em] vf-text-[#9A8F82]">
              Reservation summary
            </p>

            <h2 className="vf-mt-3 vf-font-serif vf-text-3xl vf-leading-tight">
              {selectedResource?.label ?? "Resort booking"}
            </h2>

            <p className="vf-mt-2 vf-text-sm vf-leading-6 vf-text-[#76685E]">
              {stayLabel} · {pluralize(duration, unit)} · {guestCount} guests
            </p>

            <div className="vf-mt-5 vf-grid vf-grid-cols-2 vf-gap-3">
              <InfoTile label="Rate" value={selectedResource ? `${formatCurrency(selectedResource.rate)} / ${unit}` : "Select"} />
              <InfoTile label="Duration" value={pluralize(duration, unit)} />
              <InfoTile label="Guests" value={`${guestCount}`} />
              <InfoTile label="Add-ons" value={formatCurrency(addonSubtotal)} />
            </div>

            <div className="vf-mt-6 vf-space-y-3 vf-border-t vf-border-[#E5E1DA] vf-pt-5">
              <div className="vf-flex vf-justify-between vf-gap-4 vf-text-sm vf-text-[#76685E]">
                <span className="vf-min-w-0 vf-truncate">{selectedResource?.label ?? "Resource"}</span>
                <span className="vf-shrink-0">{formatCurrency(resourceSubtotal)}</span>
              </div>

              <div className="vf-flex vf-justify-between vf-gap-4 vf-text-sm vf-text-[#76685E]">
                <span>Add-ons</span>
                <span>{formatCurrency(addonSubtotal)}</span>
              </div>

              <div className="vf-flex vf-justify-between vf-gap-4 vf-text-xl vf-font-semibold vf-text-[#1F211C]">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              type="button"
              className="vf-mt-6 vf-w-full vf-rounded-xl vf-px-5 vf-py-3 vf-text-sm vf-font-semibold vf-text-white vf-transition active:vf-scale-[0.98]"
              style={{ backgroundColor: profile.brand.primaryColor }}
            >
              Reserve resort experience
            </button>

            <p className="vf-mt-4 vf-text-center vf-text-xs vf-leading-5 vf-text-[#9A8F82]">
              Demo checkout only. Built for resort owners who need self-service bookings.
            </p>
          </div>
        </aside>
      </div>

      <section className="vf-border-t vf-border-[#E5E1DA] vf-bg-[#F2ECE1] vf-px-4 vf-py-16 sm:vf-px-6">
        <div className="vf-mx-auto vf-max-w-4xl vf-text-center">
          <p className="vf-text-xs vf-font-semibold vf-uppercase vf-tracking-[0.18em] vf-text-[#9A8F82]">
            Why it works
          </p>

          <h2 className="vf-mt-3 vf-font-serif vf-text-3xl vf-leading-tight sm:vf-text-4xl">
            Built for day access, private cabanas, and overnight stays.
          </h2>

          <p className="vf-mx-auto vf-mt-4 vf-max-w-2xl vf-text-sm vf-leading-7 vf-text-[#76685E]">
            Resort businesses often sell more than rooms. This demo shows how a booking website can handle day-pass visitors,
            cabana reservations, guest counts, add-ons, and overnight experiences in one refined flow.
          </p>
        </div>
      </section>

      <div className="vf-fixed vf-inset-x-0 vf-bottom-0 vf-z-40 vf-border-t vf-border-[#E5E1DA] vf-bg-white/95 vf-px-4 vf-py-3 vf-backdrop-blur lg:vf-hidden">
        <div className="vf-mx-auto vf-flex vf-max-w-3xl vf-items-center vf-justify-between vf-gap-4">
          <div className="vf-min-w-0">
            <p className="vf-truncate vf-text-sm vf-font-semibold vf-text-[#1F211C]">
              {selectedResource?.label ?? "Resort experience"}
            </p>

            <p className="vf-mt-0.5 vf-truncate vf-text-xs vf-text-[#76685E]">
              {stayLabel} · {pluralize(duration, unit)} · {formatCurrency(total)}
            </p>
          </div>

          <button
            type="button"
            className="vf-shrink-0 vf-rounded-xl vf-px-5 vf-py-3 vf-text-sm vf-font-semibold vf-text-white"
            style={{ backgroundColor: profile.brand.primaryColor }}
          >
            Reserve
          </button>
        </div>
      </div>
    </main>
  );
}