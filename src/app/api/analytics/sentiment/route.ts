import { NextRequest, NextResponse } from "next/server";
import { requireOrgContext } from "@/lib/clerk-org";
import { subDays, format } from "date-fns";
import { getMembershipForUser } from "@/lib/org-access";

export async function GET(request: NextRequest) {
  const ctx = await requireOrgContext();
  if (!ctx.ok) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const membership = await getMembershipForUser(supabase, user);
  if (!membership) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
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
    const series = Array.from({ length: days }, (_, i) => ({
      date: format(subDays(new Date(), days - 1 - i), "yyyy-MM-dd"),
      Positive: 0,
      Neutral: 0,
      Negative: 0,
    }));
    return NextResponse.json({ days, series });
  }

  if (locationId && !locationIds.includes(locationId)) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  const { data, error } = await ctx.admin
    .from("submissions")
    .select("sentiment, created_at, location_id")
    .in("location_id", locationId ? [locationId] : locationIds)
    .eq("status", "processed")
    .eq("organization_id", membership.organization_id)
    .gte("created_at", since)
    .not("sentiment", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const dailyMap = new Map<string, { Positive: number; Neutral: number; Negative: number }>();

  for (let i = 0; i < days; i++) {
    const date = format(subDays(new Date(), days - 1 - i), "yyyy-MM-dd");
    dailyMap.set(date, { Positive: 0, Neutral: 0, Negative: 0 });
  }

  for (const row of data ?? []) {
    const date = format(new Date(row.created_at), "yyyy-MM-dd");
    const bucket = dailyMap.get(date);
    if (bucket && row.sentiment) {
      bucket[row.sentiment as keyof typeof bucket]++;
    }
  }

  const series = Array.from(dailyMap.entries()).map(([date, counts]) => ({
    date,
    ...counts,
  }));

  return NextResponse.json({ days, series });
}
