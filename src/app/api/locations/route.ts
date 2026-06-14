import { NextRequest, NextResponse } from "next/server";
import { createLocationSchema } from "@/lib/schemas";
import { requireOrgContext } from "@/server/auth/context";
import {
  createLocation,
  deleteLocation,
  listLocationsForOrganization,
  updateLocation,
} from "@/server/locations";

export async function GET() {
  const auth = await requireOrgContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const locations = await listLocationsForOrganization(auth.ctx.organization.id);
  return NextResponse.json({ locations });
}

export async function POST(request: NextRequest) {
  const auth = await requireOrgContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!auth.ctx.permissions.canManageOrganization) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = createLocationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const location = await createLocation(auth.ctx.organization.id, parsed.data.name);
  return NextResponse.json({ location }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireOrgContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!auth.ctx.permissions.canManageOrganization) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const id = body.id as string | undefined;
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const location = await updateLocation(auth.ctx.organization.id, id, {
    ...(typeof body.name === "string" ? { name: body.name } : {}),
    ...(typeof body.alert_email_override !== "undefined"
      ? { alertEmailOverride: body.alert_email_override || null }
      : {}),
    ...(typeof body.is_active === "boolean" ? { isActive: body.is_active } : {}),
  });

  if (!location) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  return NextResponse.json({ location });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireOrgContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!auth.ctx.permissions.canManageOrganization) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const deleted = await deleteLocation(auth.ctx.organization.id, id);
  if (!deleted) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
