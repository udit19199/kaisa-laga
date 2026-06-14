#!/usr/bin/env bun
/**
 * Transactional backend smoke test for provisioning and submission RPCs.
 * All created rows are rolled back at the end.
 */
import postgres from "postgres";
import { getAdminDatabaseUrl } from "../src/db/credentials";

const connectionString = getAdminDatabaseUrl(process.env);
const hostname = new URL(connectionString).hostname;
const shouldRequireSsl =
  hostname !== "localhost" &&
  hostname !== "127.0.0.1" &&
  hostname !== "::1";

const sql = postgres(connectionString, {
  ssl: shouldRequireSsl ? "require" : undefined,
  prepare: false,
  max: 1,
});

try {
  await sql.begin(async (tx) => {
    const provisionRows = await tx`
      select *
      from public.provision_organization(
        ${"Smoke Test Org"},
        ${"user_smoke_test"},
        ${"smoke@example.com"},
        ${"en"}
      )
    `;
    const provision = provisionRows[0];

    const locationRows = await tx`
      insert into public.locations (
        org_id,
        organization_id,
        name,
        public_capture_token,
        is_active
      )
      values (
        ${provision.organization_id},
        ${provision.organization_id},
        ${"Smoke Location"},
        gen_random_uuid()::text,
        true
      )
      returning id, public_capture_token
    `;
    const location = locationRows[0];

    const acceptRows = await tx`
      select *
      from public.accept_public_submission(
        ${location.public_capture_token},
        gen_random_uuid(),
        ${"smoke-idempotency-key"},
        ${"smoke/path.webm"},
        ${"audio/webm"},
        ${false}
      )
    `;
    const accepted = acceptRows[0];

    const retryRows = await tx`
      select *
      from public.retry_submission_dispatch(${accepted.submission_id})
    `;
    const retried = retryRows[0];

    console.log(
      JSON.stringify(
        {
          provisioned: Boolean(provision?.organization_id),
          locationCreated: Boolean(location?.id),
          acceptedStatus: accepted?.status ?? null,
          dispatchStatus: accepted?.dispatch_status ?? null,
          retryStatus: retried?.status ?? null,
        },
        null,
        2,
      ),
    );

    throw new Error("ROLLBACK_SMOKE_TEST");
  });
} catch (error) {
  if (!(error instanceof Error) || error.message !== "ROLLBACK_SMOKE_TEST") {
    throw error;
  }
} finally {
  await sql.end();
}
