import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const provisionSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  const admin = createAdminClient();
  const { data: existingMembership, error: membershipLookupError } = await admin
    .from("organization_memberships")
    .select("id")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (membershipLookupError) {
    return NextResponse.json({ error: membershipLookupError.message }, { status: 500 });
  }

  if (existingMembership) {
    return NextResponse.json({ error: "User already belongs to an organization" }, { status: 409 });
  }

  const parsed = provisionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const primaryEmail = user
    ? user.emailAddresses.find((address) => address.id === user.primaryEmailAddressId)
        ?.emailAddress ?? null
    : null;
  const { data: provisionResult, error: provisionError } = await admin.rpc("provision_organization", {
    p_name: parsed.data.name,
    p_clerk_user_id: userId,
    p_clerk_user_email: primaryEmail,
  });

  if (provisionError) {
    return NextResponse.json({ error: provisionError.message }, { status: 500 });
  }

  const result = Array.isArray(provisionResult) ? provisionResult[0] : provisionResult;
  if (!result) {
    return NextResponse.json({ error: "Failed to provision organization" }, { status: 500 });
  }

  const [{ data: organization, error: organizationError }, { data: membership, error: membershipError }, { data: subscriptionPeriod, error: subscriptionPeriodError }] = await Promise.all([
    admin.from("organizations").select("*").eq("id", result.organization_id).single(),
    admin.from("organization_memberships").select("*").eq("id", result.membership_id).single(),
    admin.from("organization_subscription_periods").select("*").eq("id", result.subscription_period_id).maybeSingle(),
  ]);

  if (organizationError || membershipError || subscriptionPeriodError) {
    return NextResponse.json(
      {
        error:
          organizationError?.message ??
          membershipError?.message ??
          subscriptionPeriodError?.message ??
          "Failed to load provisioned organization",
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      organization,
      membership,
      subscriptionPeriod,
    },
    { status: 201 },
  );
}
