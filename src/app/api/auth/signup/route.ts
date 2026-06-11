import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rollbackSignupProvisioning } from "@/lib/signup-provisioning";

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
    })
    .select()
    .single();

  if (orgError) {
    await rollbackSignupProvisioning(admin, userId);
    return NextResponse.json({ error: orgError.message }, { status: 500 });
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
