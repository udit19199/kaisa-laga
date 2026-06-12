import { NextRequest, NextResponse } from "next/server";
import { requireOrgContext } from "@/lib/clerk-org";
import { updateOrganizationSchema } from "@/lib/schemas";

export async function GET() {
  const ctx = await requireOrgContext();
  if (!ctx.ok) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  return NextResponse.json({ organization: ctx.organization });
}

export async function PATCH(request: NextRequest) {
  const ctx = await requireOrgContext();
  if (!ctx.ok) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const body = await request.json();
  const parsed = updateOrganizationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { data, error } = await ctx.admin
    .from("organizations")
    .update(parsed.data)
    .eq("id", ctx.organization.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ organization: data });
}
