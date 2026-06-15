import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireOrgContext } from "@/server/auth/context";
import { updateLocationBranding } from "@/server/taste";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  tagline: z.string().trim().max(200).nullable().optional(),
  coverImageUrl: z
    .union([z.url(), z.literal("")])
    .nullable()
    .optional()
    .transform((value) => (value === "" ? null : value)),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireOrgContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid branding payload" }, { status: 400 });
  }

  const row = await updateLocationBranding(auth.ctx.organization.id, id, parsed.data);
  if (!row) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    cover_image_url: row.coverImageUrl,
    taste_summary: row.tasteSummary,
    taste_themes: row.tasteThemes ?? [],
  });
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const auth = await requireOrgContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  const { getLocationTastePanel } = await import("@/server/taste");
  const panel = await getLocationTastePanel(auth.ctx.organization.id, id);

  if (!panel) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: panel.id,
    name: panel.name,
    tagline: panel.tagline,
    cover_image_url: panel.coverImageUrl,
    taste_summary: panel.tasteSummary,
    taste_themes: panel.tasteThemes ?? [],
  });
}
