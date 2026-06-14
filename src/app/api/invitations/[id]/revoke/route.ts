import { NextResponse } from "next/server";
import { requireOrgContext } from "@/server/auth/context";
import { canOwnOrganization } from "@/server/auth/permissions";
import { revokeInvitation } from "@/server/invitations";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_: Request, { params }: RouteContext) {
  const [{ id }, auth] = await Promise.all([params, requireOrgContext()]);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!canOwnOrganization(auth.ctx.membership.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const invitation = await revokeInvitation(auth.ctx.organization.id, id);
  if (!invitation) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  return NextResponse.json({ invitation });
}
