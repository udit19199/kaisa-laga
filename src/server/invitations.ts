import "server-only";

import { randomUUID } from "crypto";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { organizationInvitations, organizationMemberships } from "@/db/schema";
import { serializeInvitation, serializeMembership } from "@/server/serialize";

export async function listInvitationsForOrganization(organizationId: string) {
  const rows = await db
    .select()
    .from(organizationInvitations)
    .where(eq(organizationInvitations.organizationId, organizationId))
    .orderBy(desc(organizationInvitations.createdAt));

  return rows.map(serializeInvitation);
}

export async function createInvitation(params: {
  organizationId: string;
  invitedEmail: string;
  role: "owner" | "manager" | "viewer";
  invitedByClerkUserId: string;
}) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const [row] = await db
    .insert(organizationInvitations)
    .values({
      id: randomUUID(),
      organizationId: params.organizationId,
      invitedEmail: params.invitedEmail,
      role: params.role,
      token: randomUUID().replace(/-/g, ""),
      status: "pending",
      expiresAt: expiresAt.toISOString(),
      invitedByClerkUserId: params.invitedByClerkUserId,
    })
    .returning();

  if (!row) {
    throw new Error("Failed to create invitation");
  }

  return serializeInvitation(row);
}

export async function getPendingInvitationByToken(token: string) {
  const [row] = await db
    .select()
    .from(organizationInvitations)
    .where(
      and(
        eq(organizationInvitations.token, token),
        eq(organizationInvitations.status, "pending"),
      ),
    )
    .limit(1);

  return row ? serializeInvitation(row) : null;
}

export async function expireInvitation(invitationId: string) {
  await db
    .update(organizationInvitations)
    .set({ status: "expired", updatedAt: new Date().toISOString() })
    .where(eq(organizationInvitations.id, invitationId));
}

export async function acceptInvitation(invitationId: string) {
  const [row] = await db
    .update(organizationInvitations)
    .set({ status: "accepted", updatedAt: new Date().toISOString() })
    .where(eq(organizationInvitations.id, invitationId))
    .returning();

  return row ? serializeInvitation(row) : null;
}

export async function revokeInvitation(organizationId: string, invitationId: string) {
  const [row] = await db
    .update(organizationInvitations)
    .set({ status: "revoked", updatedAt: new Date().toISOString() })
    .where(
      and(
        eq(organizationInvitations.id, invitationId),
        eq(organizationInvitations.organizationId, organizationId),
      ),
    )
    .returning();

  return row ? serializeInvitation(row) : null;
}

export async function resendInvitation(organizationId: string, invitationId: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const [row] = await db
    .update(organizationInvitations)
    .set({
      token: randomUUID().replace(/-/g, ""),
      expiresAt: expiresAt.toISOString(),
      status: "pending",
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(
        eq(organizationInvitations.id, invitationId),
        eq(organizationInvitations.organizationId, organizationId),
      ),
    )
    .returning();

  return row ? serializeInvitation(row) : null;
}

export async function createMembership(params: {
  organizationId: string;
  clerkUserId: string;
  role: "owner" | "manager" | "viewer";
}) {
  const [row] = await db
    .insert(organizationMemberships)
    .values({
      organizationId: params.organizationId,
      clerkUserId: params.clerkUserId,
      role: params.role,
    })
    .returning();

  return row ? serializeMembership(row) : null;
}

export async function listMembershipsForOrganization(organizationId: string) {
  const rows = await db
    .select()
    .from(organizationMemberships)
    .where(eq(organizationMemberships.organizationId, organizationId))
    .orderBy(asc(organizationMemberships.createdAt));

  return rows.map(serializeMembership);
}
