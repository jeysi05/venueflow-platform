"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { addDays, formatLongDate, formatShortDate, formatWeekday, getUpcomingDates, isSameDay } from "../lib/dates";
import { generateTimeSlots } from "../lib/slots";
import { calculateAddonTotal, calculateBaseTotal, calculateReservationTotal, getDurationUnits } from "../lib/pricing";
import { formatCurrency } from "../lib/format";
import type { AddonSelection, BookingProfile, ResourceConfig, TimeSlot } from "../types";

interface BookingSiteProps {
  profile: BookingProfile;
}

export function BookingSite({ profile }: BookingSiteProps) {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(() => (profile.mode === "nightly" ? addDays(new Date(), 1) : null));
  const [selectedResourceId, setSelectedResourceId] = useState(profile.resources[0]?.id ?? "");
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [addons, setAddons] = useState<AddonSelection[]>([]);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const selectedResource = profile.resources.find((resource) => resource.id === selectedResourceId) ?? profile.resources[0];
  const slots = useMemo(() => {
    if (profile.mode !== "hourly" || !profile.operatingHours || !selectedResource) return [];
    return generateTimeSlots(selectedDate, selectedResource.id, profile.operatingHours);
  }, [profile.mode, profile.operatingHours, selectedDate, selectedResource]);

  const durationUnits = selectedResource ? getDurationUnits(profile.mode, selectedSlots, selectedDate, checkOutDate) : 0;
  const baseTotal = selectedResource ? calculateBaseTotal(profile.mode, selectedResource, selectedSlots, selectedDate, checkOutDate) : 0;
  const addonTotal = calculateAddonTotal(profile.addons, addons);
  const total = selectedResource ? calculateReservationTotal(profile.mode, selectedResource, selectedSlots, selectedDate, checkOutDate, profile.addons, addons) : 0;
  const canReserve = Boolean(selectedResource) && (profile.mode !== "hourly" || selectedSlots.length > 0);

  function selectResource(resource: ResourceConfig) {
    setSelectedResourceId(resource.id);
    setSelectedSlots([]);
    setAddons([]);
  }

  function selectDate(date: Date) {
    setSelectedDate(date);
    setSelectedSlots([]);
    if (profile.mode === "nightly" && (!checkOutDate || checkOutDate <= date)) {
      setCheckOutDate(addDays(date, 1));
    }
  }

  function toggleSlot(slot: TimeSlot) {
    if (slot.status !== "available") return;
    setSelectedSlots((current) => {
      const exists = current.some((item) => item.id === slot.id);
      return exists ? current.filter((item) => item.id !== slot.id) : [...current, slot].sort((a, b) => a.time.localeCompare(b.time));
    });
  }

  function setAddonQuantity(addonId: string, quantity: number) {
    setAddons((current) => {
      const filtered = current.filter((addon) => addon.addonId !== addonId);
      return quantity > 0 ? [...filtered, { addonId, quantity }] : filtered;
    });
  }

  function completeReservation() {
    if (!canReserve) return;
    setIsSummaryOpen(false);
    setSelectedSlots([]);
    setAddons([]);
  }

  return (
    <main className="vf-min-h-screen vf-bg-[#F9F7F4] vf-pb-28 vf-text-[#1C1917]">
      <BookingHeader profile={profile} />
      <Hero profile={profile} />

      <div className="vf-mx-auto vf-max-w-4xl vf-space-y-6 vf-px-4 vf-py-8 sm:vf-px-6 md:vf-py-10">
        <DateSection profile={profile} selectedDate={selectedDate} checkOutDate={checkOutDate} onSelectDate={selectDate} onSelectCheckout={setCheckOutDate} />
        <ResourceSection profile={profile} selectedResourceId={selectedResourceId} onSelectResource={selectResource} />

        {selectedResource ? (
          profile.mode === "hourly" ? (
            <HourlySlotSection profile={profile} resource={selectedResource} slots={slots} selectedSlots={selectedSlots} onToggleSlot={toggleSlot} />
          ) : (
            <RateSummarySection profile={profile} resource={selectedResource} selectedDate={selectedDate} checkOutDate={checkOutDate} durationUnits={durationUnits} baseTotal={baseTotal} />
          )
        ) : null}

        <AddOnSection profile={profile} selections={addons} onSetQuantity={setAddonQuantity} />
        <BelowFoldPitch />
      </div>

      {selectedResource ? (
        <CheckoutBar
          profile={profile}
          resource={selectedResource}
          selectedDate={selectedDate}
          checkOutDate={checkOutDate}
          selectedSlots={selectedSlots}
          durationUnits={durationUnits}
          total={total}
          canReserve={canReserve}
          onOpen={() => setIsSummaryOpen(true)}
        />
      ) : null}

      {selectedResource ? (
        <SummaryDrawer
          profile={profile}
          isOpen={isSummaryOpen}
          onClose={() => setIsSummaryOpen(false)}
          resource={selectedResource}
          selectedDate={selectedDate}
          checkOutDate={checkOutDate}
          selectedSlots={selectedSlots}
          durationUnits={durationUnits}
          baseTotal={baseTotal}
          addonTotal={addonTotal}
          total={total}
          selections={addons}
          onSetQuantity={setAddonQuantity}
          onComplete={completeReservation}
          canReserve={canReserve}
        />
      ) : null}
    </main>
  );
}

