import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getMembershipForUser } from "@/lib/org-access";
import { z } from "zod";

const provisionSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingMembership = await getMembershipForUser(supabase, user);
  if (existingMembership) {
    return NextResponse.json({ error: "User already belongs to an organization" }, { status: 409 });
  }

  const parsed = provisionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const admin = createAdminClient();
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const { data: organization, error: orgError } = await admin
    .from("organizations")
    .insert({
      name: parsed.data.name,
      primary_language: "en",
      default_alert_email: user.email ?? null,
      alert_email: user.email ?? null,
      billing_status: "active",
    })
    .select()
    .single();

  if (orgError || !organization) {
    return NextResponse.json({ error: orgError?.message ?? "Failed to provision organization" }, { status: 500 });
  }

  const { error: membershipError } = await admin.from("organization_memberships").insert({
    id: randomUUID(),
    organization_id: organization.id,
    clerk_user_id: user.id,
    role: "owner",
  });

  if (membershipError) {
    await admin.from("organizations").delete().eq("id", organization.id);
    return NextResponse.json({ error: membershipError.message }, { status: 500 });
  }

  const { data: activePlan } = await admin
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("monthly_review_limit", { ascending: true })
    .limit(1)
    .maybeSingle();

  let subscriptionPeriod = null;
  if (activePlan) {
    const { data, error } = await admin
      .from("organization_subscription_periods")
      .insert({
        organization_id: organization.id,
        plan_id: activePlan.id,
        period_start: now.toISOString(),
        period_end: nextMonth.toISOString(),
        base_review_limit_snapshot: activePlan.monthly_review_limit,
        effective_review_limit: activePlan.monthly_review_limit,
        reviews_used: 0,
        status: "active",
      })
      .select()
      .single();

    if (error || !data) {
      await admin.from("organization_memberships").delete().eq("organization_id", organization.id);
      await admin.from("organizations").delete().eq("id", organization.id);
      return NextResponse.json({ error: error?.message ?? "Failed to create subscription period" }, { status: 500 });
    }

    subscriptionPeriod = data;

    const { error: updateError } = await admin
      .from("organizations")
      .update({ current_subscription_period_id: data.id })
      .eq("id", organization.id);

    if (updateError) {
      await admin.from("organization_subscription_periods").delete().eq("id", data.id);
      await admin.from("organization_memberships").delete().eq("organization_id", organization.id);
      await admin.from("organizations").delete().eq("id", organization.id);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  return NextResponse.json(
    {
      organization,
      membership: {
        organization_id: organization.id,
        clerk_user_id: user.id,
        role: "owner",
      },
      subscriptionPeriod,
    },
    { status: 201 },
  );
}
