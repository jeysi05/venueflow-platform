import Link from "next/link";
import { profile } from "@/config/profile";

export default function BookingsPage() {
  return (
    <main className="vf-min-h-screen vf-bg-[#F9F7F4] vf-px-4 vf-py-10 vf-text-[#1C1917]">
      <section className="vf-mx-auto vf-max-w-xl vf-rounded-3xl vf-border vf-border-[#E5E1DA] vf-bg-white vf-p-6 vf-shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <Link href="/" className="vf-text-sm vf-font-medium vf-text-[#78716C]">← Back to booking</Link>
        <h1 className="vf-mt-6 vf-font-serif vf-text-4xl vf-leading-tight">Find your reservation</h1>
        <p className="vf-mt-3 vf-text-sm vf-leading-6 vf-text-[#78716C]">
          This demo keeps lookup simple. In production, {profile.brand.name} would connect this page to your booking database and SMS/email confirmation flow.
        </p>
        <form className="vf-mt-6 vf-grid vf-gap-3 sm:vf-grid-cols-[1fr_auto]">
          <input className="vf-rounded-xl vf-border vf-border-[#E5E1DA] vf-bg-white vf-px-4 vf-py-3 vf-text-sm vf-outline-none" placeholder="Phone number" />
          <button type="button" className="vf-rounded-xl vf-px-5 vf-py-3 vf-text-sm vf-font-medium vf-text-white" style={{ backgroundColor: profile.brand.primaryColor }}>
            Search
          </button>
        </form>
      </section>
    </main>
  );
}
