import { NextRequest, NextResponse } from "next/server";
import { requireOrgContext } from "@/lib/clerk-org";
import { subDays, format } from "date-fns";
import { getMembershipForUser } from "@/lib/org-access";

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
    .eq("organization_id", ctx.organization.id)
    .gte("created_at", since)
    .not("sentiment", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const dailyMap = new Map<string, { Positive: number; Neutral: number; Negative: number }>();
  const locationMap = new Map<string, {
    total: number;
    Positive: number;
    Neutral: number;
    Negative: number;
    daily: Record<string, { Positive: number; Neutral: number; Negative: number }>
  }>();

  // Initialize daily buckets
  for (let i = 0; i < days; i++) {
    const date = format(subDays(new Date(), days - 1 - i), "yyyy-MM-dd");
    dailyMap.set(date, { Positive: 0, Neutral: 0, Negative: 0 });
  }

  // Initialize location stats
  for (const id of locationIds) {
    const daily: Record<string, { Positive: number; Neutral: number; Negative: number }> = {};
    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), days - 1 - i), "yyyy-MM-dd");
      daily[date] = { Positive: 0, Neutral: 0, Negative: 0 };
    }
    locationMap.set(id, {
      total: 0,
      Positive: 0,
      Neutral: 0,
      Negative: 0,
      daily,
    });
  }

  // Populate data
  for (const row of data ?? []) {
    const date = format(new Date(row.created_at), "yyyy-MM-dd");
    
    // Global series
    const bucket = dailyMap.get(date);
    if (bucket && row.sentiment) {
      bucket[row.sentiment as keyof typeof bucket]++;
    }

    // Location breakdown
    const locId = row.location_id;
    const stats = locationMap.get(locId);
    if (stats && row.sentiment) {
      stats.total++;
      stats[row.sentiment as "Positive" | "Neutral" | "Negative"]++;
      if (stats.daily[date]) {
        stats.daily[date][row.sentiment as "Positive" | "Neutral" | "Negative"]++;
      }
    }
  }

  const series = Array.from(dailyMap.entries()).map(([date, counts]) => ({
    date,
    ...counts,
  }));

  const locationsBreakdown = Array.from(locationMap.entries()).map(([id, stats]) => {
    const dailySeries = Object.entries(stats.daily)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, counts]) => ({
        date,
        total: counts.Positive + counts.Neutral + counts.Negative,
        ...counts,
      }));
    return {
      locationId: id,
      total: stats.total,
      Positive: stats.Positive,
      Neutral: stats.Neutral,
      Negative: stats.Negative,
      daily: dailySeries,
    };
  });

  return NextResponse.json({ days, series, locationsBreakdown });
}
