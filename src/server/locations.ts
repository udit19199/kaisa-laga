import "server-only";

import { randomUUID } from "crypto";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { locations } from "@/db/schema";
import { serializeLocation } from "@/server/serialize";

export async function listLocationsForOrganization(organizationId: string) {
  const rows = await db
    .select()
    .from(locations)
    .where(eq(locations.organizationId, organizationId))
    .orderBy(asc(locations.name));

  return rows.map(serializeLocation);
}

export async function getActiveLocationById(locationId: string) {
  const [row] = await db
    .select({
      id: locations.id,
      name: locations.name,
      publicCaptureToken: locations.publicCaptureToken,
      isActive: locations.isActive,
    })
    .from(locations)
    .where(and(eq(locations.id, locationId), eq(locations.isActive, true)))
    .limit(1);

  return row ?? null;
}

export async function getActiveLocationByCaptureToken(captureToken: string) {
  const [row] = await db
    .select({
      id: locations.id,
      organizationId: locations.organizationId,
      isActive: locations.isActive,
      publicCaptureToken: locations.publicCaptureToken,
    })
    .from(locations)
    .where(
      and(
        eq(locations.publicCaptureToken, captureToken),
        eq(locations.isActive, true),
      ),
    )
    .limit(1);

  return row ?? null;
}

export async function createLocation(organizationId: string, name: string) {
  const [row] = await db
    .insert(locations)
    .values({
      orgId: organizationId,
      organizationId,
      name,
      isActive: true,
      publicCaptureToken: randomUUID(),
    })
    .returning();

  if (!row) {
    throw new Error("Failed to create location");
  }

  return serializeLocation(row);
}

export async function updateLocation(
  organizationId: string,
  locationId: string,
  updates: {
    name?: string;
    alertEmailOverride?: string | null;
    isActive?: boolean;
  },
) {
  const [row] = await db
    .update(locations)
    .set({
      ...(updates.name !== undefined ? { name: updates.name } : {}),
      ...(updates.alertEmailOverride !== undefined
        ? { alertEmailOverride: updates.alertEmailOverride }
        : {}),
      ...(updates.isActive !== undefined ? { isActive: updates.isActive } : {}),
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(
        eq(locations.id, locationId),
        eq(locations.organizationId, organizationId),
      ),
    )
    .returning();

  return row ? serializeLocation(row) : null;
}

export async function deleteLocation(organizationId: string, locationId: string) {
  const result = await db
    .delete(locations)
    .where(
      and(
        eq(locations.id, locationId),
        eq(locations.organizationId, organizationId),
      ),
    )
    .returning({ id: locations.id });

  return result.length > 0;
}

export async function rotateLocationCaptureToken(
  organizationId: string,
  locationId: string,
) {
  const [row] = await db
    .update(locations)
    .set({
      publicCaptureToken: randomUUID(),
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(
        eq(locations.id, locationId),
        eq(locations.organizationId, organizationId),
      ),
    )
    .returning({ publicCaptureToken: locations.publicCaptureToken });

  return row?.publicCaptureToken ?? null;
}
