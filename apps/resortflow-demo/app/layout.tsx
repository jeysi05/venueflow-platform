import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@venueflow/booking-engine/styles";
import { resortProfile } from "@/config/profile";

export const metadata: Metadata = {
  title: `${resortProfile.brand.name} Booking`,
  description: resortProfile.brand.heroSubtitle
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="vf-font-sans vf-antialiased">{children}</body>
    </html>
  );
}