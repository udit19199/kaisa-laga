import type { SupabaseClient, User } from "@supabase/supabase-js";

export type OrganizationRole = "owner" | "manager" | "viewer";

export interface OrganizationMembership {
  id: string;
  organization_id: string;
  clerk_user_id: string;
  role: OrganizationRole;
  created_at: string;
  updated_at: string;
}

export async function getMembershipForUser(
  supabase: SupabaseClient,
  user: User,
) {
  const { data, error } = await supabase
    .from("organization_memberships")
    .select("*")
    .eq("clerk_user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as OrganizationMembership | null;
}

export async function getOrganizationForUser(
  supabase: SupabaseClient,
  user: User,
) {
  const membership = await getMembershipForUser(supabase, user);
  if (!membership) {
    return null;
  }

  const { data: organization, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", membership.organization_id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return organization;
}

export function canManageOrganization(role: OrganizationRole | null | undefined) {
  return role === "owner" || role === "manager";
}

export function canOwnOrganization(role: OrganizationRole | null | undefined) {
  return role === "owner";
}
