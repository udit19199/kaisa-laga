import { auth, currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Organization } from "@/lib/types";
import type { OrganizationMembership } from "@/lib/org-access";
import { canManageOrganization, canOwnOrganization } from "@/lib/org-access";

export async function getClerkUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId ?? null;
}

export async function getOrganizationForClerkUser(
  clerkUserId: string,
): Promise<Organization | null> {
  const ctx = await resolveOrgContext(clerkUserId);

  return ctx?.organization ?? null;
}

type ResolvedOrgContext = {
  clerkUserId: string;
  membership: OrganizationMembership;
  organization: Organization;
};

async function resolveOrgContext(
  clerkUserId: string,
): Promise<ResolvedOrgContext | null> {
  const admin = createAdminClient();
  const { data: membership, error: membershipError } = await admin
    .from("organization_memberships")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  if (membershipError) {
    throw membershipError;
  }

  if (!membership) {
    return null;
  }

  const { data: organization, error: organizationError } = await admin
    .from("organizations")
    .select("*")
    .eq("id", membership.organization_id)
    .maybeSingle();

  if (organizationError) {
    throw organizationError;
  }

  if (!organization) {
    return null;
  }

  return {
    clerkUserId,
    membership: membership as OrganizationMembership,
    organization,
  };
}

export async function requireOrgContext(): Promise<
  | {
      ok: true;
      clerkUserId: string;
      membership: OrganizationMembership;
      organization: Organization;
      permissions: {
        canManageOrganization: boolean;
        canOwnOrganization: boolean;
      };
      admin: ReturnType<typeof createAdminClient>;
    }
  | { ok: false; status: number; error: string }
> {
  const clerkUserId = await getClerkUserId();
  if (!clerkUserId) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  try {
    const context = await resolveOrgContext(clerkUserId);
    if (!context) {
      return { ok: false, status: 404, error: "Organization not found" };
    }

    return {
      ok: true,
      clerkUserId: context.clerkUserId,
      membership: context.membership,
      organization: context.organization,
      permissions: {
        canManageOrganization: canManageOrganization(context.membership.role),
        canOwnOrganization: canOwnOrganization(context.membership.role),
      },
      admin: createAdminClient(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load organization";
    return { ok: false, status: 500, error: message };
  }
}

export async function getPrimaryEmailForClerkUser(): Promise<string | null> {
  const user = await currentUser();
  if (!user) {
    return null;
  }

  return user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
    ?.emailAddress ?? null;
}
