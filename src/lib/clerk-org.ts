import { auth, currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Organization } from "@/lib/types";

export async function getClerkUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId ?? null;
}

export async function getOrganizationForClerkUser(
  clerkUserId: string,
): Promise<Organization | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("organizations")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function requireOrgContext(): Promise<
  | {
      ok: true;
      clerkUserId: string;
      organization: Organization;
      admin: ReturnType<typeof createAdminClient>;
    }
  | { ok: false; status: number; error: string }
> {
  const clerkUserId = await getClerkUserId();
  if (!clerkUserId) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  try {
    const organization = await getOrganizationForClerkUser(clerkUserId);
    if (!organization) {
      return { ok: false, status: 404, error: "Organization not found" };
    }

    return {
      ok: true,
      clerkUserId,
      organization,
      admin: createAdminClient(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load organization";
    return { ok: false, status: 500, error: message };
  }
}

export async function getPrimaryEmailForClerkUser(): Promise<string | null> {
  const user = await currentUser();
  return (
    user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? null
  );
}
