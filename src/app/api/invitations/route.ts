import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireOrgContext } from "@/server/auth/context";
import { canOwnOrganization } from "@/server/auth/permissions";
import { createInvitation, listInvitationsForOrganization } from "@/server/invitations";

const invitationSchema = z.object({
  invited_email: z.email(),
  role: z.enum(["owner", "manager", "viewer"]).default("viewer"),
});

export async function GET() {
  const auth = await requireOrgContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!canOwnOrganization(auth.ctx.membership.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const invitations = await listInvitationsForOrganization(auth.ctx.organization.id);
  return NextResponse.json({ invitations });
}

export async function POST(request: NextRequest) {
  const auth = await requireOrgContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!canOwnOrganization(auth.ctx.membership.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = invitationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const invitation = await createInvitation({
    organizationId: auth.ctx.organization.id,
    invitedEmail: parsed.data.invited_email,
    role: parsed.data.role,
    invitedByClerkUserId: auth.ctx.clerkUserId,
  });

  return NextResponse.json({ invitation }, { status: 201 });
}
