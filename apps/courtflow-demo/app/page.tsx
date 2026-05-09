"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  calculateAddonTotal,
  formatCurrency,
  formatLongDate,
  formatShortDate,
  formatWeekday,
  generateTimeSlots,
  getUpcomingDates,
  isSameDay
} from "@venueflow/booking-engine";
import type { AddonSelection, ResourceConfig, TimeSlot } from "@venueflow/booking-engine";
import { profile } from "@/config/profile";

const accent = profile.brand.primaryColor;
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

function pluralize(value: number, singular: string, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`;
}

function courtGradient(index: number): CSSProperties {
  const palettes = [
    `radial-gradient(circle at 16% 18%, rgba(255,255,255,0.35), transparent 28%), linear-gradient(135deg, #DCE7DE 0%, #41735D 45%, ${accent} 100%)`,
    `radial-gradient(circle at 82% 16%, rgba(255,255,255,0.30), transparent 26%), linear-gradient(135deg, #E9E1D0 0%, #8B795E 45%, #2E3A31 100%)`,
    `radial-gradient(circle at 20% 18%, rgba(255,255,255,0.32), transparent 26%), linear-gradient(135deg, #D9E0D7 0%, #556E5F 42%, #101E18 100%)`
  ];

  return { background: palettes[index % palettes.length] };
}

function sortSlots(slots: TimeSlot[]) {
  return [...slots].sort((a, b) => a.time.localeCompare(b.time));
}

export default function CourtFlowHomePage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedResourceId, setSelectedResourceId] = useState(profile.resources[0]?.id ?? "");
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [addonSelections, setAddonSelections] = useState<AddonSelection[]>([]);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const selectedResource = profile.resources.find((resource) => resource.id === selectedResourceId) ?? profile.resources[0];
  const upcomingDates = useMemo(() => getUpcomingDates(profile.bookingWindowDays), []);
  const slots = useMemo(() => {
    if (!selectedResource || !profile.operatingHours) return [];
    return generateTimeSlots(selectedDate, selectedResource.id, profile.operatingHours);
  }, [selectedDate, selectedResource]);

  const selectedHours = selectedSlots.length;
  const courtSubtotal = selectedResource ? selectedResource.rate * selectedHours : 0;
  const addonTotal = calculateAddonTotal(profile.addons, addonSelections);
  const total = courtSubtotal + addonTotal;
  const canReserve = Boolean(selectedResource && selectedHours >= profile.minimumUnits);

  function selectDate(date: Date) {
    setSelectedDate(date);
    setSelectedSlots([]);
    setAddonSelections([]);
  }

  function selectResource(resource: ResourceConfig) {
    setSelectedResourceId(resource.id);
    setSelectedSlots([]);
    setAddonSelections([]);
  }

  function toggleSlot(slot: TimeSlot) {
    if (slot.status !== "available") return;
    setSelectedSlots((current) => {
      const exists = current.some((item) => item.id === slot.id);
      return exists ? current.filter((item) => item.id !== slot.id) : sortSlots([...current, slot]);
    });
  }

  function setAddonQuantity(addonId: string, quantity: number) {
    setAddonSelections((current) => {
      const filtered = current.filter((selection) => selection.addonId !== addonId);
      return quantity > 0 ? [...filtered, { addonId, quantity }] : filtered;
    });
  }

  function completeReservation() {
    setIsSummaryOpen(false);
    setSelectedSlots([]);
    setAddonSelections([]);
  }

  return (
    <main className="vf-min-h-screen vf-bg-[#F7F5EF] vf-pb-32 vf-text-[#171B18]">
      <Header />
      <Hero selectedResource={selectedResource} selectedHours={selectedHours} />

      <section className="vf-mx-auto vf-grid vf-max-w-6xl vf-gap-6 vf-px-4 vf-py-8 sm:vf-px-6 lg:vf-grid-cols-[minmax(0,1fr)_360px] lg:vf-py-12">
        <div className="vf-space-y-6">
          <FacilityStrip />
          <DateSection dates={upcomingDates} selectedDate={selectedDate} onSelectDate={selectDate} />
          <CourtSection selectedResourceId={selectedResourceId} onSelectResource={selectResource} />
          {selectedResource ? <TimeSection slots={slots} selectedSlots={selectedSlots} resource={selectedResource} selectedDate={selectedDate} onToggleSlot={toggleSlot} /> : null}
          <AddOnsSection selections={addonSelections} onSetQuantity={setAddonQuantity} />
          <CourtExperienceSection />
        </div>

        {selectedResource ? (
          <aside className="vf-hidden lg:vf-block">
            <div className="vf-sticky vf-top-24 vf-space-y-4">
              <DesktopSummaryCard
                resource={selectedResource}
                selectedDate={selectedDate}
                selectedSlots={selectedSlots}
                courtSubtotal={courtSubtotal}
                addonTotal={addonTotal}
                total={total}
                canReserve={canReserve}
                onOpen={() => setIsSummaryOpen(true)}
              />
              <SupportCard />
            </div>
          </aside>
        ) : null}
      </section>

      {selectedResource ? (
        <MobileCheckoutBar
          resource={selectedResource}
          selectedDate={selectedDate}
          selectedSlots={selectedSlots}
          total={total}
          canReserve={canReserve}
          onOpen={() => setIsSummaryOpen(true)}
        />
      ) : null}

      {selectedResource ? (
        <ReservationDrawer
          isOpen={isSummaryOpen}
          onClose={() => setIsSummaryOpen(false)}
          resource={selectedResource}
          selectedDate={selectedDate}
          selectedSlots={selectedSlots}
          courtSubtotal={courtSubtotal}
          addonTotal={addonTotal}
          total={total}
          selections={addonSelections}
          onSetQuantity={setAddonQuantity}
          canReserve={canReserve}
          onComplete={completeReservation}
        />
      ) : null}
    </main>
  );
}

