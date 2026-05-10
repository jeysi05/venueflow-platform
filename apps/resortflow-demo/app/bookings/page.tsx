import Link from "next/link";
import { resortProfile } from "@/config/profile";

const mockBookings = [
  {
    id: "RF-1001",
    resource: "Pool Day Pass",
    date: "May 12, 2026",
    duration: "1 day",
    total: "₱2,500",
    status: "Confirmed"
  },
  {
    id: "RF-1002",
    resource: "Cabana Access",
    date: "May 18, 2026",
    duration: "1 day",
    total: "₱4,200",
    status: "Pending"
  },
  {
    id: "RF-1003",
    resource: "Overnight Suite",
    date: "May 24–25, 2026",
    duration: "1 night",
    total: "₱9,500",
    status: "Confirmed"
  }
];

export default function ResortBookingsPage() {
  return (
    <main className="vf-min-h-screen vf-bg-[#F8F4EC] vf-px-4 vf-py-10 vf-text-[#1F211C] sm:vf-px-6">
      <section className="vf-mx-auto vf-max-w-3xl vf-rounded-[2rem] vf-border vf-border-[#E5E1DA] vf-bg-white vf-p-6 vf-shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:vf-p-8">
        <Link
          href="/"
          className="vf-inline-flex vf-rounded-full vf-border vf-border-[#E5E1DA] vf-bg-white vf-px-4 vf-py-2 vf-text-sm vf-font-medium vf-text-[#76685E] vf-transition hover:vf-border-[#BDB2A5] hover:vf-text-[#1F211C]"
        >
          ← Back to booking
        </Link>

        <p className="vf-mt-8 vf-text-xs vf-font-semibold vf-uppercase vf-tracking-[0.18em] vf-text-[#9A8F82]">
          {resortProfile.brand.name}
        </p>

        <h1 className="vf-mt-3 vf-font-serif vf-text-4xl vf-leading-tight vf-tracking-[-0.03em] sm:vf-text-5xl">
          My Bookings
        </h1>

        <p className="vf-mt-3 vf-max-w-2xl vf-text-sm vf-leading-7 vf-text-[#76685E]">
          This demo page shows how guests could review resort day passes, cabana reservations, and overnight stays.
        </p>

        <form className="vf-mt-8 vf-grid vf-gap-3 sm:vf-grid-cols-[1fr_auto]">
          <input
            className="vf-rounded-xl vf-border vf-border-[#E5E1DA] vf-bg-white vf-px-4 vf-py-3 vf-text-sm vf-outline-none focus:vf-border-[#17483E]"
            placeholder="Phone number"
          />
          <button
            type="button"
            className="vf-rounded-xl vf-px-5 vf-py-3 vf-text-sm vf-font-semibold vf-text-white"
            style={{ backgroundColor: resortProfile.brand.primaryColor }}
          >
            Search
          </button>
        </form>

        <div className="vf-mt-8 vf-space-y-4">
          {mockBookings.map((booking) => (
            <article
              key={booking.id}
              className="vf-rounded-2xl vf-border vf-border-[#E5E1DA] vf-bg-[#FBF8F1] vf-p-5"
            >
              <div className="vf-flex vf-flex-col vf-gap-4 sm:vf-flex-row sm:vf-items-center sm:vf-justify-between">
                <div>
                  <p className="vf-text-xs vf-font-semibold vf-uppercase vf-tracking-[0.16em] vf-text-[#9A8F82]">
                    {booking.id}
                  </p>
                  <h2 className="vf-mt-2 vf-text-lg vf-font-semibold vf-text-[#1F211C]">
                    {booking.resource}
                  </h2>
                  <p className="vf-mt-1 vf-text-sm vf-text-[#76685E]">
                    {booking.date} · {booking.duration}
                  </p>
                </div>

                <div className="vf-flex vf-items-center vf-gap-3">
                  <span className="vf-rounded-full vf-bg-white vf-px-4 vf-py-2 vf-text-sm vf-font-semibold vf-text-[#1F211C]">
                    {booking.total}
                  </span>
                  <span className="vf-rounded-full vf-bg-[#17483E] vf-px-4 vf-py-2 vf-text-sm vf-font-semibold vf-text-white">
                    {booking.status}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}