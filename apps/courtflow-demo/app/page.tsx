"use client";

import type { AddonConfig, AddonSelection, ResourceConfig, TimeSlot } from "@venueflow/booking-engine";
import { calculateAddonTotal, generateTimeSlots, getUpcomingDates, isSameDay } from "@venueflow/booking-engine";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { profile } from "@/config/profile";

type ViewMode = "calendar" | "court";

const accent = profile.brand.primaryColor;

const sessionLengths = [
  { label: "1 hour", value: 1 },
  { label: "1.5 hours", value: 1.5 },
  { label: "2 hours", value: 2 },
  { label: "3 hours", value: 3 }
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric"
});

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short"
});

const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric"
});

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0
  }).format(amount);
}

function pluralize(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? "" : "s"}`;
}

function getAddonQuantity(selections: AddonSelection[], addonId: string): number {
  return selections.find((selection) => selection.addonId === addonId)?.quantity ?? 0;
}

function updateAddonQuantity(selections: AddonSelection[], addon: AddonConfig, delta: number): AddonSelection[] {
  const currentQuantity = getAddonQuantity(selections, addon.id);
  const nextQuantity = Math.min(addon.maxQuantity, Math.max(0, currentQuantity + delta));
  const remainingSelections = selections.filter((selection) => selection.addonId !== addon.id);

  if (nextQuantity === 0) {
    return remainingSelections;
  }

  return [...remainingSelections, { addonId: addon.id, quantity: nextQuantity }];
}

function getEndTimeLabel(slot: TimeSlot | null, hours: number): string {
  if (!slot) return "Select time";

  const [rawHour = "0", rawMinute = "0"] = slot.time.split(":");
  const startMinutes = Number(rawHour) * 60 + Number(rawMinute);
  const endMinutes = startMinutes + hours * 60;
  const normalizedMinutes = endMinutes % (24 * 60);
  const hour = Math.floor(normalizedMinutes / 60);
  const minute = normalizedMinutes % 60;
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
}

function getSlotTone(slot: TimeSlot): "standard" | "day" | "prime" | "special" | "disabled" {
  if (slot.status !== "available") return "disabled";

  const [rawHour = "0"] = slot.time.split(":");
  const hour = Number(rawHour);

  if (hour >= 10 && hour < 16) return "day";
  if (hour >= 16 && hour < 22) return "prime";
  if (hour >= 22 || hour < 9) return "standard";

  return "standard";
}

function getSlotClass(slot: TimeSlot, selected: boolean): string {
  if (selected) {
    return "vf-border-[#16A77A] vf-bg-[#16A77A] vf-text-white vf-shadow-[0_12px_24px_rgba(22,167,122,0.22)]";
  }

  const tone = getSlotTone(slot);

  if (tone === "disabled") {
    return "vf-cursor-not-allowed vf-border-[#E5E7E5] vf-bg-[#EEF1EF] vf-text-[#91A09A]";
  }

  if (tone === "day") {
    return "vf-border-[#16A77A] vf-bg-[#FFF7D6] vf-text-[#8A4F13] hover:vf-bg-[#FFF1BD]";
  }

  if (tone === "prime") {
    return "vf-border-[#16A77A] vf-bg-[#FFE8D2] vf-text-[#933C16] hover:vf-bg-[#FFDEC0]";
  }

  if (tone === "special") {
    return "vf-border-[#16A77A] vf-bg-[#EAF4FF] vf-text-[#145C99] hover:vf-bg-[#DCEEFF]";
  }

  return "vf-border-[#16A77A] vf-bg-white vf-text-[#081915] hover:vf-bg-[#F4FBF8]";
}

function CourtDiagram({ index, selected }: { index: number; selected: boolean }) {
  return (
    <div className="vf-relative vf-h-64 vf-overflow-hidden vf-rounded-[1.4rem] vf-bg-[#24272A] sm:vf-h-72">
      <div className="vf-absolute vf-inset-x-[22%] vf-top-[9%] vf-h-[82%] vf-border-[3px] vf-border-white/35" />
      <div className="vf-absolute vf-left-[22%] vf-right-[22%] vf-top-1/2 vf-h-[4px] vf--translate-y-1/2 vf-bg-[#B55F26]" />
      <div className="vf-absolute vf-left-[22%] vf-right-[22%] vf-top-[28%] vf-h-[3px] vf-bg-white/30" />
      <div className="vf-absolute vf-left-[22%] vf-right-[22%] vf-bottom-[28%] vf-h-[3px] vf-bg-white/30" />
      <div className="vf-absolute vf-left-1/2 vf-top-[9%] vf-h-[82%] vf-w-[3px] vf--translate-x-1/2 vf-bg-white/30" />
      <div className="vf-absolute vf-inset-x-[22%] vf-top-1/2 vf-h-[26%] vf--translate-y-1/2 vf-bg-[#B55F26]" />

      <div className="vf-absolute vf-inset-0 vf-flex vf-items-center vf-justify-center">
        <span className="vf-text-5xl vf-font-black vf-text-white vf-drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]">
          {index + 1}
        </span>
      </div>

      <div
        className="vf-absolute vf-inset-x-0 vf-bottom-0 vf-py-3 vf-text-center vf-text-sm vf-font-black vf-uppercase vf-tracking-[0.08em] vf-text-white"
        style={{ backgroundColor: selected ? accent : "rgba(0,0,0,0.35)" }}
      >
        Court {index + 1}
      </div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="vf-inline-flex vf-items-center vf-gap-2 vf-text-sm vf-text-[#557066]">
      <span className={`vf-h-3 vf-w-3 vf-rounded-full ${className}`} />
      {label}
    </span>
  );
}

function FloatingContactActions() {
  return (
    <div className="vf-fixed vf-bottom-24 vf-right-4 vf-z-40 vf-flex vf-flex-col vf-gap-3 lg:vf-bottom-8 lg:vf-right-8">
      <a
        href={profile.brand.contact.chatUrl}
        className="vf-flex vf-h-12 vf-w-12 vf-items-center vf-justify-center vf-rounded-full vf-bg-[#0B74FF] vf-text-xl vf-text-white vf-shadow-[0_14px_30px_rgba(11,116,255,0.28)]"
        aria-label="Chat"
      >
        💬
      </a>
      <a
        href={`tel:${profile.brand.contact.phone}`}
        className="vf-flex vf-h-12 vf-w-12 vf-items-center vf-justify-center vf-rounded-full vf-bg-[#16A77A] vf-text-xl vf-text-white vf-shadow-[0_14px_30px_rgba(22,167,122,0.28)]"
        aria-label="Call"
      >
        ☎
      </a>
      <a
        href={`sms:${profile.brand.contact.sms}`}
        className="vf-flex vf-h-12 vf-w-12 vf-items-center vf-justify-center vf-rounded-full vf-border vf-border-[#D8E7E1] vf-bg-white vf-text-xs vf-font-black vf-text-[#16A77A] vf-shadow-[0_14px_30px_rgba(0,0,0,0.12)]"
        aria-label="SMS"
      >
        SMS
      </a>
    </div>
  );
}

export default function CourtFlowPage() {
  const dates = useMemo(() => getUpcomingDates(profile.bookingWindowDays), []);
  const operatingHours = profile.operatingHours;

  const [selectedDate, setSelectedDate] = useState(dates[0] ?? new Date());
  const [selectedCourtId, setSelectedCourtId] = useState(profile.resources[0]?.id ?? "");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [sessionLength, setSessionLength] = useState(2);
  const [viewMode, setViewMode] = useState<ViewMode>("court");
  const [addonSelections, setAddonSelections] = useState<AddonSelection[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const selectedCourt = profile.resources.find((court) => court.id === selectedCourtId) ?? profile.resources[0];

  const slotsByCourt = useMemo(() => {
    if (!operatingHours) return new Map<string, TimeSlot[]>();

    return new Map(
      profile.resources.map((court) => [
        court.id,
        generateTimeSlots(selectedDate, court.id, operatingHours)
      ])
    );
  }, [selectedDate, operatingHours]);

  const selectedCourtSlots = slotsByCourt.get(selectedCourtId) ?? [];
  const timeRows = selectedCourtSlots.map((slot) => slot.time);

  const courtSubtotal = selectedCourt ? selectedCourt.rate * sessionLength : 0;
  const addonSubtotal = calculateAddonTotal(profile.addons, addonSelections);
  const total = courtSubtotal + addonSubtotal;
  const canReserve = Boolean(selectedCourt && selectedSlot);

  function selectDate(date: Date) {
    setSelectedDate(date);
    setSelectedSlot(null);
    setAddonSelections([]);
  }

  function selectCourt(court: ResourceConfig) {
    setSelectedCourtId(court.id);
    setSelectedSlot(null);
    setAddonSelections([]);
  }

  function selectCalendarSlot(court: ResourceConfig, slot: TimeSlot) {
    if (slot.status !== "available") return;

    setSelectedCourtId(court.id);
    setSelectedSlot(slot);
  }

  function selectCourtSlot(slot: TimeSlot) {
    if (slot.status !== "available") return;

    setSelectedSlot((current) => (current?.id === slot.id ? null : slot));
  }

  function changeAddon(addon: AddonConfig, delta: number) {
    setAddonSelections((current) => updateAddonQuantity(current, addon, delta));
  }

  function finishReservation() {
    setShowSummary(false);
    setSelectedSlot(null);
    setAddonSelections([]);
  }

  const heroStyle: CSSProperties = {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(246,250,247,0.98) 82%), linear-gradient(90deg, rgba(246,250,247,0.08), rgba(246,250,247,0.15)), repeating-linear-gradient(90deg, transparent 0 180px, rgba(255,255,255,0.85) 180px 184px), repeating-linear-gradient(0deg, #B96531 0 86px, #C8753F 86px 180px, #DDE2DE 180px 360px)"
  };

  return (
    <main className="vf-min-h-screen vf-overflow-x-hidden vf-bg-[#F6FAF7] vf-pb-28 vf-text-[#071815] lg:vf-pb-0">
      <header className="vf-sticky vf-top-0 vf-z-50 vf-border-b vf-border-[#D9E6E0] vf-bg-white/95 vf-backdrop-blur">
        <div className="vf-mx-auto vf-flex vf-h-20 vf-w-full vf-max-w-7xl vf-items-center vf-justify-between vf-gap-4 vf-px-4 sm:vf-px-6">
          <a href="/" className="vf-flex vf-min-w-0 vf-items-center vf-gap-3">
            <div className="vf-flex vf-h-11 vf-w-11 vf-shrink-0 vf-items-center vf-justify-center vf-rounded-xl vf-bg-[#EAF8F2] vf-text-xl vf-font-black vf-text-[#16A77A]">
              △
            </div>
            <div className="vf-min-w-0">
              <p className="vf-truncate vf-text-lg vf-font-black vf-uppercase vf-tracking-tight vf-text-[#111E1A]">
                CourtFlow
              </p>
              <p className="vf-truncate vf-text-[11px] vf-font-semibold vf-uppercase vf-tracking-[0.24em] vf-text-[#78938A]">
                Demo booking
              </p>
            </div>
          </a>

          <nav className="vf-hidden vf-items-center vf-gap-3 md:vf-flex">
            <a
              href="#booking"
              className="vf-inline-flex vf-items-center vf-gap-2 vf-rounded-xl vf-bg-[#E8F8F1] vf-px-5 vf-py-3 vf-text-sm vf-font-black vf-text-[#16A77A]"
            >
              ⌂ Book a Court
            </a>
            <a
              href="/bookings"
              className="vf-inline-flex vf-items-center vf-gap-2 vf-rounded-xl vf-px-5 vf-py-3 vf-text-sm vf-font-semibold vf-text-[#64776F] hover:vf-bg-[#F0F6F3]"
            >
              ☰ My Bookings
            </a>
          </nav>

          <button
            type="button"
            onClick={() => setShowSummary(true)}
            className="vf-flex vf-h-11 vf-w-11 vf-shrink-0 vf-items-center vf-justify-center vf-rounded-xl vf-text-xl vf-text-[#071815] hover:vf-bg-[#F0F6F3]"
            aria-label="Open cart"
          >
            🛒
          </button>
        </div>
      </header>

      <section
        className="vf-relative vf-min-h-[340px] vf-overflow-hidden vf-px-4 vf-py-16 sm:vf-px-6 md:vf-min-h-[430px] md:vf-py-24"
        style={heroStyle}
      >
        <div className="vf-absolute vf-inset-0 vf-bg-[radial-gradient(circle_at_50%_65%,rgba(255,255,255,0.90),rgba(246,250,247,0.45)_36%,rgba(246,250,247,0.96)_72%)]" />
        <div className="vf-relative vf-mx-auto vf-flex vf-h-full vf-w-full vf-max-w-7xl vf-items-end">
          <div className="vf-max-w-4xl">
            <p className="vf-text-xs vf-font-black vf-uppercase vf-tracking-[0.26em] vf-text-[#16A77A]">
              Pickleball · Badminton · Training
            </p>
            <h1 className="vf-mt-5 vf-max-w-4xl vf-text-4xl vf-font-black vf-uppercase vf-leading-[0.95] vf-tracking-[-0.055em] vf-text-[#071815] sm:vf-text-5xl md:vf-text-7xl">
              {profile.brand.heroTitle}
            </h1>
            <p className="vf-mt-5 vf-max-w-2xl vf-text-base vf-leading-7 vf-text-[#506B61] md:vf-text-lg">
              {profile.brand.heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      <section id="booking" className="vf-mx-auto vf-w-full vf-max-w-7xl vf-px-4 vf-py-10 sm:vf-px-6 md:vf-py-14">
        <section className="vf-space-y-7">
          <div className="vf-flex vf-items-center vf-gap-3">
            <span className="vf-flex vf-h-9 vf-w-9 vf-items-center vf-justify-center vf-rounded-full vf-bg-[#16A77A] vf-text-sm vf-font-black vf-text-white">
              1
            </span>
            <h2 className="vf-text-2xl vf-font-black vf-tracking-[-0.03em] vf-text-[#071815]">
              Pick a Date
            </h2>
          </div>

          <div className="vf-scrollbar-hide vf-flex vf-gap-3 vf-overflow-x-auto vf-pb-2">
            {dates.map((date, index) => {
              const selected = isSameDay(date, selectedDate);

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => selectDate(date)}
                  className="vf-relative vf-h-28 vf-w-20 vf-shrink-0 vf-rounded-2xl vf-border vf-border-[#D9E6E0] vf-bg-white vf-text-center vf-transition hover:vf-border-[#16A77A] active:vf-scale-[0.98] sm:vf-h-32 sm:vf-w-24"
                  style={
                    selected
                      ? {
                          backgroundColor: accent,
                          borderColor: accent,
                          color: "white",
                          boxShadow: "0 16px 30px rgba(22,167,122,0.22)"
                        }
                      : undefined
                  }
                >
                  <span className="vf-block vf-pt-5 vf-text-xs vf-font-semibold vf-uppercase vf-tracking-[0.14em] vf-opacity-70">
                    {index === 0 ? "Today" : weekdayFormatter.format(date)}
                  </span>
                  <span className="vf-mt-2 vf-block vf-text-3xl vf-font-black">
                    {date.getDate()}
                  </span>
                  <span className="vf-mt-1 vf-block vf-text-xs vf-font-medium vf-opacity-75">
                    {dateFormatter.format(date).split(" ")[0]}
                  </span>
                  {selected ? (
                    <span className="vf-absolute vf-bottom-3 vf-left-1/2 vf-h-1.5 vf-w-1.5 vf--translate-x-1/2 vf-rounded-full vf-bg-white" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="vf-rounded-2xl vf-border vf-border-[#D9E6E0] vf-bg-white/80 vf-px-5 vf-py-4">
            <p className="vf-text-sm vf-text-[#506B61]">
              <span className="vf-mr-3 vf-font-black vf-text-[#071815]">Operating hours</span>
              8:00 AM – 12:00 AM
            </p>
          </div>

          <div className="vf-flex vf-flex-wrap vf-gap-3">
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className="vf-rounded-xl vf-border vf-border-[#D9E6E0] vf-px-5 vf-py-3 vf-text-sm vf-font-black vf-transition"
              style={viewMode === "calendar" ? { backgroundColor: accent, borderColor: accent, color: "white" } : undefined}
            >
              ▣ Calendar View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("court")}
              className="vf-rounded-xl vf-border vf-border-[#D9E6E0] vf-px-5 vf-py-3 vf-text-sm vf-font-black vf-transition"
              style={viewMode === "court" ? { backgroundColor: accent, borderColor: accent, color: "white" } : undefined}
            >
              ▦ Court View
            </button>
          </div>
        </section>

        {viewMode === "court" ? (
          <section className="vf-mt-14 vf-space-y-7">
            <div className="vf-flex vf-items-center vf-gap-3">
              <span className="vf-flex vf-h-9 vf-w-9 vf-items-center vf-justify-center vf-rounded-full vf-bg-[#16A77A] vf-text-sm vf-font-black vf-text-white">
                2
              </span>
              <h2 className="vf-text-2xl vf-font-black vf-tracking-[-0.03em] vf-text-[#071815]">
                Choose a Court
              </h2>
            </div>

            <div className="vf-grid vf-gap-4 md:vf-grid-cols-2 xl:vf-grid-cols-5">
              {profile.resources.map((court, index) => {
                const selected = court.id === selectedCourtId;

                return (
                  <button
                    key={court.id}
                    type="button"
                    onClick={() => selectCourt(court)}
                    className="vf-rounded-[1.45rem] vf-border vf-bg-white vf-p-1.5 vf-text-left vf-transition hover:vf-shadow-[0_12px_28px_rgba(0,0,0,0.10)]"
                    style={{
                      borderColor: selected ? accent : "#D9E6E0",
                      boxShadow: selected ? `0 0 0 2px ${accent}66` : undefined
                    }}
                  >
                    <CourtDiagram index={index} selected={selected} />
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="vf-mt-14 vf-space-y-7">
          <div className="vf-flex vf-flex-col vf-gap-4 md:vf-flex-row md:vf-items-end md:vf-justify-between">
            <div className="vf-flex vf-items-center vf-gap-3">
              <span className="vf-flex vf-h-9 vf-w-9 vf-items-center vf-justify-center vf-rounded-full vf-bg-[#16A77A] vf-text-sm vf-font-black vf-text-white">
                {viewMode === "court" ? "3" : "2"}
              </span>
              <h2 className="vf-text-2xl vf-font-black vf-tracking-[-0.03em] vf-text-[#071815]">
                Session length &amp; time
              </h2>
            </div>

            <p className="vf-text-sm vf-text-[#506B61]">
              {longDateFormatter.format(selectedDate)}
              {selectedCourt ? ` · ${selectedCourt.label}` : ""}
            </p>
          </div>

          <div className="vf-flex vf-flex-wrap vf-gap-x-4 vf-gap-y-2">
            <LegendDot className="vf-bg-[#4D9EFF]" label="Special Pricing" />
            <LegendDot className="vf-border vf-border-[#16A77A] vf-bg-white" label="Available" />
            <LegendDot className="vf-bg-[#FFE8D2]" label="Prime ₱/hr" />
            <LegendDot className="vf-bg-[#FFF7D6]" label="Day ₱/hr" />
            <LegendDot className="vf-bg-[#EEF1EF]" label="Unavailable" />
          </div>

          <div className="vf-grid vf-gap-2 sm:vf-grid-cols-4">
            {sessionLengths.map((session) => {
              const selected = session.value === sessionLength;

              return (
                <button
                  key={session.value}
                  type="button"
                  onClick={() => setSessionLength(session.value)}
                  className="vf-rounded-xl vf-border vf-border-[#D9E6E0] vf-bg-white vf-px-5 vf-py-3 vf-text-sm vf-font-black vf-transition hover:vf-border-[#16A77A]"
                  style={selected ? { backgroundColor: accent, borderColor: accent, color: "white" } : undefined}
                >
                  {session.label}
                </button>
              );
            })}
          </div>

          {viewMode === "calendar" ? (
            <div className="vf-overflow-x-auto vf-rounded-2xl vf-border vf-border-[#D9E6E0] vf-bg-white vf-p-4">
              <div className="vf-min-w-[980px]">
                <div className="vf-grid vf-grid-cols-[90px_repeat(5,1fr)] vf-border-b vf-border-[#D9E6E0] vf-bg-[#F1F6F3]">
                  <div className="vf-p-4 vf-text-center vf-text-xs vf-font-black vf-uppercase vf-tracking-[0.12em] vf-text-[#64776F]">
                    Time
                  </div>
                  {profile.resources.map((court) => (
                    <div key={court.id} className="vf-border-l vf-border-[#D9E6E0] vf-p-4 vf-text-center vf-text-sm vf-font-black">
                      {court.label}
                    </div>
                  ))}
                </div>

                {timeRows.map((time) => (
                  <div key={time} className="vf-grid vf-grid-cols-[90px_repeat(5,1fr)] vf-border-b vf-border-[#E8EFEB] last:vf-border-b-0">
                    <div className="vf-flex vf-items-center vf-justify-center vf-p-3 vf-text-sm vf-font-medium vf-text-[#506B61]">
                      {selectedCourtSlots.find((slot) => slot.time === time)?.displayTime ?? time}
                    </div>

                    {profile.resources.map((court) => {
                      const slots = slotsByCourt.get(court.id) ?? [];
                      const slot = slots.find((item) => item.time === time);
                      const selected = selectedCourtId === court.id && selectedSlot?.time === time;

                      if (!slot) {
                        return (
                          <div key={`${court.id}-${time}`} className="vf-border-l vf-border-[#E8EFEB] vf-p-1.5">
                            <div className="vf-h-12 vf-rounded-xl vf-bg-[#EEF1EF]" />
                          </div>
                        );
                      }

                      return (
                        <div key={`${court.id}-${time}`} className="vf-border-l vf-border-[#E8EFEB] vf-p-1.5">
                          <button
                            type="button"
                            disabled={slot.status !== "available"}
                            onClick={() => selectCalendarSlot(court, slot)}
                            className={`vf-h-12 vf-w-full vf-rounded-xl vf-border vf-text-xs vf-font-black vf-uppercase vf-transition ${getSlotClass(slot, selected)}`}
                          >
                            {slot.status === "available" ? "Vacant" : slot.status}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="vf-grid vf-grid-cols-2 vf-gap-3 sm:vf-grid-cols-3 md:vf-grid-cols-4 xl:vf-grid-cols-7">
              {selectedCourtSlots.map((slot) => {
                const selected = selectedSlot?.id === slot.id;
                const rate = selectedCourt?.rate ?? 0;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={slot.status !== "available"}
                    onClick={() => selectCourtSlot(slot)}
                    className={`vf-rounded-xl vf-border vf-px-4 vf-py-4 vf-text-center vf-transition ${getSlotClass(slot, selected)}`}
                  >
                    <span className="vf-block vf-text-base vf-font-black">{slot.displayTime}</span>
                    <span className="vf-mt-1 vf-block vf-text-xs vf-opacity-75">
                      {slot.status === "available" ? formatCurrency(rate * sessionLength) : slot.status}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="vf-mt-14 vf-space-y-6">
          <div className="vf-flex vf-items-center vf-gap-3">
            <span className="vf-flex vf-h-9 vf-w-9 vf-items-center vf-justify-center vf-rounded-full vf-bg-[#16A77A] vf-text-sm vf-font-black vf-text-white">
              {viewMode === "court" ? "4" : "3"}
            </span>
            <h2 className="vf-text-2xl vf-font-black vf-tracking-[-0.03em] vf-text-[#071815]">
              Court add-ons
            </h2>
          </div>

          <div className="vf-grid vf-gap-3 md:vf-grid-cols-2">
            {profile.addons.map((addon) => {
              const quantity = getAddonQuantity(addonSelections, addon.id);

              return (
                <div key={addon.id} className="vf-rounded-2xl vf-border vf-border-[#D9E6E0] vf-bg-white vf-p-4">
                  <div className="vf-flex vf-flex-col vf-gap-4 sm:vf-flex-row sm:vf-items-start sm:vf-justify-between">
                    <div>
                      <h3 className="vf-font-black vf-text-[#071815]">{addon.label}</h3>
                      <p className="vf-mt-1 vf-text-sm vf-leading-6 vf-text-[#506B61]">{addon.description}</p>
                      <p className="vf-mt-2 vf-text-sm vf-font-black">{formatCurrency(addon.price)}</p>
                    </div>

                    <div className="vf-flex vf-shrink-0 vf-items-center vf-gap-2">
                      <button
                        type="button"
                        onClick={() => changeAddon(addon, -1)}
                        className="vf-flex vf-h-9 vf-w-9 vf-items-center vf-justify-center vf-rounded-full vf-border vf-border-[#D9E6E0] vf-bg-white vf-font-black"
                      >
                        −
                      </button>
                      <span className="vf-w-6 vf-text-center vf-text-sm vf-font-black">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => changeAddon(addon, 1)}
                        className="vf-flex vf-h-9 vf-w-9 vf-items-center vf-justify-center vf-rounded-full vf-font-black vf-text-white"
                        style={{ backgroundColor: accent }}
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
      </section>

      <div className="vf-fixed vf-inset-x-0 vf-bottom-0 vf-z-40 vf-border-t vf-border-[#D9E6E0] vf-bg-white/95 vf-px-4 vf-py-3 vf-backdrop-blur">
        <div className="vf-mx-auto vf-flex vf-max-w-7xl vf-items-center vf-justify-between vf-gap-4">
          <div className="vf-min-w-0">
            <p className="vf-truncate vf-text-sm vf-font-black vf-text-[#071815]">
              {selectedCourt?.label ?? "Court reservation"}
            </p>
            <p className="vf-mt-0.5 vf-truncate vf-text-xs vf-text-[#506B61]">
              {selectedSlot
                ? `${dateFormatter.format(selectedDate)} · ${selectedSlot.displayTime}–${getEndTimeLabel(selectedSlot, sessionLength)} · ${pluralize(sessionLength, "hour")} · ${formatCurrency(total)}`
                : profile.copy.emptyCheckout}
            </p>
          </div>

          <button
            type="button"
            disabled={!canReserve}
            onClick={() => setShowSummary(true)}
            className="vf-shrink-0 vf-rounded-xl vf-px-5 vf-py-3 vf-text-sm vf-font-black vf-text-white disabled:vf-bg-[#A9B8B1]"
            style={canReserve ? { backgroundColor: accent } : undefined}
          >
            Reserve
          </button>
        </div>
      </div>

      <FloatingContactActions />

      {showSummary ? (
        <div className="vf-fixed vf-inset-0 vf-z-[60] vf-flex vf-items-end vf-justify-center vf-bg-[#071815]/55 vf-px-4 vf-backdrop-blur-sm sm:vf-items-center">
          <button type="button" aria-label="Close summary" className="vf-absolute vf-inset-0" onClick={() => setShowSummary(false)} />

          <section className="vf-relative vf-w-full vf-max-w-lg vf-rounded-t-[2rem] vf-bg-white vf-p-5 vf-shadow-[0_24px_90px_rgba(0,0,0,0.25)] sm:vf-rounded-[2rem] sm:vf-p-6">
            <div className="vf-mx-auto vf-mb-5 vf-h-1.5 vf-w-14 vf-rounded-full vf-bg-[#D9E6E0] sm:vf-hidden" />

            <div className="vf-flex vf-items-start vf-justify-between vf-gap-4">
              <div>
                <p className="vf-text-xs vf-font-black vf-uppercase vf-tracking-[0.18em] vf-text-[#16A77A]">Review booking</p>
                <h2 className="vf-mt-2 vf-text-3xl vf-font-black vf-tracking-[-0.04em]">Court reservation</h2>
              </div>
              <button type="button" onClick={() => setShowSummary(false)} className="vf-rounded-full vf-border vf-border-[#D9E6E0] vf-px-4 vf-py-2 vf-text-sm vf-font-black">
                Close
              </button>
            </div>

            <div className="vf-mt-5 vf-rounded-2xl vf-bg-[#F1F8F4] vf-p-4">
              <p className="vf-font-black">{selectedCourt?.label}</p>
              <p className="vf-mt-1 vf-text-sm vf-leading-6 vf-text-[#506B61]">
                {longDateFormatter.format(selectedDate)}
                {selectedSlot ? ` · ${selectedSlot.displayTime}–${getEndTimeLabel(selectedSlot, sessionLength)}` : ""}
                {" · "}
                {pluralize(sessionLength, "hour")}
              </p>
            </div>

            <div className="vf-mt-5 vf-space-y-3">
              <div className="vf-flex vf-justify-between vf-text-sm vf-text-[#506B61]">
                <span>Court session</span>
                <span>{formatCurrency(courtSubtotal)}</span>
              </div>
              <div className="vf-flex vf-justify-between vf-text-sm vf-text-[#506B61]">
                <span>Add-ons</span>
                <span>{formatCurrency(addonSubtotal)}</span>
              </div>
              <div className="vf-border-t vf-border-[#D9E6E0] vf-pt-4">
                <div className="vf-flex vf-justify-between vf-text-2xl vf-font-black">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={finishReservation}
              className="vf-mt-6 vf-w-full vf-rounded-xl vf-px-5 vf-py-3 vf-text-sm vf-font-black vf-text-white"
              style={{ backgroundColor: accent }}
            >
              Confirm reservation
            </button>
          </section>
        </div>
      ) : null}
    </main>
  );
}