import "server-only";

import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { diners, organizationMemberships } from "@/db/schema";
import type { DinerOnboarding } from "@/lib/taste/types";
import { EMPTY_DINER_ONBOARDING } from "@/lib/taste/types";

export type DinerContext = {
  id: string;
  clerkUserId: string;
  displayName: string | null;
  onboarding: DinerOnboarding;
  linkedReviewCount: number;
  onboardingCompletedAt: string | null;
};

function parseOnboarding(raw: unknown): DinerOnboarding {
  if (!raw || typeof raw !== "object") {
    return { ...EMPTY_DINER_ONBOARDING };
  }

  const value = raw as Partial<DinerOnboarding>;
  return {
    dietary: value.dietary ?? null,
    allergies: Array.isArray(value.allergies) ? value.allergies : [],
    spiceLevel: value.spiceLevel ?? null,
    budgetBand: value.budgetBand ?? null,
    otherAllergies: value.otherAllergies ?? null,
  };
}

export function serializeDiner(row: typeof diners.$inferSelect): DinerContext {
  return {
    id: row.id,
    clerkUserId: row.clerkUserId,
    displayName: row.displayName,
    onboarding: parseOnboarding(row.onboarding),
    linkedReviewCount: row.linkedReviewCount,
    onboardingCompletedAt: row.onboardingCompletedAt,
  };
}

const getOrCreateDiner = cache(async function getOrCreateDiner(
  clerkUserId: string,
): Promise<DinerContext> {
  const [existing] = await db
    .select()
    .from(diners)
    .where(eq(diners.clerkUserId, clerkUserId))
    .limit(1);

  if (existing) {
    return serializeDiner(existing);
  }

  const user = await currentUser();
  const displayName =
    user?.firstName ??
    user?.emailAddresses.find((entry) => entry.id === user.primaryEmailAddressId)
      ?.emailAddress?.split("@")[0] ??
    null;

  const [created] = await db
    .insert(diners)
    .values({
      clerkUserId,
      displayName,
      onboarding: EMPTY_DINER_ONBOARDING,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create diner profile");
  }

  return serializeDiner(created);
});

export async function requireDinerContext(): Promise<
  { ok: true; diner: DinerContext } | { ok: false; error: string; status: number }
> {
  const user = await currentUser();
  if (!user) {
    return { ok: false, error: "Unauthorized", status: 401 };
  }

  const diner = await getOrCreateDiner(user.id);
  return { ok: true, diner };
}

export async function userHasOrgMembership(clerkUserId: string): Promise<boolean> {
  const [membership] = await db
    .select({ id: organizationMemberships.id })
    .from(organizationMemberships)
    .where(eq(organizationMemberships.clerkUserId, clerkUserId))
    .limit(1);

  return Boolean(membership);
}
