import "server-only";

import { and, eq, gte, inArray, isNotNull } from "drizzle-orm";
import { format, subDays } from "date-fns";
import { db } from "@/db";
import { locations, submissionTags, submissions } from "@/db/schema";

export async function getSentimentAnalytics(params: {
  organizationId: string;
  locationId?: string | null;
  days: number;
}) {
  const since = subDays(new Date(), params.days).toISOString();

  const orgLocationRows = await db
    .select({ id: locations.id })
    .from(locations)
    .where(eq(locations.organizationId, params.organizationId));

  const locationIds = orgLocationRows.map((row) => row.id);
  if (locationIds.length === 0) {
    return {
      days: params.days,
      series: Array.from({ length: params.days }, (_, index) => ({
        date: format(subDays(new Date(), params.days - 1 - index), "yyyy-MM-dd"),
        Positive: 0,
        Neutral: 0,
        Negative: 0,
      })),
      locationsBreakdown: [],
    };
  }

  if (params.locationId && !locationIds.includes(params.locationId)) {
    return { error: "Location not found" as const };
  }

  const targetLocationIds = params.locationId ? [params.locationId] : locationIds;

  const rows = await db
    .select({
      sentiment: submissions.sentiment,
      createdAt: submissions.createdAt,
      locationId: submissions.locationId,
    })
    .from(submissions)
    .where(
      and(
        inArray(submissions.locationId, targetLocationIds),
        eq(submissions.status, "processed"),
        eq(submissions.organizationId, params.organizationId),
        gte(submissions.createdAt, since),
        isNotNull(submissions.sentiment),
      ),
    );

  const dailyMap = new Map<string, { Positive: number; Neutral: number; Negative: number }>();
  const locationMap = new Map<
    string,
    {
      total: number;
      Positive: number;
      Neutral: number;
      Negative: number;
      daily: Record<string, { Positive: number; Neutral: number; Negative: number }>;
    }
  >();

  for (let index = 0; index < params.days; index += 1) {
    const date = format(subDays(new Date(), params.days - 1 - index), "yyyy-MM-dd");
    dailyMap.set(date, { Positive: 0, Neutral: 0, Negative: 0 });
  }

  for (const id of locationIds) {
    const daily: Record<string, { Positive: number; Neutral: number; Negative: number }> = {};
    for (let index = 0; index < params.days; index += 1) {
      const date = format(subDays(new Date(), params.days - 1 - index), "yyyy-MM-dd");
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

  for (const row of rows) {
    if (!row.sentiment) {
      continue;
    }

    const date = format(new Date(row.createdAt), "yyyy-MM-dd");
    const bucket = dailyMap.get(date);
    if (bucket) {
      bucket[row.sentiment]++;
    }

    const stats = locationMap.get(row.locationId);
    if (stats) {
      stats.total++;
      stats[row.sentiment]++;
      if (stats.daily[date]) {
        stats.daily[date][row.sentiment]++;
      }
    }
  }

  const series = [...dailyMap.entries()].map(([date, counts]) => ({
    date,
    ...counts,
  }));

  const locationsBreakdown = [...locationMap.entries()].map(([id, stats]) => ({
    locationId: id,
    total: stats.total,
    Positive: stats.Positive,
    Neutral: stats.Neutral,
    Negative: stats.Negative,
    daily: Object.entries(stats.daily)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, counts]) => ({
        date,
        total: counts.Positive + counts.Neutral + counts.Negative,
        ...counts,
      })),
  }));

  return { days: params.days, series, locationsBreakdown };
}

export async function getCategoryAnalytics(params: {
  organizationId: string;
  locationId?: string | null;
  days: number;
}) {
  const since = subDays(new Date(), params.days).toISOString();

  const filters = [
    eq(submissions.status, "processed"),
    eq(submissions.organizationId, params.organizationId),
    gte(submissions.createdAt, since),
  ];

  if (params.locationId) {
    filters.push(eq(submissions.locationId, params.locationId));
  }

  const submissionRows = await db
    .select({ id: submissions.id })
    .from(submissions)
    .where(and(...filters));

  const submissionIds = submissionRows.map((row) => row.id);
  if (submissionIds.length === 0) {
    return { days: params.days, categories: [] as Array<{ tag: string; count: number }> };
  }

  const tagRows = await db
    .select({
      tag: submissionTags.tag,
    })
    .from(submissionTags)
    .where(inArray(submissionTags.submissionId, submissionIds));

  const counts = new Map<string, number>();
  for (const row of tagRows) {
    counts.set(row.tag, (counts.get(row.tag) ?? 0) + 1);
  }

  const categories = [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  return { days: params.days, categories };
}
