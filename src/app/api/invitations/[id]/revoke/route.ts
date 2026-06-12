import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canOwnOrganization, getMembershipForUser } from "@/lib/org-access";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_: Request, { params }: RouteContext) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getMembershipForUser(supabase, user);
  if (!membership || !canOwnOrganization(membership.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("organization_invitations")
    .update({ status: "revoked" })
    .eq("id", id)
    .eq("organization_id", membership.organization_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ invitation: data });
}
