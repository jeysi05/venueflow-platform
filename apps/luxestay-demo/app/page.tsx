"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  addDays,
  calculateAddonTotal,
  formatCurrency,
  formatLongDate,
  formatShortDate,
  formatWeekday,
  getDayDifference,
  getUpcomingDates,
  isSameDay
} from "@venueflow/booking-engine";
import type { AddonSelection, ResourceConfig } from "@venueflow/booking-engine";
import { profile } from "@/config/profile";

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long" });

function pluralize(value: number, singular: string, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`;
}

function stayRangeLabel(checkIn: Date, checkOut: Date) {
  return `${formatShortDate(checkIn)} – ${formatShortDate(checkOut)}`;
}

function gradientForResource(index: number, accent: string): CSSProperties {
  const palettes = [
    `radial-gradient(circle at 18% 18%, rgba(255,255,255,0.54), transparent 26%), linear-gradient(135deg, #D8C7B2 0%, #9D8064 48%, ${accent} 100%)`,
    `radial-gradient(circle at 80% 12%, rgba(255,255,255,0.42), transparent 25%), linear-gradient(135deg, #E8DDCF 0%, #B89572 48%, #5F4432 100%)`,
    `radial-gradient(circle at 20% 22%, rgba(255,255,255,0.45), transparent 30%), linear-gradient(135deg, #EFE7DC 0%, #B9A48E 46%, #2F4D3F 100%)`
  ];

  return { background: palettes[index % palettes.length] };
}

