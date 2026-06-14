import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { getOrganizationForClerkUser } from "@/server/auth/context";
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
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-sm">
        <OnboardingForm />
      </Card>
    </div>
  );
}
