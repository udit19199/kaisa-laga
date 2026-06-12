import { NextRequest, NextResponse } from "next/server";
import { subDays } from "date-fns";
import { requireOrgContext } from "@/lib/clerk-org";

export async function GET(request: NextRequest) {
  const ctx = await requireOrgContext();
  if (!ctx.ok) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const { searchParams } = request.nextUrl;
  const locationId = searchParams.get("locationId");
  const days = Math.min(90, Math.max(1, parseInt(searchParams.get("days") ?? "7", 10)));
  const since = subDays(new Date(), days).toISOString();

  let query = ctx.admin
    .from("submissions")
    .select("tags")
    .eq("status", "processed")
    .eq("organization_id", ctx.organization.id)
    .gte("created_at", since);

  if (locationId) {
    query = query.eq("location_id", locationId);
  }

  const { data, error } = await query;

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
