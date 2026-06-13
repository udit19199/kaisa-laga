import { NextRequest, NextResponse } from "next/server";
import { requireOrgContext } from "@/lib/clerk-org";
import { updateOrganizationSchema } from "@/lib/schemas";

export async function GET() {
  const ctx = await requireOrgContext();
  if (!ctx.ok) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  return NextResponse.json({
    organization: {
      ...ctx.organization,
      alert_email:
        ctx.organization.default_alert_email ??
        ctx.organization.alert_email ??
        null,
    },
  });
}

export async function PATCH(request: NextRequest) {
  const ctx = await requireOrgContext();
  if (!ctx.ok) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  if (!ctx.permissions.canOwnOrganization) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateOrganizationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { data, error } = await ctx.admin
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
    .eq("id", ctx.organization.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ organization: data });
}