function Header() {
  return (
    <header className="vf-sticky vf-top-0 vf-z-40 vf-border-b vf-border-[#E1DED5] vf-bg-[#FFFEFB]/95 vf-backdrop-blur-xl">
      <div className="vf-mx-auto vf-flex vf-h-16 vf-max-w-6xl vf-items-center vf-justify-between vf-px-4 sm:vf-px-6">
        <a href="/" className="vf-flex vf-min-w-0 vf-items-center vf-gap-3">
          <div className="vf-flex vf-h-10 vf-w-10 vf-items-center vf-justify-center vf-rounded-2xl vf-bg-[#113F2D] vf-text-sm vf-font-semibold vf-text-white vf-shadow-[0_10px_28px_rgba(17,63,45,0.22)]">
            CF
          </div>
          <div className="vf-min-w-0">
            <p className="vf-truncate vf-text-sm vf-font-semibold vf-text-[#171B18] sm:vf-text-base">{profile.brand.name}</p>
            <p className="vf-text-xs vf-text-[#6F756F]">{profile.brand.eyebrow}</p>
          </div>
        </a>
        <nav className="vf-flex vf-items-center vf-gap-2">
          <a href="#courts" className="vf-hidden vf-rounded-full vf-px-4 vf-py-2 vf-text-sm vf-font-medium vf-text-[#626B63] vf-transition hover:vf-bg-[#EEF3EF] md:vf-inline-flex">
            Courts
          </a>
          <a href="/bookings" className="vf-rounded-full vf-border vf-border-[#DFDDD5] vf-bg-white vf-px-4 vf-py-2 vf-text-sm vf-font-medium vf-text-[#171B18] vf-shadow-[0_1px_2px_rgba(23,27,24,0.04)] vf-transition hover:vf-border-[#C8C4BA]">
            My Bookings
          </a>
        </nav>
      </div>
    </header>
  );
}

