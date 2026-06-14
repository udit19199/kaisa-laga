import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { provisionOrganization } from "@/db/rpc";
import {
  organizationMemberships,
  organizationSubscriptionPeriods,
  organizations,
} from "@/db/schema";
import {
  serializeMembership,
  serializeOrganization,
} from "@/server/serialize";

export async function getMembershipByClerkUserId(clerkUserId: string) {
  const [row] = await db
    .select()
    .from(organizationMemberships)
    .where(eq(organizationMemberships.clerkUserId, clerkUserId))
    .limit(1);

  return row ? serializeMembership(row) : null;
}

export async function updateOrganization(
  organizationId: string,
  updates: {
    name?: string;
    primaryLanguage?: string;
    alertEmail?: string | null;
  },
) {
  const [row] = await db
    .update(organizations)
    .set({
      ...(updates.name !== undefined ? { name: updates.name } : {}),
      ...(updates.primaryLanguage !== undefined
        ? { primaryLanguage: updates.primaryLanguage }
        : {}),
      ...(updates.alertEmail !== undefined
        ? {
            alertEmail: updates.alertEmail,
            defaultAlertEmail: updates.alertEmail,
          }
        : {}),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(organizations.id, organizationId))
    .returning();

  return row ? serializeOrganization(row) : null;
}

export async function provisionOrganizationForClerkUser(params: {
  name: string;
  clerkUserId: string;
  clerkUserEmail: string | null;
}) {
  const existingMembership = await getMembershipByClerkUserId(params.clerkUserId);
  if (existingMembership) {
    return { error: "User already belongs to an organization" as const };
  }

  const result = await provisionOrganization(params);
  if (!result) {
    throw new Error("Failed to provision organization");
  }

  const [organizationRow, membershipRow, subscriptionPeriodRow] =
    await Promise.all([
      db
        .select()
        .from(organizations)
        .where(eq(organizations.id, result.organization_id))
        .then((rows) => rows[0] ?? null),
      db
        .select()
        .from(organizationMemberships)
        .where(eq(organizationMemberships.id, result.membership_id))
        .then((rows) => rows[0] ?? null),
      db
        .select()
        .from(organizationSubscriptionPeriods)
        .where(eq(organizationSubscriptionPeriods.id, result.subscription_period_id))
        .then((rows) => rows[0] ?? null),
    ]);

  if (!organizationRow || !membershipRow) {
    throw new Error("Failed to load provisioned organization");
  }

  return {
    organization: serializeOrganization(organizationRow),
    membership: serializeMembership(membershipRow),
    subscriptionPeriod: subscriptionPeriodRow,
  };
}
