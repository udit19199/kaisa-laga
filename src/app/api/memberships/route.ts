import { NextResponse } from "next/server";
import { requireOrgContext } from "@/server/auth/context";
import { listMembershipsForOrganization } from "@/server/invitations";

export async function GET() {
  const auth = await requireOrgContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const memberships = await listMembershipsForOrganization(auth.ctx.organization.id);
  return NextResponse.json({ memberships });
}
