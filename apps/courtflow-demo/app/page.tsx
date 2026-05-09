import { BookingSite } from "@venueflow/booking-engine";
import { profile } from "@/config/profile";

export default function HomePage() {
  return <BookingSite profile={profile} />;
}
