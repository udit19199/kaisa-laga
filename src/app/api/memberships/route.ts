import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMembershipForUser } from "@/lib/org-access";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getMembershipForUser(supabase, user);
  if (!membership) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("organization_memberships")
    .select("*")
    .eq("organization_id", membership.organization_id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ memberships: data ?? [] });
}