function BookingHeader({ profile }: { profile: BookingProfile }) {
  return (
    <header className="vf-sticky vf-top-0 vf-z-40 vf-h-16 vf-border-b vf-border-[#E5E1DA] vf-bg-white/95 vf-backdrop-blur">
      <div className="vf-mx-auto vf-flex vf-h-full vf-max-w-6xl vf-items-center vf-justify-between vf-px-4 sm:vf-px-6">
        <a href="/" className="vf-flex vf-items-center vf-gap-3">
          <div className="vf-flex vf-h-10 vf-w-10 vf-items-center vf-justify-center vf-rounded-xl vf-text-sm vf-font-semibold vf-text-white" style={{ background: `linear-gradient(135deg, ${profile.brand.primaryColor}, #0f241a)` }}>
            {profile.brand.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="vf-text-sm vf-font-semibold vf-text-[#1C1917] sm:vf-text-base">{profile.brand.name}</p>
            <p className="vf-text-xs vf-text-[#78716C]">{profile.brand.eyebrow}</p>
          </div>
        </a>
        <a href="/bookings" className="vf-rounded-full vf-border vf-border-[#E5E1DA] vf-px-4 vf-py-2 vf-text-sm vf-font-medium vf-transition hover:vf-border-[#C5BFB8] hover:vf-bg-[#F9F7F4]">
          My Bookings
        </a>
      </div>
    </header>
  );
}

function Hero({ profile }: { profile: BookingProfile }) {
  const style: CSSProperties = {
    backgroundImage: `linear-gradient(90deg, rgba(28,25,23,0.58), rgba(28,25,23,0.28)), radial-gradient(circle at 15% 20%, rgba(255,255,255,0.36), transparent 22%), linear-gradient(135deg, #d8cfc1, ${profile.brand.primaryColor})`
  };

  return (
    <section className="vf-relative vf-h-[230px] vf-overflow-hidden vf-bg-[#F2F0EC] md:vf-h-[320px]" style={style}>
      <div className="vf-mx-auto vf-flex vf-h-full vf-max-w-5xl vf-items-end vf-px-4 vf-pb-8 sm:vf-px-6 md:vf-pb-10">
        <div className="vf-max-w-2xl vf-text-white">
          <p className="vf-mb-3 vf-text-xs vf-font-semibold vf-uppercase vf-tracking-[0.22em] vf-text-white/75">{profile.id.replaceAll("-", " ")}</p>
          <h1 className="vf-font-serif vf-text-4xl vf-leading-tight vf-tracking-[-0.03em] md:vf-text-5xl">{profile.brand.heroTitle}</h1>
          <p className="vf-mt-3 vf-max-w-xl vf-text-sm vf-leading-6 vf-text-white/90 md:vf-text-base">{profile.brand.heroSubtitle}</p>
        </div>
      </div>
    </section>
  );
}

function SectionCard({ children }: { children: ReactNode }) {
  return <section className="vf-rounded-3xl vf-border vf-border-[#E5E1DA] vf-bg-white vf-p-5 vf-shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:vf-p-6">{children}</section>;
}

function SectionLabel({ label, title, right }: { label: string; title: string; right?: React.ReactNode }) {
  return (
    <div className="vf-mb-4 vf-flex vf-items-end vf-justify-between vf-gap-4">
      <div>
        <p className="vf-text-[11px] vf-font-semibold vf-uppercase vf-tracking-[0.22em] vf-text-[#A8A29E]">{label}</p>
        <h2 className="vf-mt-1 vf-text-xl vf-font-medium vf-text-[#1C1917]">{title}</h2>
      </div>
      {right}
    </div>
  );
}

function DateSection({ profile, selectedDate, checkOutDate, onSelectDate, onSelectCheckout }: { profile: BookingProfile; selectedDate: Date; checkOutDate: Date | null; onSelectDate: (date: Date) => void; onSelectCheckout: (date: Date) => void }) {
  const dates = getUpcomingDates(profile.bookingWindowDays);
  return (
    <SectionCard>
      <SectionLabel label="Date" title={profile.copy.dateHeading} right={<p className="vf-text-sm vf-text-[#78716C]">Next {profile.bookingWindowDays} days</p>} />
      <div className="vf-scrollbar-hide vf-flex vf-snap-x vf-gap-3 vf-overflow-x-auto vf-pb-1">
        {dates.map((date, index) => {
          const selected = isSameDay(date, selectedDate);
          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onSelectDate(date)}
              className="vf-h-20 vf-w-16 vf-shrink-0 vf-snap-start vf-rounded-xl vf-border vf-border-[#E5E1DA] vf-bg-white vf-text-center vf-transition active:vf-scale-[0.98]"
              style={selected ? { backgroundColor: profile.brand.primaryColor, borderColor: profile.brand.primaryColor, color: "white" } : undefined}
            >
              <span className="vf-block vf-text-[10px] vf-font-medium vf-uppercase vf-tracking-wide vf-opacity-70">{index === 0 ? "Today" : formatWeekday(date)}</span>
              <span className="vf-mt-1 vf-block vf-text-sm vf-font-semibold">{formatShortDate(date)}</span>
            </button>
          );
        })}
      </div>

      {profile.mode === "nightly" ? (
        <div className="vf-mt-4 vf-rounded-2xl vf-bg-[#F9F7F4] vf-p-4">
          <p className="vf-mb-3 vf-text-sm vf-font-medium vf-text-[#1C1917]">Choose checkout date</p>
          <div className="vf-scrollbar-hide vf-flex vf-gap-3 vf-overflow-x-auto vf-pb-1">
            {dates.slice(1).map((date) => {
              const disabled = date <= selectedDate;
              const selected = checkOutDate ? isSameDay(date, checkOutDate) : false;
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectCheckout(date)}
                  className="vf-h-16 vf-min-w-24 vf-rounded-xl vf-border vf-border-[#E5E1DA] vf-bg-white vf-px-3 vf-text-center vf-text-sm vf-font-medium vf-transition disabled:vf-cursor-not-allowed disabled:vf-bg-[#F2F0EC] disabled:vf-text-[#A8A29E]"
                  style={selected ? { backgroundColor: profile.brand.primaryColor, borderColor: profile.brand.primaryColor, color: "white" } : undefined}
                >
                  {formatShortDate(date)}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </SectionCard>
  );
}

function ResourceSection({ profile, selectedResourceId, onSelectResource }: { profile: BookingProfile; selectedResourceId: string; onSelectResource: (resource: ResourceConfig) => void }) {
  return (
    <SectionCard>
      <SectionLabel label="Space" title={profile.copy.resourceHeading} />
      <div className="vf-grid vf-gap-4 sm:vf-grid-cols-2 lg:vf-grid-cols-3">
        {profile.resources.map((resource, index) => {
          const selected = resource.id === selectedResourceId;
          return (
            <button
              key={resource.id}
              type="button"
              onClick={() => onSelectResource(resource)}
              className="vf-group vf-rounded-2xl vf-border vf-border-[#E5E1DA] vf-bg-white vf-p-2 vf-text-left vf-shadow-[0_1px_3px_rgba(0,0,0,0.06)] vf-transition hover:vf-border-[#C5BFB8] hover:vf-shadow-[0_4px_16px_rgba(0,0,0,0.10)] active:vf-scale-[0.99]"
              style={selected ? { borderColor: profile.brand.primaryColor, boxShadow: `0 0 0 2px ${profile.brand.primaryColor}24` } : undefined}
            >
              <div
                className="vf-aspect-[4/3] vf-rounded-xl"
                style={{ background: `radial-gradient(circle at 20% 20%, rgba(255,255,255,.55), transparent 28%), linear-gradient(135deg, ${index % 2 ? "#b8aa98" : "#d6d0c7"}, ${profile.brand.primaryColor})` }}
              />
              <div className="vf-px-2 vf-pb-2 vf-pt-4">
                <p className="vf-font-serif vf-text-lg vf-font-semibold vf-text-[#1C1917]">{resource.label}</p>
                <p className="vf-mt-1 vf-text-[11px] vf-font-semibold vf-uppercase vf-tracking-[0.16em] vf-text-[#A8A29E]">{resource.meta}</p>
                <p className="vf-mt-2 vf-text-sm vf-leading-6 vf-text-[#78716C]">{resource.description}</p>
                <p className="vf-mt-3 vf-text-sm vf-font-semibold vf-text-[#1C1917]">{formatCurrency(resource.rate)} / {profile.copy.unitLabel}</p>
              </div>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}

function HourlySlotSection({ profile, resource, slots, selectedSlots, onToggleSlot }: { profile: BookingProfile; resource: ResourceConfig; slots: TimeSlot[]; selectedSlots: TimeSlot[]; onToggleSlot: (slot: TimeSlot) => void }) {
  return (
    <SectionCard>
      <SectionLabel label="Times" title={profile.copy.timeHeading} right={<p className="vf-text-sm vf-text-[#78716C]">{selectedSlots.length} selected</p>} />
      <div className="vf-mb-4 vf-rounded-2xl vf-border vf-border-[#E5E1DA] vf-bg-[#F9F7F4] vf-p-4">
        <div className="vf-flex vf-items-center vf-justify-between vf-gap-4 vf-text-sm">
          <span className="vf-text-[#78716C]">{resource.label}</span>
          <span className="vf-font-semibold vf-text-[#1C1917]">{formatCurrency(resource.rate)} / {profile.copy.unitLabel}</span>
        </div>
      </div>
      <div className="vf-grid vf-grid-cols-4 vf-gap-2 sm:vf-grid-cols-5 md:vf-grid-cols-6">
        {slots.map((slot) => {
          const selected = selectedSlots.some((item) => item.id === slot.id);
          const unavailable = slot.status !== "available";
          return (
            <button
              key={slot.id}
              type="button"
              disabled={unavailable}
              onClick={() => onToggleSlot(slot)}
              className="vf-rounded-xl vf-border vf-px-2 vf-py-3 vf-text-center vf-text-sm vf-transition active:vf-scale-[0.98] disabled:vf-cursor-not-allowed disabled:vf-bg-[#F2F0EC] disabled:vf-text-[#A8A29E]"
              style={selected ? { backgroundColor: profile.brand.primaryColor, borderColor: profile.brand.primaryColor, color: "white" } : { borderColor: "#E5E1DA", backgroundColor: unavailable ? "#F2F0EC" : "white" }}
            >
              <span className="vf-block vf-font-medium">{slot.displayTime}</span>
              <span className="vf-mt-1 vf-block vf-text-[11px] vf-opacity-70">{unavailable ? slot.status : formatCurrency(resource.rate)}</span>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}

function RateSummarySection({ profile, resource, selectedDate, checkOutDate, durationUnits, baseTotal }: { profile: BookingProfile; resource: ResourceConfig; selectedDate: Date; checkOutDate: Date | null; durationUnits: number; baseTotal: number }) {
  const dateText = profile.mode === "nightly" && checkOutDate ? `${formatShortDate(selectedDate)} – ${formatShortDate(checkOutDate)}` : formatShortDate(selectedDate);
  return (
    <SectionCard>
      <SectionLabel label="Rate" title="Review your selected dates" />
      <div className="vf-rounded-2xl vf-border vf-border-[#E5E1DA] vf-bg-[#F9F7F4] vf-p-4">
        <div className="vf-flex vf-items-center vf-justify-between vf-gap-4 vf-text-sm">
          <div>
            <p className="vf-font-medium vf-text-[#1C1917]">{resource.label}</p>
            <p className="vf-mt-1 vf-text-[#78716C]">{dateText} · {durationUnits} {durationUnits === 1 ? profile.copy.unitLabel : `${profile.copy.unitLabel}s`}</p>
          </div>
          <p className="vf-font-semibold vf-text-[#1C1917]">{formatCurrency(baseTotal)}</p>
        </div>
      </div>
    </SectionCard>
  );
}

function AddOnSection({ profile, selections, onSetQuantity }: { profile: BookingProfile; selections: AddonSelection[]; onSetQuantity: (addonId: string, quantity: number) => void }) {
  return (
    <SectionCard>
      <SectionLabel label="Optional" title={profile.copy.addOnHeading} />
      <div className="vf-grid vf-gap-3 sm:vf-grid-cols-2">
        {profile.addons.map((addon) => {
          const quantity = selections.find((item) => item.addonId === addon.id)?.quantity ?? 0;
          return (
            <div key={addon.id} className="vf-flex vf-items-center vf-justify-between vf-gap-4 vf-rounded-2xl vf-border vf-border-[#E5E1DA] vf-bg-[#F9F7F4] vf-p-4">
              <div>
                <p className="vf-font-medium vf-text-[#1C1917]">{addon.label}</p>
                <p className="vf-mt-1 vf-text-sm vf-text-[#78716C]">{addon.description}</p>
                <p className="vf-mt-2 vf-text-sm vf-font-semibold vf-text-[#1C1917]">+ {formatCurrency(addon.price)}</p>
              </div>
              <div className="vf-flex vf-items-center vf-gap-2 vf-rounded-full vf-bg-white vf-p-1">
                <button type="button" className="vf-h-8 vf-w-8 vf-rounded-full vf-border vf-border-[#E5E1DA]" onClick={() => onSetQuantity(addon.id, Math.max(0, quantity - 1))}>−</button>
                <span className="vf-w-5 vf-text-center vf-text-sm vf-font-semibold">{quantity}</span>
                <button type="button" className="vf-h-8 vf-w-8 vf-rounded-full vf-text-white" style={{ backgroundColor: profile.brand.primaryColor }} onClick={() => onSetQuantity(addon.id, Math.min(addon.maxQuantity, quantity + 1))}>+</button>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function CheckoutBar({ profile, resource, selectedDate, checkOutDate, selectedSlots, durationUnits, total, canReserve, onOpen }: { profile: BookingProfile; resource: ResourceConfig; selectedDate: Date; checkOutDate: Date | null; selectedSlots: TimeSlot[]; durationUnits: number; total: number; canReserve: boolean; onOpen: () => void }) {
  const dateText = profile.mode === "nightly" && checkOutDate ? `${formatShortDate(selectedDate)} – ${formatShortDate(checkOutDate)}` : formatShortDate(selectedDate);
  const durationText = profile.mode === "hourly" ? `${selectedSlots.length} ${selectedSlots.length === 1 ? "hour" : "hours"}` : `${durationUnits} ${durationUnits === 1 ? profile.copy.unitLabel : `${profile.copy.unitLabel}s`}`;
  return (
    <nav className="vf-fixed vf-inset-x-0 vf-bottom-0 vf-z-40 vf-border-t vf-border-[#E5E1DA] vf-bg-white/95 vf-px-4 vf-py-3 vf-backdrop-blur">
      <div className="vf-mx-auto vf-grid vf-max-w-4xl vf-grid-cols-[1fr_auto] vf-items-center vf-gap-3">
        <button type="button" onClick={onOpen} className="vf-min-w-0 vf-text-left">
          {canReserve ? (
            <>
              <p className="vf-truncate vf-text-sm vf-font-medium vf-text-[#1C1917]">{resource.label}</p>
              <p className="vf-mt-0.5 vf-text-xs vf-text-[#78716C]">{dateText} · {durationText} · {formatCurrency(total)}</p>
            </>
          ) : (
            <p className="vf-text-sm vf-font-medium vf-text-[#78716C]">{profile.copy.emptyCheckout}</p>
          )}
        </button>
        <button
          type="button"
          disabled={!canReserve}
          onClick={onOpen}
          className="vf-rounded-xl vf-px-5 vf-py-3 vf-text-sm vf-font-medium vf-text-white vf-transition active:vf-scale-[0.98] disabled:vf-cursor-not-allowed disabled:vf-bg-[#C5BFB8]"
          style={canReserve ? { backgroundColor: profile.brand.primaryColor } : undefined}
        >
          {profile.copy.reserveCta}
        </button>
      </div>
    </nav>
  );
}

function SummaryDrawer({ profile, isOpen, onClose, resource, selectedDate, checkOutDate, selectedSlots, durationUnits, baseTotal, addonTotal, total, selections, onSetQuantity, onComplete, canReserve }: { profile: BookingProfile; isOpen: boolean; onClose: () => void; resource: ResourceConfig; selectedDate: Date; checkOutDate: Date | null; selectedSlots: TimeSlot[]; durationUnits: number; baseTotal: number; addonTotal: number; total: number; selections: AddonSelection[]; onSetQuantity: (addonId: string, quantity: number) => void; onComplete: () => void; canReserve: boolean }) {
  if (!isOpen) return null;
  const dateText = profile.mode === "nightly" && checkOutDate ? `${formatLongDate(selectedDate)} – ${formatLongDate(checkOutDate)}` : formatLongDate(selectedDate);
  return (
    <div className="vf-fixed vf-inset-0 vf-z-50 vf-flex vf-items-end vf-justify-center vf-bg-slate-950/45 vf-px-3 vf-backdrop-blur-sm" role="dialog" aria-modal="true">
      <button type="button" className="vf-absolute vf-inset-0" onClick={onClose} aria-label="Close summary" />
      <section className="vf-relative vf-max-h-[86vh] vf-w-full vf-max-w-lg vf-overflow-y-auto vf-rounded-t-[2rem] vf-border vf-border-white/70 vf-bg-[#fffdfa] vf-p-5 vf-shadow-[0_-28px_90px_rgba(15,23,42,0.26)] sm:vf-mb-4 sm:vf-rounded-[2rem]">
        <div className="vf-mx-auto vf-mb-4 vf-h-1.5 vf-w-14 vf-rounded-full vf-bg-[#E5E1DA]" />
        <div className="vf-mb-5 vf-flex vf-items-start vf-justify-between vf-gap-4">
          <div>
            <p className="vf-text-[11px] vf-font-semibold vf-uppercase vf-tracking-[0.22em] vf-text-[#A8A29E]">Reservation summary</p>
            <h2 className="vf-mt-1 vf-font-serif vf-text-3xl vf-text-[#1C1917]">Confirm your booking</h2>
          </div>
          <button type="button" onClick={onClose} className="vf-rounded-full vf-border vf-border-[#E5E1DA] vf-bg-white vf-px-4 vf-py-2 vf-text-xs vf-font-semibold vf-text-[#78716C]">Close</button>
        </div>

        <div className="vf-rounded-2xl vf-border vf-border-[#E5E1DA] vf-bg-white vf-p-4">
          <p className="vf-font-medium vf-text-[#1C1917]">{resource.label}</p>
          <p className="vf-mt-1 vf-text-sm vf-text-[#78716C]">{dateText}</p>
          <p className="vf-mt-1 vf-text-sm vf-text-[#78716C]">{durationUnits} {durationUnits === 1 ? profile.copy.unitLabel : `${profile.copy.unitLabel}s`}</p>
        </div>

        {profile.mode === "hourly" && selectedSlots.length ? (
          <div className="vf-mt-4 vf-space-y-2">
            {selectedSlots.map((slot) => <div key={slot.id} className="vf-rounded-xl vf-border vf-border-[#E5E1DA] vf-bg-white vf-px-4 vf-py-3 vf-text-sm vf-font-medium">{slot.displayTime}</div>)}
          </div>
        ) : null}

        <div className="vf-mt-5">
          <AddOnSection profile={profile} selections={selections} onSetQuantity={onSetQuantity} />
        </div>

        <div className="vf-mt-5 vf-rounded-2xl vf-border vf-border-[#E5E1DA] vf-bg-white vf-p-4">
          <div className="vf-flex vf-justify-between vf-text-sm vf-text-[#78716C]"><span>Reservation</span><span>{formatCurrency(baseTotal)}</span></div>
          <div className="vf-mt-2 vf-flex vf-justify-between vf-text-sm vf-text-[#78716C]"><span>Add-ons</span><span>{formatCurrency(addonTotal)}</span></div>
          <div className="vf-mt-3 vf-border-t vf-border-[#E5E1DA] vf-pt-3 vf-flex vf-justify-between vf-text-xl vf-font-semibold vf-text-[#1C1917]"><span>Total</span><span>{formatCurrency(total)}</span></div>
        </div>

        <button type="button" disabled={!canReserve} onClick={onComplete} className="vf-mt-4 vf-w-full vf-rounded-xl vf-py-4 vf-text-sm vf-font-semibold vf-text-white vf-transition active:vf-scale-[0.98] disabled:vf-cursor-not-allowed disabled:vf-bg-[#C5BFB8]" style={canReserve ? { backgroundColor: profile.brand.primaryColor } : undefined}>
          Confirm reservation
        </button>
      </section>
    </div>
  );
}

function BelowFoldPitch() {
  return (
    <section className="vf-border-t vf-border-[#E5E1DA] vf-pt-12 vf-text-center">
      <h2 className="vf-font-serif vf-text-3xl vf-leading-tight vf-text-[#1C1917] sm:vf-text-4xl">Separate demos. One shared engine.</h2>
      <p className="vf-mx-auto vf-mt-4 vf-max-w-2xl vf-text-sm vf-leading-6 vf-text-[#78716C]">
        Each vertical gets its own focused booking website while the core reservation logic stays reusable and maintainable.
      </p>
    </section>
  );
}
