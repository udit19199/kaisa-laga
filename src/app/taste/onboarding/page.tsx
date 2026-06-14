import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TasteOnboardingFlow } from "@/components/consumer/taste-onboarding-flow";
import { DINER_SIGN_IN_PATH } from "@/lib/auth-routes";

export const metadata: Metadata = {
  title: "Taste profile — Kaisa Laga",
};

export default async function TasteOnboardingPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect(DINER_SIGN_IN_PATH);
  }

  return <TasteOnboardingFlow />;
}
