import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import {
  organizationMemberships,
  organizations,
} from "@/db/schema";
import {
  canManageOrganization,
  canOwnOrganization,
  type OrganizationRole,
} from "@/server/auth/permissions";
import { serializeMembership, serializeOrganization } from "@/server/serialize";

export type OrgContext = {
  clerkUserId: string;
  membership: ReturnType<typeof serializeMembership>;
  organization: ReturnType<typeof serializeOrganization>;
  permissions: {
    canManageOrganization: boolean;
    canOwnOrganization: boolean;
  };
};

export async function getClerkUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId ?? null;
}

export async function getPrimaryEmailForClerkUser(): Promise<string | null> {
  const user = await currentUser();
  if (!user) {
    return null;
  }

  return (
    user.emailAddresses.find((entry) => entry.id === user.primaryEmailAddressId)
      ?.emailAddress ?? null
  );
}

const resolveOrgContext = cache(async function resolveOrgContext(
  clerkUserId: string,
): Promise<OrgContext | null> {
  const [membershipRow] = await db
    .select()
    .from(organizationMemberships)
    .where(eq(organizationMemberships.clerkUserId, clerkUserId))
    .limit(1);

  if (membershipRow) {
    const [organizationRow] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, membershipRow.organizationId))
      .limit(1);

    if (!organizationRow) {
      return null;
    }

    const membership = serializeMembership(membershipRow);
    return buildOrgContext(clerkUserId, membership, organizationRow);
  }

  const [organizationRow] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.clerkUserId, clerkUserId))
    .limit(1);

  if (!organizationRow) {
    return null;
  }

  const [repairedMembershipRow] = await db
    .insert(organizationMemberships)
    .values({
      organizationId: organizationRow.id,
      clerkUserId,
      role: "owner",
    })
    .onConflictDoUpdate({
      target: organizationMemberships.clerkUserId,
      set: {
        organizationId: organizationRow.id,
        role: "owner",
        updatedAt: new Date().toISOString(),
      },
    })
    .returning();

  if (!repairedMembershipRow) {
    return null;
  }

  return buildOrgContext(
    clerkUserId,
    serializeMembership(repairedMembershipRow),
    organizationRow,
  );
});

function buildOrgContext(
  clerkUserId: string,
  membership: ReturnType<typeof serializeMembership>,
  organizationRow: typeof organizations.$inferSelect,
): OrgContext {
  const role = membership.role as OrganizationRole;

  return {
    clerkUserId,
    membership,
    organization: serializeOrganization(organizationRow),
    permissions: {
      canManageOrganization: canManageOrganization(role),
      canOwnOrganization: canOwnOrganization(role),
    },
  };
}

export async function requireOrgContext(): Promise<
  | { ok: true; ctx: OrgContext }
  | { ok: false; status: number; error: string }
> {
  const clerkUserId = await getClerkUserId();
  if (!clerkUserId) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  try {
    const ctx = await resolveOrgContext(clerkUserId);
    if (!ctx) {
      return { ok: false, status: 404, error: "Organization not found" };
    }

    return { ok: true, ctx };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load organization";
    return { ok: false, status: 500, error: message };
  }
}

export async function getOrganizationForClerkUser(clerkUserId: string) {
  const ctx = await resolveOrgContext(clerkUserId);
  return ctx?.organization ?? null;
}
