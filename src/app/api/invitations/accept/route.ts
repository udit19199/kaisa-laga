import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getMembershipForUser } from "@/lib/org-access";

const acceptSchema = z.object({
  token: z.string().min(8),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = acceptSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: invitation, error } = await admin
    .from("organization_invitations")
    .select("*")
    .eq("token", parsed.data.token)
    .eq("status", "pending")
    .single();

  if (error || !invitation) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  if (new Date(invitation.expires_at) < new Date()) {
    await admin.from("organization_invitations").update({ status: "expired" }).eq("id", invitation.id);
    return NextResponse.json({ error: "Invitation expired" }, { status: 410 });
  }

  if (user.email?.toLowerCase() !== invitation.invited_email.toLowerCase()) {
    return NextResponse.json({ error: "Invitation email does not match the signed-in account" }, { status: 403 });
  }

  const currentMembership = await getMembershipForUser(supabase, user);
  if (currentMembership && currentMembership.organization_id !== invitation.organization_id) {
    return NextResponse.json({ error: "User already belongs to another organization" }, { status: 409 });
  }

  if (currentMembership?.organization_id === invitation.organization_id) {
    await admin
      .from("organization_invitations")
      .update({ status: "accepted" })
      .eq("id", invitation.id);
    return NextResponse.json({
      membership: currentMembership,
      invitation: { ...invitation, status: "accepted" },
    });
  }

  const { data: membership, error: membershipError } = await admin
    .from("organization_memberships")
    .insert({
      organization_id: invitation.organization_id,
      clerk_user_id: user.id,
      role: invitation.role,
    })
    .select()
    .single();

  if (membershipError || !membership) {
    return NextResponse.json({ error: membershipError?.message ?? "Failed to accept invitation" }, { status: 500 });
  }

  await admin
    .from("organization_invitations")
    .update({ status: "accepted" })
    .eq("id", invitation.id);

  return NextResponse.json({ membership, invitation: { ...invitation, status: "accepted" } });
}
