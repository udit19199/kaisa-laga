import { NextRequest, NextResponse } from "next/server";
import { requireOrgContext } from "@/lib/clerk-org";
import { subDays } from "date-fns";

export async function GET(request: NextRequest) {
  const ctx = await requireOrgContext();
  if (!ctx.ok) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const { searchParams } = request.nextUrl;
  const locationId = searchParams.get("locationId");
  const days = Math.min(90, Math.max(1, parseInt(searchParams.get("days") ?? "7", 10)));
  const since = subDays(new Date(), days).toISOString();

  const { data: orgLocations } = await ctx.admin
    .from("locations")
    .select("id")
    .eq("org_id", ctx.organization.id);

  const locationIds = (orgLocations ?? []).map((l) => l.id);
  if (locationIds.length === 0) {
    return NextResponse.json({ days, categories: [] });
  }

  if (locationId && !locationIds.includes(locationId)) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  const { data, error } = await ctx.admin
    .from("submissions")
    .select("tags")
    .in("location_id", locationId ? [locationId] : locationIds)
    .eq("status", "processed")
    .gte("created_at", since);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    for (const tag of row.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  const categories = Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({ days, categories });
}
