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

  let submissionsQuery = ctx.admin
    .from("submissions")
    .select("id")
    .eq("status", "processed")
    .eq("organization_id", ctx.organization.id)
    .gte("created_at", since);

  if (locationId) {
    submissionsQuery = submissionsQuery.eq("location_id", locationId);
  }

  const { data: submissions, error: submissionsError } = await submissionsQuery;

  if (submissionsError) {
    return NextResponse.json({ error: submissionsError.message }, { status: 500 });
  }

  const submissionIds = (submissions ?? []).map((submission) => submission.id);
  if (submissionIds.length === 0) {
    return NextResponse.json({ days, categories: [] });
  }

  const { data, error } = await ctx.admin
    .from("submission_tags")
    .select("submission_id, tag")
    .in("submission_id", submissionIds);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.tag, (counts.get(row.tag) ?? 0) + 1);
  }

  const categories = Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({ days, categories });
}
