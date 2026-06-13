import { NextResponse } from "next/server";
import { requireOrgContext } from "@/lib/clerk-org";

export async function GET() {
  const ctx = await requireOrgContext();
  if (!ctx.ok) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const { data, error } = await ctx.admin
    .from("organization_memberships")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ memberships: data ?? [] });
}
