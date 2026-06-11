import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getOrganizationForOwner(
  supabase: SupabaseClient,
  user: User,
) {
  const { data: org, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return org;
}
