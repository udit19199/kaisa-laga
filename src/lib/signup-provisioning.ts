import type { SupabaseClient } from "@supabase/supabase-js";

/** Undo partial signup when org creation or session establishment fails. */
export async function rollbackSignupProvisioning(
  admin: SupabaseClient,
  userId: string,
) {
  await admin.from("organizations").delete().eq("owner_user_id", userId);
  await admin.auth.admin.deleteUser(userId);
}
