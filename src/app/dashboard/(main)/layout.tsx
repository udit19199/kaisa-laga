import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Toaster } from "@/components/ui/sonner";
import { getOrganizationForClerkUser } from "@/lib/clerk-org";

export default async function DashboardMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const organization = await getOrganizationForClerkUser(userId);
  if (!organization) {
    redirect("/dashboard/onboarding");
  }

  return (
    <DashboardShell>
      <DashboardNav />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <Toaster />
    </DashboardShell>
  );
}
