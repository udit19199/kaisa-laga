import { NextRequest, NextResponse } from "next/server";
import {
  getClerkUserId,
  getOrganizationForClerkUser,
  getPrimaryEmailForClerkUser,
} from "@/lib/clerk-org";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const clerkUserId = await getClerkUserId();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await getOrganizationForClerkUser(clerkUserId);
  if (existing) {
    return NextResponse.json({ organization: existing });
  }

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const alertEmail = await getPrimaryEmailForClerkUser();
  const admin = createAdminClient();

  const { data: org, error } = await admin
    .from("organizations")
    .insert({
      name,
      clerk_user_id: clerkUserId,
      alert_email: alertEmail,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ organization: org }, { status: 201 });
}
