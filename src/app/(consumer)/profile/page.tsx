import type { Metadata } from "next";
import { ProfilePage } from "@/components/consumer/profile-page";

export const metadata: Metadata = {
  title: "Profile — Kaisa Laga",
  description: "Manage your taste profile, dietary preferences, and account settings.",
};

export default function Page() {
  return <ProfilePage />;
}
