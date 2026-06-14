import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  acceptInvitation,
  createMembership,
  expireInvitation,
  getPendingInvitationByToken,
} from "@/server/invitations";
import { getMembershipByClerkUserId } from "@/server/organizations";

const acceptSchema = z.object({
  token: z.string().min(8),
});

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = acceptSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const invitation = await getPendingInvitationByToken(parsed.data.token);
  if (!invitation) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  if (new Date(invitation.expires_at) < new Date()) {
    await expireInvitation(invitation.id);
    return NextResponse.json({ error: "Invitation expired" }, { status: 410 });
  }

  const user = await currentUser();
  const email = user?.emailAddresses.find(
    (entry) => entry.id === user.primaryEmailAddressId,
  )?.emailAddress;

  if (email?.toLowerCase() !== invitation.invited_email.toLowerCase()) {
    return NextResponse.json(
      { error: "Invitation email does not match the signed-in account" },
      { status: 403 },
    );
  }

  const currentMembership = await getMembershipByClerkUserId(userId);
  if (
    currentMembership &&
    currentMembership.organization_id !== invitation.organization_id
  ) {
    return NextResponse.json(
      { error: "User already belongs to another organization" },
      { status: 409 },
    );
  }

  if (currentMembership?.organization_id === invitation.organization_id) {
    const acceptedInvitation = await acceptInvitation(invitation.id);
    return NextResponse.json({
      membership: currentMembership,
      invitation: acceptedInvitation ?? { ...invitation, status: "accepted" },
    });
  }

  const membership = await createMembership({
    organizationId: invitation.organization_id,
    clerkUserId: userId,
    role: invitation.role,
  });

  if (!membership) {
    return NextResponse.json({ error: "Failed to accept invitation" }, { status: 500 });
  }

  const acceptedInvitation = await acceptInvitation(invitation.id);

  return NextResponse.json({
    membership,
    invitation: acceptedInvitation ?? { ...invitation, status: "accepted" },
  });
}
