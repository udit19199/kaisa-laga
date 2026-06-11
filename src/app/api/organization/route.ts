import { NextRequest, NextResponse } from "next/server";
import { getOrganizationForOwner } from "@/lib/organization";
import { createClient } from "@/lib/supabase/server";
import { updateOrganizationSchema } from "@/lib/schemas";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const organization = await getOrganizationForOwner(supabase, user);
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }
    return NextResponse.json({ organization });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load organization";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateOrganizationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("organizations")
    .update(parsed.data)
    .eq("owner_user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ organization: data });
}
