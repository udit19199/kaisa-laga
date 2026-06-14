import { NextRequest, NextResponse } from "next/server";
import { updateOrganizationSchema } from "@/lib/schemas";
import { requireOrgContext } from "@/server/auth/context";
import { updateOrganization } from "@/server/organizations";

export async function GET() {
  const auth = await requireOrgContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  return NextResponse.json({
    organization: {
      ...auth.ctx.organization,
      alert_email:
        auth.ctx.organization.default_alert_email ??
        auth.ctx.organization.alert_email ??
        null,
    },
  });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireOrgContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!auth.ctx.permissions.canOwnOrganization) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = updateOrganizationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const organization = await updateOrganization(auth.ctx.organization.id, {
    ...(parsed.data.name ? { name: parsed.data.name } : {}),
    ...(parsed.data.primary_language
      ? { primaryLanguage: parsed.data.primary_language }
      : {}),
    ...(typeof parsed.data.alert_email !== "undefined"
      ? { alertEmail: parsed.data.alert_email }
      : {}),
  });

  if (!organization) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  return NextResponse.json({ organization });
}
