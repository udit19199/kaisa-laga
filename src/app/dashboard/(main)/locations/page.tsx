import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { requireOrgContext } from "@/lib/clerk-org";
import type { Location } from "@/lib/types";
import { LocationsTableClient } from "./locations-client";

export default async function LocationsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const ctx = await requireOrgContext();
  if (!ctx.ok) {
    if (ctx.status === 404) {
      redirect("/dashboard/onboarding");
    }

    return (
      <div className="rounded-md border bg-card p-4 text-sm text-destructive">
        Unable to load locations: {ctx.error}
      </div>
    );
  }

  const { data, error } = await ctx.admin
    .from("locations")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .order("name");

  if (error) {
    return (
      <div className="rounded-md border bg-card p-4 text-sm text-destructive">
        Failed to load locations: {error.message}
      </div>
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <LocationsTableClient
      initialLocations={(data ?? []) as Location[]}
      appUrl={appUrl}
    />
  );
}
