import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireOrgContext } from "@/lib/clerk-org";
import { createLocationSchema } from "@/lib/schemas";

export async function GET() {
  const ctx = await requireOrgContext();
  if (!ctx.ok) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const { data, error } = await ctx.admin
    .from("locations")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ locations: data ?? [] });
}

export async function POST(request: NextRequest) {
  const ctx = await requireOrgContext();
  if (!ctx.ok) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  if (!ctx.permissions.canManageOrganization) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createLocationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { data, error } = await ctx.admin
    .from("locations")
    .insert({
      org_id: ctx.organization.id,
      organization_id: ctx.organization.id,
      name: parsed.data.name,
      is_active: true,
      public_capture_token: randomUUID(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ location: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const ctx = await requireOrgContext();
  if (!ctx.ok) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  if (!ctx.permissions.canManageOrganization) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const id = body.id as string | undefined;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof body.name === "string") updates.name = body.name;
  if (typeof body.alert_email_override !== "undefined") {
    updates.alert_email_override = body.alert_email_override || null;
  }
  if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

  const { data, error } = await ctx.admin
    .from("locations")
    .update(updates)
    .eq("id", id)
    .eq("organization_id", ctx.organization.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ location: data });
}

export async function DELETE(request: NextRequest) {
  const ctx = await requireOrgContext();
  if (!ctx.ok) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  if (!ctx.permissions.canManageOrganization) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { error } = await ctx.admin
    .from("locations")
    .delete()
    .eq("id", id)
    .eq("organization_id", ctx.organization.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
