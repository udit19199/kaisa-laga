#!/usr/bin/env bun
/**
 * Sync canonical production URLs to Vercel (app origin + Clerk auth redirects).
 * Usage: bun scripts/sync-vercel-production-urls.mjs
 */
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TARGET_ENVS = ["production", "preview", "development"];

const VARS = {
  NEXT_PUBLIC_APP_URL: "https://kaisa-laga.vercel.app",
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/sign-in",
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/sign-up",
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: "/dashboard",
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: "/dashboard/onboarding",
};

function vercelEnvAdd(name, value, target) {
  const args = ["env", "add", name, target, "--value", value, "--yes", "--force"];
  const result = spawnSync("vercel", args, {
    cwd: root,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    console.error(`Failed ${name}@${target}:`, result.stderr || result.stdout);
    return false;
  }

  return true;
}

for (const [name, value] of Object.entries(VARS)) {
  for (const target of TARGET_ENVS) {
    if (vercelEnvAdd(name, value, target)) {
      console.log(`✓ ${name}=${value} → ${target}`);
    }
  }
}

console.log("\nDone. Redeploy production for NEXT_PUBLIC_* changes to take effect:");
console.log("  vercel --prod");
