import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canManageOrganization, getMembershipForUser } from "@/lib/org-access";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_: Request, { params }: RouteContext) {
  const [{ id }, supabase] = await Promise.all([
    params,
    createClient(),
  ]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getMembershipForUser(supabase, user);
  if (!membership || !canManageOrganization(membership.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("locations")
    .update({ public_capture_token: crypto.randomUUID() })
    .eq("id", id)
    .eq("organization_id", membership.organization_id)
    .select("public_capture_token")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ public_capture_token: data.public_capture_token });
}
