import { NextResponse } from "next/server";
import { requireOrgContext } from "@/lib/clerk-org";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_: Request, { params }: RouteContext) {
  const ctx = await requireOrgContext();
  if (!ctx.ok) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  if (!ctx.permissions.canManageOrganization) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { data, error } = await ctx.admin
    .from("locations")
    .update({ public_capture_token: crypto.randomUUID() })
    .eq("id", id)
    .eq("organization_id", ctx.organization.id)
    .select("public_capture_token")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ public_capture_token: data.public_capture_token });
}
