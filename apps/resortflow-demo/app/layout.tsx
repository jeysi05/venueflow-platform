import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@venueflow/booking-engine/styles";
import { profile } from "@/config/profile";

export const metadata: Metadata = {
  title: `${profile.brand.name} Booking`,
  description: profile.brand.heroSubtitle
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="vf-font-sans vf-antialiased">{children}</body>
    </html>
  );
}