export default function LuxeStayHomePage() {
  const today = useMemo(() => new Date(), []);
  const [selectedResourceId, setSelectedResourceId] = useState(profile.resources[0]?.id ?? "");
  const [checkInDate, setCheckInDate] = useState(() => today);
  const [checkOutDate, setCheckOutDate] = useState(() => addDays(today, 1));
  const [guestCount, setGuestCount] = useState(8);
  const [addonSelections, setAddonSelections] = useState<AddonSelection[]>([]);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const selectedResource = profile.resources.find((resource) => resource.id === selectedResourceId) ?? profile.resources[0];
  const nights = Math.max(profile.minimumUnits, getDayDifference(checkInDate, checkOutDate));
  const staySubtotal = selectedResource ? selectedResource.rate * nights : 0;
  const addonTotal = calculateAddonTotal(profile.addons, addonSelections);
  const total = staySubtotal + addonTotal;
  const canReserve = Boolean(selectedResource && checkOutDate > checkInDate);
  const upcomingDates = useMemo(() => getUpcomingDates(profile.bookingWindowDays), []);

  function selectCheckIn(date: Date) {
    setCheckInDate(date);
    if (checkOutDate <= date) {
      setCheckOutDate(addDays(date, 1));
    }
  }

  function selectResource(resource: ResourceConfig) {
    setSelectedResourceId(resource.id);
    setAddonSelections([]);
  }

  function setAddonQuantity(addonId: string, quantity: number) {
    setAddonSelections((current) => {
      const filtered = current.filter((selection) => selection.addonId !== addonId);
      return quantity > 0 ? [...filtered, { addonId, quantity }] : filtered;
    });
  }

  function completeReservation() {
    setIsSummaryOpen(false);
    setAddonSelections([]);
  }

  return (
    <main className="vf-min-h-screen vf-bg-[#F8F4EE] vf-pb-32 vf-text-[#1C1917]">
      <Header />
      <Hero selectedResource={selectedResource} nights={nights} />

      <section className="vf-mx-auto vf-grid vf-max-w-6xl vf-gap-6 vf-px-4 vf-py-8 sm:vf-px-6 lg:vf-grid-cols-[minmax(0,1fr)_360px] lg:vf-py-12">
        <div className="vf-space-y-6">
          <TrustBar />
          <StayDateSection
            dates={upcomingDates}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            onSelectCheckIn={selectCheckIn}
            onSelectCheckout={setCheckOutDate}
          />
          <StayResourceSection selectedResourceId={selectedResourceId} onSelectResource={selectResource} />
          {selectedResource ? <GuestSection guestCount={guestCount} onSetGuestCount={setGuestCount} selectedResource={selectedResource} /> : null}
          <AddOnsSection selections={addonSelections} onSetQuantity={setAddonQuantity} />
          <ExperienceSection />
        </div>

        {selectedResource ? (
          <aside className="vf-hidden lg:vf-block">
            <div className="vf-sticky vf-top-24 vf-space-y-4">
              <DesktopSummaryCard
                resource={selectedResource}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                guestCount={guestCount}
                nights={nights}
                staySubtotal={staySubtotal}
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
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          nights={nights}
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
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          guestCount={guestCount}
          nights={nights}
          staySubtotal={staySubtotal}
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
    <header className="vf-sticky vf-top-0 vf-z-40 vf-border-b vf-border-[#E7DFD5] vf-bg-[#FFFDF9]/95 vf-backdrop-blur-xl">
      <div className="vf-mx-auto vf-flex vf-h-16 vf-max-w-6xl vf-items-center vf-justify-between vf-px-4 sm:vf-px-6">
        <a href="/" className="vf-flex vf-min-w-0 vf-items-center vf-gap-3">
          <div className="vf-flex vf-h-10 vf-w-10 vf-items-center vf-justify-center vf-rounded-2xl vf-bg-[#6B4F3B] vf-font-serif vf-text-sm vf-font-semibold vf-text-white vf-shadow-[0_10px_28px_rgba(107,79,59,0.22)]">
            LS
          </div>
          <div className="vf-min-w-0">
            <p className="vf-truncate vf-text-sm vf-font-semibold vf-text-[#1C1917] sm:vf-text-base">{profile.brand.name}</p>
            <p className="vf-text-xs vf-text-[#7A6E63]">{profile.brand.eyebrow}</p>
          </div>
        </a>
        <nav className="vf-flex vf-items-center vf-gap-2">
          <a href="#stays" className="vf-hidden vf-rounded-full vf-px-4 vf-py-2 vf-text-sm vf-font-medium vf-text-[#6F6257] vf-transition hover:vf-bg-[#F3ECE3] md:vf-inline-flex">
            Stays
          </a>
          <a href="/bookings" className="vf-rounded-full vf-border vf-border-[#E0D6CB] vf-bg-white vf-px-4 vf-py-2 vf-text-sm vf-font-medium vf-text-[#1C1917] vf-shadow-[0_1px_2px_rgba(28,25,23,0.04)] vf-transition hover:vf-border-[#CDBEAE]">
            My Bookings
          </a>
        </nav>
      </div>
    </header>
  );
}

function Hero({ selectedResource, nights }: { selectedResource?: ResourceConfig; nights: number }) {
  return (
    <section className="vf-relative vf-isolate vf-overflow-hidden vf-bg-[#1F1915]">
      <div className="vf-absolute vf-inset-0 vf-bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.32),transparent_22%),linear-gradient(115deg,#8C725B_0%,#5F4635_38%,#17392C_100%)]" />
      <div className="vf-absolute vf-inset-0 vf-bg-[linear-gradient(90deg,rgba(20,15,12,0.68),rgba(20,15,12,0.18)_58%,rgba(20,15,12,0.54))]" />
      <div className="vf-pointer-events-none vf-absolute vf-right-[-8rem] vf-top-[-8rem] vf-h-80 vf-w-80 vf-rounded-full vf-border vf-border-white/20" />
      <div className="vf-pointer-events-none vf-absolute vf-bottom-[-7rem] vf-left-[-7rem] vf-h-72 vf-w-72 vf-rounded-full vf-bg-white/10 vf-blur-3xl" />

      <div className="vf-relative vf-mx-auto vf-grid vf-min-h-[440px] vf-max-w-6xl vf-items-end vf-gap-8 vf-px-4 vf-py-10 sm:vf-px-6 lg:vf-grid-cols-[minmax(0,1fr)_380px] lg:vf-py-14">
        <div className="vf-max-w-3xl vf-text-white">
          <p className="vf-mb-4 vf-inline-flex vf-rounded-full vf-border vf-border-white/20 vf-bg-white/10 vf-px-4 vf-py-2 vf-text-xs vf-font-medium vf-backdrop-blur-md">
            Private stays · Pool villas · Weekend escapes
          </p>
          <h1 className="vf-font-serif vf-text-5xl vf-leading-[0.95] vf-tracking-[-0.045em] sm:vf-text-6xl lg:vf-text-7xl">{profile.brand.heroTitle}</h1>
          <p className="vf-mt-5 vf-max-w-2xl vf-text-base vf-leading-7 vf-text-white/86 sm:vf-text-lg">{profile.brand.heroSubtitle}</p>
          <div className="vf-mt-8 vf-flex vf-flex-wrap vf-gap-3">
            {["Instant date preview", "Nightly pricing", "Guest add-ons"].map((item) => (
              <span key={item} className="vf-rounded-full vf-border vf-border-white/18 vf-bg-white/12 vf-px-4 vf-py-2 vf-text-xs vf-font-medium vf-text-white/88 vf-backdrop-blur-md">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="vf-rounded-[2rem] vf-border vf-border-white/18 vf-bg-white/12 vf-p-4 vf-shadow-[0_24px_80px_rgba(0,0,0,0.22)] vf-backdrop-blur-xl">
          <div className="vf-rounded-[1.5rem] vf-bg-[#FFFDF9] vf-p-5">
            <p className="vf-text-xs vf-font-semibold vf-uppercase vf-tracking-[0.22em] vf-text-[#A59483]">Featured stay</p>
            <h2 className="vf-mt-3 vf-font-serif vf-text-3xl vf-leading-tight vf-text-[#1C1917]">{selectedResource?.label ?? "Garden Villa"}</h2>
            <p className="vf-mt-2 vf-text-sm vf-leading-6 vf-text-[#76685E]">{selectedResource?.description ?? "A calm private stay for family weekends and intimate celebrations."}</p>
            <div className="vf-mt-5 vf-grid vf-grid-cols-2 vf-gap-3">
              <InfoTile label="From" value={selectedResource ? `${formatCurrency(selectedResource.rate)} / night` : "₱8,500 / night"} />
              <InfoTile label="Sample stay" value={pluralize(nights, "night")} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="vf-rounded-2xl vf-bg-[#F7F1EA] vf-p-4">
      <p className="vf-text-[11px] vf-font-semibold vf-uppercase vf-tracking-[0.18em] vf-text-[#9B8B7B]">{label}</p>
      <p className="vf-mt-1 vf-text-sm vf-font-semibold vf-text-[#1C1917]">{value}</p>
    </div>
  );
}

function TrustBar() {
  return (
    <section className="vf-grid vf-gap-3 sm:vf-grid-cols-3">
      {[
        ["Designed for stays", "Check-in/out flow, nightly pricing, guest-ready add-ons."],
        ["Mobile-first booking", "Guests can reserve comfortably from any device."],
        ["Premium checkout", "Clear totals before submitting a reservation."],
      ].map(([title, description]) => (
        <div key={title} className="vf-rounded-3xl vf-border vf-border-[#E7DFD5] vf-bg-[#FFFDF9] vf-p-5 vf-shadow-[0_1px_3px_rgba(28,25,23,0.05)]">
          <p className="vf-text-sm vf-font-semibold vf-text-[#1C1917]">{title}</p>
          <p className="vf-mt-2 vf-text-sm vf-leading-6 vf-text-[#76685E]">{description}</p>
        </div>
      ))}
    </section>
  );
}

function SectionCard({ id, label, title, children, right }: { id?: string; label: string; title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section id={id} className="vf-rounded-[2rem] vf-border vf-border-[#E3D9CF] vf-bg-[#FFFDF9] vf-p-5 vf-shadow-[0_12px_40px_rgba(28,25,23,0.045)] sm:vf-p-6">
      <div className="vf-mb-5 vf-flex vf-items-end vf-justify-between vf-gap-4">
        <div>
          <p className="vf-text-[11px] vf-font-semibold vf-uppercase vf-tracking-[0.24em] vf-text-[#A59483]">{label}</p>
          <h2 className="vf-mt-1 vf-font-serif vf-text-3xl vf-leading-tight vf-text-[#1C1917]">{title}</h2>
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function StayDateSection({ dates, checkInDate, checkOutDate, onSelectCheckIn, onSelectCheckout }: { dates: Date[]; checkInDate: Date; checkOutDate: Date; onSelectCheckIn: (date: Date) => void; onSelectCheckout: (date: Date) => void }) {
  const checkoutDates = dates.filter((date) => date > checkInDate);

  return (
    <SectionCard label="Dates" title="Select your stay dates" right={<span className="vf-hidden vf-text-sm vf-text-[#7A6E63] sm:vf-inline">{monthFormatter.format(checkInDate)}</span>}>
      <div className="vf-grid vf-gap-5 xl:vf-grid-cols-2">
        <DateRail title="Check-in" dates={dates} selectedDate={checkInDate} onSelectDate={onSelectCheckIn} />
        <DateRail title="Check-out" dates={checkoutDates} selectedDate={checkOutDate} onSelectDate={onSelectCheckout} disabledBefore={checkInDate} />
      </div>
      <div className="vf-mt-5 vf-rounded-2xl vf-bg-[#F6EFE7] vf-p-4 vf-text-sm vf-text-[#6F6257]">
        <span className="vf-font-semibold vf-text-[#1C1917]">{stayRangeLabel(checkInDate, checkOutDate)}</span> · {pluralize(Math.max(1, getDayDifference(checkInDate, checkOutDate)), "night")}
      </div>
    </SectionCard>
  );
}

function DateRail({ title, dates, selectedDate, onSelectDate, disabledBefore }: { title: string; dates: Date[]; selectedDate: Date; onSelectDate: (date: Date) => void; disabledBefore?: Date }) {
  return (
    <div>
      <p className="vf-mb-3 vf-text-sm vf-font-semibold vf-text-[#1C1917]">{title}</p>
      <div className="vf-scrollbar-hide vf-flex vf-gap-3 vf-overflow-x-auto vf-pb-2">
        {dates.map((date) => {
          const selected = isSameDay(date, selectedDate);
          const disabled = disabledBefore ? date <= disabledBefore : false;
          return (
            <button
              key={`${title}-${date.toISOString()}`}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(date)}
              className="vf-h-20 vf-w-16 vf-shrink-0 vf-rounded-2xl vf-border vf-border-[#E1D7CC] vf-bg-white vf-text-center vf-transition hover:vf-border-[#BCA891] active:vf-scale-[0.98] disabled:vf-cursor-not-allowed disabled:vf-bg-[#F3ECE3] disabled:vf-text-[#B0A397]"
              style={selected ? { backgroundColor: profile.brand.primaryColor, borderColor: profile.brand.primaryColor, color: "white" } : undefined}
            >
              <span className="vf-block vf-text-[10px] vf-font-semibold vf-uppercase vf-tracking-wide vf-opacity-70">{isSameDay(date, new Date()) ? "Today" : formatWeekday(date)}</span>
              <span className="vf-mt-1 vf-block vf-text-sm vf-font-semibold">{dateFormatter.format(date)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StayResourceSection({ selectedResourceId, onSelectResource }: { selectedResourceId: string; onSelectResource: (resource: ResourceConfig) => void }) {
  return (
    <SectionCard id="stays" label="Stay" title="Choose your private stay">
      <div className="vf-grid vf-gap-4 md:vf-grid-cols-3">
        {profile.resources.map((resource, index) => {
          const selected = resource.id === selectedResourceId;
          return (
            <button
              key={resource.id}
              type="button"
              onClick={() => onSelectResource(resource)}
              className="vf-group vf-overflow-hidden vf-rounded-[1.65rem] vf-border vf-border-[#E1D7CC] vf-bg-white vf-p-2 vf-text-left vf-shadow-[0_1px_3px_rgba(28,25,23,0.06)] vf-transition hover:vf--translate-y-0.5 hover:vf-border-[#BCA891] hover:vf-shadow-[0_16px_42px_rgba(28,25,23,0.10)] active:vf-scale-[0.99]"
              style={selected ? { borderColor: profile.brand.primaryColor, boxShadow: `0 0 0 2px ${profile.brand.primaryColor}24, 0 16px 42px rgba(28,25,23,0.08)` } : undefined}
            >
              <div className="vf-relative vf-aspect-[4/3] vf-overflow-hidden vf-rounded-[1.25rem]" style={gradientForResource(index, profile.brand.primaryColor)}>
                <div className="vf-absolute vf-inset-x-4 vf-bottom-4 vf-flex vf-items-center vf-justify-between vf-gap-3">
                  <span className="vf-rounded-full vf-bg-white/88 vf-px-3 vf-py-1.5 vf-text-xs vf-font-semibold vf-text-[#1C1917] vf-backdrop-blur">{formatCurrency(resource.rate)} / night</span>
                  {selected ? <span className="vf-rounded-full vf-bg-[#1C1917] vf-px-3 vf-py-1.5 vf-text-xs vf-font-semibold vf-text-white">Selected</span> : null}
                </div>
              </div>
              <div className="vf-px-3 vf-pb-3 vf-pt-4">
                <p className="vf-font-serif vf-text-2xl vf-leading-tight vf-text-[#1C1917]">{resource.label}</p>
                <p className="vf-mt-2 vf-text-[11px] vf-font-semibold vf-uppercase vf-tracking-[0.18em] vf-text-[#A59483]">{resource.meta}</p>
                <p className="vf-mt-3 vf-text-sm vf-leading-6 vf-text-[#76685E]">{resource.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}

function GuestSection({ guestCount, onSetGuestCount, selectedResource }: { guestCount: number; onSetGuestCount: (count: number) => void; selectedResource: ResourceConfig }) {
  return (
    <SectionCard label="Guests" title="Set your group size" right={<span className="vf-text-sm vf-text-[#7A6E63]">{selectedResource.meta}</span>}>
      <div className="vf-flex vf-flex-col vf-gap-4 sm:vf-flex-row sm:vf-items-center sm:vf-justify-between">
        <div>
          <p className="vf-text-sm vf-font-semibold vf-text-[#1C1917]">Guests staying overnight</p>
          <p className="vf-mt-1 vf-text-sm vf-leading-6 vf-text-[#76685E]">This helps the venue prepare linens, amenities, and add-on availability.</p>
        </div>
        <div className="vf-flex vf-w-full vf-items-center vf-justify-between vf-rounded-2xl vf-border vf-border-[#E1D7CC] vf-bg-[#F8F4EE] vf-p-2 sm:vf-w-auto">
          <button type="button" onClick={() => onSetGuestCount(Math.max(1, guestCount - 1))} className="vf-h-11 vf-w-11 vf-rounded-xl vf-border vf-border-[#E1D7CC] vf-bg-white vf-text-xl vf-text-[#1C1917]">−</button>
          <span className="vf-w-20 vf-text-center vf-text-lg vf-font-semibold vf-text-[#1C1917]">{guestCount}</span>
          <button type="button" onClick={() => onSetGuestCount(Math.min(24, guestCount + 1))} className="vf-h-11 vf-w-11 vf-rounded-xl vf-bg-[#6B4F3B] vf-text-xl vf-text-white">+</button>
        </div>
      </div>
    </SectionCard>
  );
}

function AddOnsSection({ selections, onSetQuantity }: { selections: AddonSelection[]; onSetQuantity: (addonId: string, quantity: number) => void }) {
  return (
    <SectionCard label="Enhancements" title="Curate your stay">
      <div className="vf-grid vf-gap-3 sm:vf-grid-cols-2">
        {profile.addons.map((addon) => {
          const quantity = selections.find((selection) => selection.addonId === addon.id)?.quantity ?? 0;
          return (
            <div key={addon.id} className="vf-rounded-2xl vf-border vf-border-[#E1D7CC] vf-bg-[#F8F4EE] vf-p-4">
              <div className="vf-flex vf-items-start vf-justify-between vf-gap-4">
                <div>
                  <p className="vf-text-sm vf-font-semibold vf-text-[#1C1917]">{addon.label}</p>
                  <p className="vf-mt-1 vf-text-sm vf-leading-6 vf-text-[#76685E]">{addon.description}</p>
                  <p className="vf-mt-2 vf-text-sm vf-font-semibold vf-text-[#1C1917]">+ {formatCurrency(addon.price)}</p>
                </div>
              </div>
              <div className="vf-mt-4 vf-flex vf-items-center vf-justify-between vf-rounded-full vf-bg-white vf-p-1">
                <button type="button" onClick={() => onSetQuantity(addon.id, Math.max(0, quantity - 1))} className="vf-h-9 vf-w-9 vf-rounded-full vf-border vf-border-[#E1D7CC] vf-text-lg">−</button>
                <span className="vf-text-sm vf-font-semibold vf-text-[#1C1917]">{quantity}</span>
                <button type="button" onClick={() => onSetQuantity(addon.id, Math.min(addon.maxQuantity, quantity + 1))} className="vf-h-9 vf-w-9 vf-rounded-full vf-bg-[#6B4F3B] vf-text-lg vf-text-white">+</button>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function ExperienceSection() {
  return (
    <section className="vf-border-t vf-border-[#E1D7CC] vf-py-12">
      <div className="vf-grid vf-gap-8 lg:vf-grid-cols-[0.9fr_1.1fr] lg:vf-items-center">
        <div>
          <p className="vf-text-[11px] vf-font-semibold vf-uppercase vf-tracking-[0.24em] vf-text-[#A59483]">Why this demo feels different</p>
          <h2 className="vf-mt-3 vf-font-serif vf-text-4xl vf-leading-tight vf-text-[#1C1917]">A booking page made for stays, not generic slots.</h2>
        </div>
        <div className="vf-grid vf-gap-3 sm:vf-grid-cols-3">
          {[
            ["Stay-first flow", "Check-in and check-out dates instead of time slots."],
            ["Guest-ready totals", "Nights, guests, add-ons, and totals stay clear."],
            ["Premium intent", "Copy and layout feel native to villas and staycations."],
          ].map(([title, copy]) => (
            <article key={title} className="vf-rounded-3xl vf-border vf-border-[#E1D7CC] vf-bg-[#FFFDF9] vf-p-5">
              <p className="vf-text-sm vf-font-semibold vf-text-[#1C1917]">{title}</p>
              <p className="vf-mt-2 vf-text-sm vf-leading-6 vf-text-[#76685E]">{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DesktopSummaryCard({ resource, checkInDate, checkOutDate, guestCount, nights, staySubtotal, addonTotal, total, canReserve, onOpen }: { resource: ResourceConfig; checkInDate: Date; checkOutDate: Date; guestCount: number; nights: number; staySubtotal: number; addonTotal: number; total: number; canReserve: boolean; onOpen: () => void }) {
  return (
    <section className="vf-rounded-[2rem] vf-border vf-border-[#E1D7CC] vf-bg-[#FFFDF9] vf-p-5 vf-shadow-[0_18px_60px_rgba(28,25,23,0.10)]">
      <p className="vf-text-[11px] vf-font-semibold vf-uppercase vf-tracking-[0.24em] vf-text-[#A59483]">Reservation summary</p>
      <h2 className="vf-mt-2 vf-font-serif vf-text-3xl vf-text-[#1C1917]">{resource.label}</h2>
      <p className="vf-mt-2 vf-text-sm vf-leading-6 vf-text-[#76685E]">{stayRangeLabel(checkInDate, checkOutDate)} · {pluralize(nights, "night")} · {pluralize(guestCount, "guest")}</p>

      <div className="vf-mt-5 vf-space-y-3">
        <SummaryRow label={`${formatCurrency(resource.rate)} × ${pluralize(nights, "night")}`} value={formatCurrency(staySubtotal)} />
        <SummaryRow label="Add-ons" value={formatCurrency(addonTotal)} />
        <div className="vf-border-t vf-border-[#E1D7CC] vf-pt-4">
          <SummaryRow label="Total" value={formatCurrency(total)} strong />
        </div>
      </div>

      <button type="button" disabled={!canReserve} onClick={onOpen} className="vf-mt-5 vf-w-full vf-rounded-2xl vf-bg-[#6B4F3B] vf-px-5 vf-py-4 vf-text-sm vf-font-semibold vf-text-white vf-transition active:vf-scale-[0.98] disabled:vf-cursor-not-allowed disabled:vf-bg-[#CDBEAE]">
        Review reservation
      </button>
      <p className="vf-mt-3 vf-text-center vf-text-xs vf-text-[#8B7D70]">No payment collected in this demo.</p>
    </section>
  );
}

function SupportCard() {
  return (
    <section className="vf-rounded-[2rem] vf-border vf-border-[#E1D7CC] vf-bg-[#F6EFE7] vf-p-5">
      <p className="vf-text-sm vf-font-semibold vf-text-[#1C1917]">Need help before booking?</p>
      <p className="vf-mt-2 vf-text-sm vf-leading-6 vf-text-[#76685E]">Add a contact or Messenger link here for venue inquiries, custom packages, or large group stays.</p>
      <a href={profile.brand.contact.chatUrl} className="vf-mt-4 vf-inline-flex vf-rounded-full vf-border vf-border-[#CDBEAE] vf-bg-white vf-px-4 vf-py-2 vf-text-sm vf-font-semibold vf-text-[#1C1917]">
        Contact venue
      </a>
    </section>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="vf-flex vf-items-center vf-justify-between vf-gap-4">
      <span className={strong ? "vf-text-base vf-font-semibold vf-text-[#1C1917]" : "vf-text-sm vf-text-[#76685E]"}>{label}</span>
      <span className={strong ? "vf-text-xl vf-font-semibold vf-text-[#1C1917]" : "vf-text-sm vf-font-semibold vf-text-[#1C1917]"}>{value}</span>
    </div>
  );
}

function MobileCheckoutBar({ resource, checkInDate, checkOutDate, nights, total, canReserve, onOpen }: { resource: ResourceConfig; checkInDate: Date; checkOutDate: Date; nights: number; total: number; canReserve: boolean; onOpen: () => void }) {
  return (
    <nav className="vf-fixed vf-inset-x-0 vf-bottom-0 vf-z-40 vf-border-t vf-border-[#E1D7CC] vf-bg-[#FFFDF9]/96 vf-px-4 vf-py-3 vf-backdrop-blur-xl lg:vf-hidden">
      <div className="vf-mx-auto vf-grid vf-max-w-3xl vf-grid-cols-[1fr_auto] vf-items-center vf-gap-3">
        <button type="button" onClick={onOpen} className="vf-min-w-0 vf-text-left">
          <p className="vf-truncate vf-text-sm vf-font-semibold vf-text-[#1C1917]">{resource.label}</p>
          <p className="vf-mt-0.5 vf-text-xs vf-text-[#76685E]">{stayRangeLabel(checkInDate, checkOutDate)} · {pluralize(nights, "night")} · {formatCurrency(total)}</p>
        </button>
        <button type="button" disabled={!canReserve} onClick={onOpen} className="vf-rounded-2xl vf-bg-[#6B4F3B] vf-px-5 vf-py-3 vf-text-sm vf-font-semibold vf-text-white vf-transition active:vf-scale-[0.98] disabled:vf-bg-[#CDBEAE]">
          Reserve
        </button>
      </div>
    </nav>
  );
}

function ReservationDrawer({ isOpen, onClose, resource, checkInDate, checkOutDate, guestCount, nights, staySubtotal, addonTotal, total, selections, onSetQuantity, canReserve, onComplete }: { isOpen: boolean; onClose: () => void; resource: ResourceConfig; checkInDate: Date; checkOutDate: Date; guestCount: number; nights: number; staySubtotal: number; addonTotal: number; total: number; selections: AddonSelection[]; onSetQuantity: (addonId: string, quantity: number) => void; canReserve: boolean; onComplete: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="vf-fixed vf-inset-0 vf-z-50 vf-flex vf-items-end vf-justify-center vf-bg-[#1C1917]/45 vf-px-3 vf-backdrop-blur-sm" role="dialog" aria-modal="true">
      <button type="button" className="vf-absolute vf-inset-0" onClick={onClose} aria-label="Close reservation summary" />
      <section className="vf-relative vf-max-h-[88vh] vf-w-full vf-max-w-xl vf-overflow-y-auto vf-rounded-t-[2rem] vf-border vf-border-white/60 vf-bg-[#FFFDF9] vf-p-5 vf-shadow-[0_-28px_90px_rgba(28,25,23,0.28)] sm:vf-mb-4 sm:vf-rounded-[2rem]">
        <div className="vf-mx-auto vf-mb-5 vf-h-1.5 vf-w-14 vf-rounded-full vf-bg-[#E1D7CC]" />
        <div className="vf-flex vf-items-start vf-justify-between vf-gap-4">
          <div>
            <p className="vf-text-[11px] vf-font-semibold vf-uppercase vf-tracking-[0.24em] vf-text-[#A59483]">Confirm stay</p>
            <h2 className="vf-mt-1 vf-font-serif vf-text-4xl vf-leading-tight vf-text-[#1C1917]">Reservation summary</h2>
          </div>
          <button type="button" onClick={onClose} className="vf-rounded-full vf-border vf-border-[#E1D7CC] vf-bg-white vf-px-4 vf-py-2 vf-text-xs vf-font-semibold vf-text-[#76685E]">Close</button>
        </div>

        <div className="vf-mt-5 vf-rounded-3xl vf-border vf-border-[#E1D7CC] vf-bg-[#F8F4EE] vf-p-5">
          <p className="vf-font-serif vf-text-3xl vf-text-[#1C1917]">{resource.label}</p>
          <p className="vf-mt-2 vf-text-sm vf-leading-6 vf-text-[#76685E]">{formatLongDate(checkInDate)} – {formatLongDate(checkOutDate)}</p>
          <p className="vf-mt-1 vf-text-sm vf-text-[#76685E]">{pluralize(nights, "night")} · {pluralize(guestCount, "guest")}</p>
        </div>

        <div className="vf-mt-5">
          <p className="vf-mb-3 vf-text-sm vf-font-semibold vf-text-[#1C1917]">Stay add-ons</p>
          <div className="vf-space-y-3">
            {profile.addons.map((addon) => {
              const quantity = selections.find((selection) => selection.addonId === addon.id)?.quantity ?? 0;
              return (
                <div key={addon.id} className="vf-flex vf-items-center vf-justify-between vf-gap-4 vf-rounded-2xl vf-border vf-border-[#E1D7CC] vf-bg-white vf-p-4">
                  <div>
                    <p className="vf-text-sm vf-font-semibold vf-text-[#1C1917]">{addon.label}</p>
                    <p className="vf-mt-1 vf-text-xs vf-text-[#76685E]">{formatCurrency(addon.price)} each</p>
                  </div>
                  <div className="vf-flex vf-items-center vf-gap-2 vf-rounded-full vf-bg-[#F8F4EE] vf-p-1">
                    <button type="button" onClick={() => onSetQuantity(addon.id, Math.max(0, quantity - 1))} className="vf-h-8 vf-w-8 vf-rounded-full vf-border vf-border-[#E1D7CC] vf-bg-white">−</button>
                    <span className="vf-w-5 vf-text-center vf-text-sm vf-font-semibold">{quantity}</span>
                    <button type="button" onClick={() => onSetQuantity(addon.id, Math.min(addon.maxQuantity, quantity + 1))} className="vf-h-8 vf-w-8 vf-rounded-full vf-bg-[#6B4F3B] vf-text-white">+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="vf-mt-5 vf-rounded-3xl vf-border vf-border-[#E1D7CC] vf-bg-white vf-p-5">
          <SummaryRow label={`${formatCurrency(resource.rate)} × ${pluralize(nights, "night")}`} value={formatCurrency(staySubtotal)} />
          <div className="vf-mt-3">
            <SummaryRow label="Add-ons" value={formatCurrency(addonTotal)} />
          </div>
          <div className="vf-mt-4 vf-border-t vf-border-[#E1D7CC] vf-pt-4">
            <SummaryRow label="Total" value={formatCurrency(total)} strong />
          </div>
        </div>

        <button type="button" disabled={!canReserve} onClick={onComplete} className="vf-mt-5 vf-w-full vf-rounded-2xl vf-bg-[#6B4F3B] vf-py-4 vf-text-sm vf-font-semibold vf-text-white vf-transition active:vf-scale-[0.98] disabled:vf-bg-[#CDBEAE]">
          Confirm reservation
        </button>
      </section>
    </div>
  );
}
