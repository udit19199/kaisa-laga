import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAppUrl } from "@/lib/app-url";
import { requireOrgContext } from "@/server/auth/context";
import type { Location } from "@/lib/types";
import { listLocationsForOrganization } from "@/server/locations";
import { LocationsTableClient } from "./locations-client";

export default async function LocationsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const authResult = await requireOrgContext();
  if (!authResult.ok) {
    if (authResult.status === 404) {
      redirect("/dashboard/onboarding");
    }

    return (
      <div className="rounded-md border bg-card p-4 text-sm text-destructive">
        Unable to load locations: {authResult.error}
      </div>
    );
  }

  const locations = await listLocationsForOrganization(authResult.ctx.organization.id);
  const appUrl = getAppUrl(await headers());

  return (
    <LocationsTableClient
      initialLocations={locations as Location[]}
      appUrl={appUrl}
    />
  );
}