function Hero({ selectedResource, selectedHours }: { selectedResource?: ResourceConfig; selectedHours: number }) {
  return (
    <section className="vf-relative vf-isolate vf-overflow-hidden vf-bg-[#101E18]">
      <div className="vf-absolute vf-inset-0 vf-bg-[linear-gradient(115deg,#0D1712_0%,#123B2B_45%,#B8A06B_145%)]" />
      <div className="vf-absolute vf-inset-0 vf-opacity-[0.16] vf-bg-[linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.14)_1px,transparent_1px)] vf-bg-[size:44px_44px]" />
      <div className="vf-absolute vf-left-[-8rem] vf-top-[-8rem] vf-h-80 vf-w-80 vf-rounded-full vf-bg-[#4DD68B]/20 vf-blur-3xl" />
      <div className="vf-absolute vf-bottom-[-10rem] vf-right-[-10rem] vf-h-96 vf-w-96 vf-rounded-full vf-border vf-border-white/20" />

      <div className="vf-relative vf-mx-auto vf-grid vf-min-h-[430px] vf-max-w-6xl vf-items-end vf-gap-8 vf-px-4 vf-py-10 sm:vf-px-6 lg:vf-grid-cols-[minmax(0,1fr)_380px] lg:vf-py-14">
        <div className="vf-max-w-3xl vf-text-white">
          <p className="vf-mb-4 vf-inline-flex vf-rounded-full vf-border vf-border-white/15 vf-bg-white/10 vf-px-4 vf-py-2 vf-text-xs vf-font-semibold vf-backdrop-blur-md">
            Pickleball · Badminton · Private training
          </p>
          <h1 className="vf-font-serif vf-text-5xl vf-leading-[0.95] vf-tracking-[-0.045em] sm:vf-text-6xl lg:vf-text-7xl">{profile.brand.heroTitle}</h1>
          <p className="vf-mt-5 vf-max-w-2xl vf-text-base vf-leading-7 vf-text-white/84 sm:vf-text-lg">{profile.brand.heroSubtitle}</p>
          <div className="vf-mt-8 vf-flex vf-flex-wrap vf-gap-3">
            {['Hourly booking', 'Clear availability', 'Court add-ons'].map((item) => (
              <span key={item} className="vf-rounded-full vf-border vf-border-white/16 vf-bg-white/10 vf-px-4 vf-py-2 vf-text-xs vf-font-medium vf-text-white/88 vf-backdrop-blur-md">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="vf-rounded-[2rem] vf-border vf-border-white/18 vf-bg-white/12 vf-p-4 vf-shadow-[0_24px_80px_rgba(0,0,0,0.28)] vf-backdrop-blur-xl">
          <div className="vf-rounded-[1.5rem] vf-bg-[#FFFEFB] vf-p-5">
            <p className="vf-text-xs vf-font-semibold vf-uppercase vf-tracking-[0.22em] vf-text-[#8B968D]">Featured court</p>
            <h2 className="vf-mt-3 vf-font-serif vf-text-3xl vf-leading-tight vf-text-[#171B18]">{selectedResource?.label ?? 'Premium Pickleball Court'}</h2>
            <p className="vf-mt-2 vf-text-sm vf-leading-6 vf-text-[#626B63]">{selectedResource?.description ?? 'Tournament-ready private court access for singles, doubles, and group play.'}</p>
            <div className="vf-mt-5 vf-grid vf-grid-cols-2 vf-gap-3">
              <InfoTile label="From" value={selectedResource ? `${formatCurrency(selectedResource.rate)} / hour` : '₱620 / hour'} />
              <InfoTile label="Selected" value={selectedHours > 0 ? pluralize(selectedHours, 'hour') : 'No time yet'} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="vf-rounded-2xl vf-bg-[#F1F4EF] vf-p-4">
      <p className="vf-text-[11px] vf-font-semibold vf-uppercase vf-tracking-[0.18em] vf-text-[#7C887F]">{label}</p>
      <p className="vf-mt-1 vf-text-sm vf-font-semibold vf-text-[#171B18]">{value}</p>
    </div>
  );
}

function FacilityStrip() {
  return (
    <section className="vf-grid vf-gap-3 sm:vf-grid-cols-3">
      {[
        ['Fast reservations', 'Guests can select court time without chat back-and-forth.'],
        ['Hourly pricing', 'Each court can show its own premium hourly rate.'],
        ['Rental add-ons', 'Equipment, balls, and coaching can be added at checkout.']
      ].map(([title, description]) => (
        <div key={title} className="vf-rounded-3xl vf-border vf-border-[#E1DED5] vf-bg-[#FFFEFB] vf-p-5 vf-shadow-[0_1px_3px_rgba(23,27,24,0.05)]">
          <p className="vf-text-sm vf-font-semibold vf-text-[#171B18]">{title}</p>
          <p className="vf-mt-2 vf-text-sm vf-leading-6 vf-text-[#626B63]">{description}</p>
        </div>
      ))}
    </section>
  );
}

function SectionCard({ id, label, title, children, right }: { id?: string; label: string; title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section id={id} className="vf-rounded-[2rem] vf-border vf-border-[#DFDDD5] vf-bg-[#FFFEFB] vf-p-5 vf-shadow-[0_12px_40px_rgba(23,27,24,0.045)] sm:vf-p-6">
      <div className="vf-mb-5 vf-flex vf-items-end vf-justify-between vf-gap-4">
        <div>
          <p className="vf-text-[11px] vf-font-semibold vf-uppercase vf-tracking-[0.24em] vf-text-[#89938B]">{label}</p>
          <h2 className="vf-mt-1 vf-font-serif vf-text-3xl vf-leading-tight vf-text-[#171B18]">{title}</h2>
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function DateSection({ dates, selectedDate, onSelectDate }: { dates: Date[]; selectedDate: Date; onSelectDate: (date: Date) => void }) {
  return (
    <SectionCard label="Date" title={profile.copy.dateHeading} right={<span className="vf-text-sm vf-text-[#626B63]">Next {profile.bookingWindowDays} days</span>}>
      <div className="vf-scrollbar-hide vf-flex vf-snap-x vf-gap-3 vf-overflow-x-auto vf-pb-1">
        {dates.map((date, index) => {
          const selected = isSameDay(date, selectedDate);
          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onSelectDate(date)}
              className="vf-h-20 vf-w-20 vf-shrink-0 vf-snap-start vf-rounded-2xl vf-border vf-text-center vf-transition active:vf-scale-[0.98]"
              style={selected ? { backgroundColor: accent, borderColor: accent, color: 'white' } : { borderColor: '#DFDDD5', backgroundColor: 'white', color: '#171B18' }}
            >
              <span className="vf-block vf-text-[11px] vf-font-semibold vf-uppercase vf-tracking-[0.12em] vf-opacity-70">{index === 0 ? 'Today' : formatWeekday(date)}</span>
              <span className="vf-mt-1 vf-block vf-text-sm vf-font-semibold">{formatShortDate(date)}</span>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}

function CourtSection({ selectedResourceId, onSelectResource }: { selectedResourceId: string; onSelectResource: (resource: ResourceConfig) => void }) {
  return (
    <SectionCard id="courts" label="Court" title={profile.copy.resourceHeading}>
      <div className="vf-grid vf-gap-4 md:vf-grid-cols-3">
        {profile.resources.map((resource, index) => {
          const selected = resource.id === selectedResourceId;
          return (
            <button
              key={resource.id}
              type="button"
              onClick={() => onSelectResource(resource)}
              className="vf-group vf-overflow-hidden vf-rounded-[1.6rem] vf-border vf-bg-white vf-p-2 vf-text-left vf-shadow-[0_1px_3px_rgba(23,27,24,0.06)] vf-transition hover:vf--translate-y-0.5 hover:vf-shadow-[0_12px_28px_rgba(23,27,24,0.10)]"
              style={{ borderColor: selected ? accent : '#DFDDD5', boxShadow: selected ? `0 0 0 2px ${accent}22` : undefined }}
            >
              <div className="vf-aspect-[4/3] vf-rounded-[1.2rem]" style={courtGradient(index)}>
                <div className="vf-flex vf-h-full vf-items-end vf-justify-between vf-p-4 vf-text-white">
                  <span className="vf-rounded-full vf-bg-white/18 vf-px-3 vf-py-1 vf-text-[11px] vf-font-semibold vf-backdrop-blur-md">{resource.kind}</span>
                  <span className="vf-rounded-full vf-bg-black/20 vf-px-3 vf-py-1 vf-text-[11px] vf-font-semibold vf-backdrop-blur-md">{formatCurrency(resource.rate)}/hr</span>
                </div>
              </div>
              <div className="vf-px-2 vf-py-4">
                <h3 className="vf-font-serif vf-text-xl vf-leading-tight vf-text-[#171B18]">{resource.label}</h3>
                <p className="vf-mt-2 vf-text-[11px] vf-font-semibold vf-uppercase vf-tracking-[0.18em] vf-text-[#89938B]">{resource.meta}</p>
                <p className="vf-mt-3 vf-text-sm vf-leading-6 vf-text-[#626B63]">{resource.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}

function TimeSection({ slots, selectedSlots, resource, selectedDate, onToggleSlot }: { slots: TimeSlot[]; selectedSlots: TimeSlot[]; resource: ResourceConfig; selectedDate: Date; onToggleSlot: (slot: TimeSlot) => void }) {
  const selectedIds = new Set(selectedSlots.map((slot) => slot.id));

  return (
    <SectionCard
      label="Time"
      title={profile.copy.timeHeading}
      right={<span className="vf-text-sm vf-text-[#626B63]">{formatShortDate(selectedDate)} · {resource.label}</span>}
    >
      <div className="vf-mb-5 vf-rounded-2xl vf-border vf-border-[#DFDDD5] vf-bg-[#F7F5EF] vf-p-4">
        <div className="vf-flex vf-items-center vf-justify-between vf-gap-4">
          <div>
            <p className="vf-text-sm vf-font-semibold vf-text-[#171B18]">Hourly rate</p>
            <p className="vf-mt-1 vf-text-sm vf-text-[#626B63]">{resource.meta}</p>
          </div>
          <p className="vf-text-sm vf-font-semibold vf-text-[#171B18]">{formatCurrency(resource.rate)} / hour</p>
        </div>
      </div>

      <div className="vf-grid vf-grid-cols-3 vf-gap-2 sm:vf-grid-cols-4 md:vf-grid-cols-5">
        {slots.map((slot) => {
          const selected = selectedIds.has(slot.id);
          const unavailable = slot.status !== 'available';
          return (
            <button
              key={slot.id}
              type="button"
              disabled={unavailable}
              onClick={() => onToggleSlot(slot)}
              className="vf-rounded-2xl vf-border vf-px-3 vf-py-3 vf-text-center vf-transition active:vf-scale-[0.98] disabled:vf-cursor-not-allowed"
              style={
                selected
                  ? { backgroundColor: accent, borderColor: accent, color: 'white' }
                  : unavailable
                    ? { backgroundColor: '#EEEAE2', borderColor: '#DFDDD5', color: '#9B9A93' }
                    : { backgroundColor: 'white', borderColor: '#DFDDD5', color: '#171B18' }
              }
            >
              <span className="vf-block vf-text-sm vf-font-semibold">{slot.displayTime}</span>
              <span className="vf-mt-1 vf-block vf-text-[11px] vf-opacity-70">{unavailable ? slot.status : formatCurrency(resource.rate)}</span>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}

function AddOnsSection({ selections, onSetQuantity }: { selections: AddonSelection[]; onSetQuantity: (addonId: string, quantity: number) => void }) {
  return (
    <SectionCard label="Extras" title={profile.copy.addOnHeading} right={<span className="vf-text-sm vf-text-[#626B63]">Optional</span>}>
      <div className="vf-grid vf-gap-3 sm:vf-grid-cols-2">
        {profile.addons.map((addon) => {
          const quantity = selections.find((selection) => selection.addonId === addon.id)?.quantity ?? 0;
          return (
            <div key={addon.id} className="vf-flex vf-items-center vf-justify-between vf-gap-4 vf-rounded-2xl vf-border vf-border-[#DFDDD5] vf-bg-[#F7F5EF] vf-p-4">
              <div className="vf-min-w-0">
                <p className="vf-font-semibold vf-text-[#171B18]">{addon.label}</p>
                <p className="vf-mt-1 vf-text-sm vf-leading-5 vf-text-[#626B63]">{addon.description}</p>
                <p className="vf-mt-2 vf-text-sm vf-font-semibold vf-text-[#171B18]">{formatCurrency(addon.price)}</p>
              </div>
              <QuantityStepper value={quantity} max={addon.maxQuantity} onChange={(value) => onSetQuantity(addon.id, value)} />
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function QuantityStepper({ value, max, onChange }: { value: number; max: number; onChange: (value: number) => void }) {
  return (
    <div className="vf-flex vf-shrink-0 vf-items-center vf-gap-2 vf-rounded-full vf-bg-white vf-p-1 vf-shadow-[0_1px_2px_rgba(23,27,24,0.06)]">
      <button type="button" className="vf-flex vf-h-8 vf-w-8 vf-items-center vf-justify-center vf-rounded-full vf-text-lg vf-font-semibold vf-text-[#626B63] disabled:vf-opacity-35" disabled={value === 0} onClick={() => onChange(Math.max(0, value - 1))}>−</button>
      <span className="vf-w-5 vf-text-center vf-text-sm vf-font-semibold vf-text-[#171B18]">{value}</span>
      <button type="button" className="vf-flex vf-h-8 vf-w-8 vf-items-center vf-justify-center vf-rounded-full vf-text-lg vf-font-semibold vf-text-white disabled:vf-opacity-35" style={{ backgroundColor: accent }} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  );
}

function CourtExperienceSection() {
  return (
    <section className="vf-rounded-[2rem] vf-border vf-border-[#DFDDD5] vf-bg-[#171B18] vf-p-6 vf-text-white vf-shadow-[0_16px_42px_rgba(23,27,24,0.16)]">
      <div className="vf-grid vf-gap-6 md:vf-grid-cols-[1fr_auto] md:vf-items-center">
        <div>
          <p className="vf-text-xs vf-font-semibold vf-uppercase vf-tracking-[0.22em] vf-text-white/50">For court operators</p>
          <h2 className="vf-mt-2 vf-font-serif vf-text-3xl vf-leading-tight">Built for hourly play, rentals, and coaching.</h2>
          <p className="vf-mt-3 vf-max-w-2xl vf-text-sm vf-leading-6 vf-text-white/72">
            CourtFlow gives players a clear path from date to court to time slot, while keeping add-ons and total pricing easy to understand.
          </p>
        </div>
        <a href={`tel:${profile.brand.contact.phone}`} className="vf-inline-flex vf-rounded-xl vf-bg-white vf-px-5 vf-py-3 vf-text-sm vf-font-semibold vf-text-[#171B18] vf-transition active:vf-scale-[0.98]">
          Ask about setup
        </a>
      </div>
    </section>
  );
}

function DesktopSummaryCard({ resource, selectedDate, selectedSlots, courtSubtotal, addonTotal, total, canReserve, onOpen }: { resource: ResourceConfig; selectedDate: Date; selectedSlots: TimeSlot[]; courtSubtotal: number; addonTotal: number; total: number; canReserve: boolean; onOpen: () => void }) {
  return (
    <section className="vf-rounded-[2rem] vf-border vf-border-[#DFDDD5] vf-bg-[#FFFEFB] vf-p-5 vf-shadow-[0_18px_50px_rgba(23,27,24,0.08)]">
      <p className="vf-text-xs vf-font-semibold vf-uppercase vf-tracking-[0.22em] vf-text-[#89938B]">Reservation</p>
      <h2 className="vf-mt-2 vf-font-serif vf-text-3xl vf-leading-tight vf-text-[#171B18]">{resource.label}</h2>
      <p className="vf-mt-2 vf-text-sm vf-text-[#626B63]">{formatLongDate(selectedDate)}</p>

      <div className="vf-mt-5 vf-space-y-3 vf-rounded-2xl vf-bg-[#F7F5EF] vf-p-4">
        <SummaryRow label="Court time" value={selectedSlots.length > 0 ? pluralize(selectedSlots.length, 'hour') : 'Not selected'} />
        <SummaryRow label="Rate" value={`${formatCurrency(resource.rate)} / hour`} />
        <SummaryRow label="Court subtotal" value={formatCurrency(courtSubtotal)} />
        <SummaryRow label="Add-ons" value={formatCurrency(addonTotal)} />
        <div className="vf-border-t vf-border-[#DFDDD5] vf-pt-3">
          <SummaryRow label="Total" value={formatCurrency(total)} strong />
        </div>
      </div>

      <button
        type="button"
        disabled={!canReserve}
        onClick={onOpen}
        className="vf-mt-5 vf-w-full vf-rounded-xl vf-px-5 vf-py-3 vf-text-sm vf-font-semibold vf-text-white vf-transition active:vf-scale-[0.98] disabled:vf-cursor-not-allowed disabled:vf-bg-[#C8C4BA]"
        style={canReserve ? { backgroundColor: accent } : undefined}
      >
        {canReserve ? profile.copy.reserveCta : profile.copy.emptyCheckout}
      </button>
    </section>
  );
}

function SupportCard() {
  return (
    <section className="vf-rounded-[1.5rem] vf-border vf-border-[#DFDDD5] vf-bg-white vf-p-5 vf-shadow-[0_1px_3px_rgba(23,27,24,0.05)]">
      <p className="vf-text-sm vf-font-semibold vf-text-[#171B18]">{profile.brand.supportLabel}</p>
      <p className="vf-mt-2 vf-text-sm vf-leading-6 vf-text-[#626B63]">Players can still contact the facility, but the booking flow handles most reservations by itself.</p>
      <div className="vf-mt-4 vf-flex vf-gap-2">
        <a href={profile.brand.contact.chatUrl} className="vf-rounded-full vf-border vf-border-[#DFDDD5] vf-px-3 vf-py-2 vf-text-xs vf-font-semibold vf-text-[#171B18]">Chat</a>
        <a href={`tel:${profile.brand.contact.phone}`} className="vf-rounded-full vf-border vf-border-[#DFDDD5] vf-px-3 vf-py-2 vf-text-xs vf-font-semibold vf-text-[#171B18]">Call</a>
      </div>
    </section>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="vf-flex vf-items-center vf-justify-between vf-gap-4">
      <span className={strong ? 'vf-text-base vf-font-semibold vf-text-[#171B18]' : 'vf-text-sm vf-text-[#626B63]'}>{label}</span>
      <span className={strong ? 'vf-text-base vf-font-semibold vf-text-[#171B18]' : 'vf-text-sm vf-font-semibold vf-text-[#171B18]'}>{value}</span>
    </div>
  );
}

function MobileCheckoutBar({ resource, selectedDate, selectedSlots, total, canReserve, onOpen }: { resource: ResourceConfig; selectedDate: Date; selectedSlots: TimeSlot[]; total: number; canReserve: boolean; onOpen: () => void }) {
  return (
    <div className="vf-fixed vf-inset-x-0 vf-bottom-0 vf-z-40 vf-border-t vf-border-[#DFDDD5] vf-bg-white/96 vf-px-4 vf-py-3 vf-backdrop-blur-xl lg:vf-hidden">
      <div className="vf-mx-auto vf-flex vf-max-w-2xl vf-items-center vf-justify-between vf-gap-4">
        <div className="vf-min-w-0">
          <p className="vf-truncate vf-text-sm vf-font-semibold vf-text-[#171B18]">{canReserve ? resource.label : profile.copy.emptyCheckout}</p>
          <p className="vf-mt-0.5 vf-text-xs vf-text-[#626B63]">
            {canReserve ? `${formatShortDate(selectedDate)} · ${pluralize(selectedSlots.length, 'hour')} · ${formatCurrency(total)}` : `${formatShortDate(selectedDate)} · ${formatCurrency(resource.rate)} / hour`}
          </p>
        </div>
        <button type="button" disabled={!canReserve} onClick={onOpen} className="vf-rounded-xl vf-px-5 vf-py-3 vf-text-sm vf-font-semibold vf-text-white disabled:vf-bg-[#C8C4BA]" style={canReserve ? { backgroundColor: accent } : undefined}>
          Reserve
        </button>
      </div>
    </div>
  );
}

function ReservationDrawer({ isOpen, onClose, resource, selectedDate, selectedSlots, courtSubtotal, addonTotal, total, selections, onSetQuantity, canReserve, onComplete }: { isOpen: boolean; onClose: () => void; resource: ResourceConfig; selectedDate: Date; selectedSlots: TimeSlot[]; courtSubtotal: number; addonTotal: number; total: number; selections: AddonSelection[]; onSetQuantity: (addonId: string, quantity: number) => void; canReserve: boolean; onComplete: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="vf-fixed vf-inset-0 vf-z-50 vf-flex vf-items-end vf-justify-center vf-bg-[#101E18]/55 vf-px-3 vf-backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Court reservation summary">
      <button type="button" className="vf-absolute vf-inset-0" aria-label="Close reservation summary" onClick={onClose} />
      <section className="vf-relative vf-max-h-[88vh] vf-w-full vf-max-w-xl vf-overflow-y-auto vf-rounded-t-[2rem] vf-border vf-border-white/70 vf-bg-[#FFFEFB] vf-p-5 vf-shadow-[0_-28px_90px_rgba(15,23,42,0.26)] sm:vf-mb-4 sm:vf-rounded-[2rem] sm:vf-p-6">
        <div className="vf-mx-auto vf-mb-5 vf-h-1.5 vf-w-14 vf-rounded-full vf-bg-[#DFDDD5]" />
        <div className="vf-flex vf-items-start vf-justify-between vf-gap-4">
          <div>
            <p className="vf-text-xs vf-font-semibold vf-uppercase vf-tracking-[0.22em] vf-text-[#89938B]">Court checkout</p>
            <h2 className="vf-mt-1 vf-font-serif vf-text-3xl vf-leading-tight vf-text-[#171B18]">Review reservation</h2>
          </div>
          <button type="button" onClick={onClose} className="vf-rounded-full vf-border vf-border-[#DFDDD5] vf-bg-white vf-px-4 vf-py-2 vf-text-xs vf-font-semibold vf-text-[#626B63]">Close</button>
        </div>

        <div className="vf-mt-6 vf-rounded-2xl vf-border vf-border-[#DFDDD5] vf-bg-[#F7F5EF] vf-p-4">
          <p className="vf-font-semibold vf-text-[#171B18]">{resource.label}</p>
          <p className="vf-mt-1 vf-text-sm vf-text-[#626B63]">{formatLongDate(selectedDate)}</p>
          <div className="vf-mt-4 vf-flex vf-flex-wrap vf-gap-2">
            {selectedSlots.length > 0 ? selectedSlots.map((slot) => (
              <span key={slot.id} className="vf-rounded-full vf-bg-white vf-px-3 vf-py-1.5 vf-text-xs vf-font-semibold vf-text-[#171B18]">{slot.displayTime}</span>
            )) : <span className="vf-text-sm vf-text-[#626B63]">No court time selected.</span>}
          </div>
        </div>

        <div className="vf-mt-5 vf-space-y-3">
          {profile.addons.map((addon) => {
            const quantity = selections.find((selection) => selection.addonId === addon.id)?.quantity ?? 0;
            return (
              <div key={addon.id} className="vf-flex vf-items-center vf-justify-between vf-gap-4 vf-rounded-2xl vf-border vf-border-[#DFDDD5] vf-bg-white vf-p-4">
                <div>
                  <p className="vf-font-semibold vf-text-[#171B18]">{addon.label}</p>
                  <p className="vf-mt-1 vf-text-sm vf-text-[#626B63]">{formatCurrency(addon.price)} each</p>
                </div>
                <QuantityStepper value={quantity} max={addon.maxQuantity} onChange={(value) => onSetQuantity(addon.id, value)} />
              </div>
            );
          })}
        </div>

        <div className="vf-mt-5 vf-rounded-2xl vf-border vf-border-[#DFDDD5] vf-bg-[#F7F5EF] vf-p-4 vf-space-y-3">
          <SummaryRow label="Court time" value={formatCurrency(courtSubtotal)} />
          <SummaryRow label="Add-ons" value={formatCurrency(addonTotal)} />
          <div className="vf-border-t vf-border-[#DFDDD5] vf-pt-3">
            <SummaryRow label="Total" value={formatCurrency(total)} strong />
          </div>
        </div>

        <button
          type="button"
          disabled={!canReserve}
          onClick={onComplete}
          className="vf-mt-5 vf-w-full vf-rounded-xl vf-px-5 vf-py-4 vf-text-sm vf-font-semibold vf-text-white vf-transition active:vf-scale-[0.98] disabled:vf-bg-[#C8C4BA]"
          style={canReserve ? { backgroundColor: accent } : undefined}
        >
          Confirm court reservation
        </button>
      </section>
    </div>
  );
}
