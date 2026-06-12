import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rollbackSignupProvisioning } from "@/lib/signup-provisioning";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  const { email, password, orgName } = body;

  if (!email || !password || !orgName) {
    return NextResponse.json(
      { error: "email, password, and orgName are required" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message ?? "Signup failed" },
      { status: 400 },
    );
  }

  const userId = authData.user.id;

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({
      name: orgName,
      owner_user_id: userId,
      alert_email: email,
      default_alert_email: email,
      billing_status: "active",
    })
    .select()
    .single();

  if (orgError) {
    await rollbackSignupProvisioning(admin, userId);
    return NextResponse.json({ error: orgError.message }, { status: 500 });
  }

  const { error: membershipError } = await admin.from("organization_memberships").insert({
    id: randomUUID(),
    organization_id: org.id,
    clerk_user_id: userId,
    role: "owner",
  });

  if (membershipError) {
    await rollbackSignupProvisioning(admin, userId);
    return NextResponse.json({ error: membershipError.message }, { status: 500 });
  }

  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const { data: activePlan } = await admin
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("monthly_review_limit", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (activePlan) {
    const { data: subscriptionPeriod, error: periodError } = await admin
      .from("organization_subscription_periods")
      .insert({
        organization_id: org.id,
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

    if (periodError || !subscriptionPeriod) {
      await rollbackSignupProvisioning(admin, userId);
      return NextResponse.json({ error: periodError?.message ?? "Failed to create subscription period" }, { status: 500 });
    }

    const { error: orgUpdateError } = await admin
      .from("organizations")
      .update({ current_subscription_period_id: subscriptionPeriod.id })
      .eq("id", org.id);

    if (orgUpdateError) {
      await rollbackSignupProvisioning(admin, userId);
      return NextResponse.json({ error: orgUpdateError.message }, { status: 500 });
    }
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    await rollbackSignupProvisioning(admin, userId);
    return NextResponse.json({ error: signInError.message }, { status: 500 });
  }

  return NextResponse.json({ user: authData.user, organization: org }, { status: 201 });
}
