import { NextRequest, NextResponse } from "next/server";
import { canOwnOrganization, getMembershipForUser, getOrganizationForUser } from "@/lib/org-access";
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
    const organization = await getOrganizationForUser(supabase, user);
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }
    return NextResponse.json({
      organization: {
        ...organization,
        alert_email:
          (organization as { default_alert_email?: string | null }).default_alert_email ??
          (organization as { alert_email?: string | null }).alert_email ??
          null,
      },
    });
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

  const membership = await getMembershipForUser(supabase, user);
  if (!membership || !canOwnOrganization(membership.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateOrganizationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("organizations")
    .update({
      ...(parsed.data.name ? { name: parsed.data.name } : {}),
      ...(parsed.data.primary_language ? { primary_language: parsed.data.primary_language } : {}),
      ...(typeof parsed.data.alert_email !== "undefined"
        ? {
            alert_email: parsed.data.alert_email,
            default_alert_email: parsed.data.alert_email,
          }
        : {}),
    })
    .eq("id", membership.organization_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ organization: data });
}
