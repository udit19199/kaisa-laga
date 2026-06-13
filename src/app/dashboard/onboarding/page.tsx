import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { GlassCard, LiquidGlassProvider } from "@/components/liquid-glass";
import { getOrganizationForClerkUser } from "@/lib/clerk-org";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const organization = await getOrganizationForClerkUser(userId);
  if (organization) {
    redirect("/dashboard");
  }

  return (
    <LiquidGlassProvider className="brand-surface flex min-h-dvh items-center justify-center px-4">
      <GlassCard className="w-full max-w-sm">
        <OnboardingForm />
      </GlassCard>
    </LiquidGlassProvider>
  );
}
