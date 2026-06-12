import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { subDays, format } from "date-fns";
import { getMembershipForUser } from "@/lib/org-access";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getMembershipForUser(supabase, user);
  if (!membership) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const { searchParams } = request.nextUrl;
  const locationId = searchParams.get("locationId");
  const days = Math.min(90, Math.max(1, parseInt(searchParams.get("days") ?? "7", 10)));
  const since = subDays(new Date(), days).toISOString();

  let query = supabase
    .from("submissions")
    .select("sentiment, created_at, location_id")
    .eq("status", "processed")
    .eq("organization_id", membership.organization_id)
    .gte("created_at", since)
    .not("sentiment", "is", null);

  if (locationId) {
    query = query.eq("location_id", locationId);
  }

  const { data, error } = await query;

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
