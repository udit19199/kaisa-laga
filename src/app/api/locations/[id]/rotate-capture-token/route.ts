import { NextResponse } from "next/server";
import { requireOrgContext } from "@/server/auth/context";
import { rotateLocationCaptureToken } from "@/server/locations";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_: Request, { params }: RouteContext) {
  const auth = await requireOrgContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!auth.ctx.permissions.canManageOrganization) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const token = await rotateLocationCaptureToken(auth.ctx.organization.id, id);

  if (!token) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  return NextResponse.json({ public_capture_token: token });
}
