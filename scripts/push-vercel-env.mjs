#!/usr/bin/env bun
/**
 * Push Clerk env vars from .env.local to Vercel (non-interactive).
 * Usage: bun scripts/push-vercel-env.mjs
 */
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");
const raw = readFileSync(envPath, "utf8");
const env = Object.fromEntries(
  raw
    .split("\n")
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1)];
    }),
);

const KEYS = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
  "NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL",
];

const TARGET_ENVS = ["production", "preview", "development"];

function vercelEnvAdd(name, value, target) {
  const result = spawnSync(
    "vercel",
    ["env", "add", name, target, "--force"],
    {
      cwd: root,
      input: value,
      encoding: "utf8",
    },
  );
  if (result.status !== 0) {
    const retry = spawnSync("vercel", ["env", "add", name, target], {
      cwd: root,
      input: value,
      encoding: "utf8",
    });
    if (retry.status !== 0) {
      console.error(`Failed ${name}@${target}:`, retry.stderr || result.stderr);
      return false;
    }
  }
  return true;
}

for (const key of KEYS) {
  const value = env[key];
  if (!value) {
    console.warn(`Skip ${key} (missing in .env.local)`);
    continue;
  }
  for (const target of TARGET_ENVS) {
    if (vercelEnvAdd(key, value, target)) {
      console.log(`✓ ${key} → ${target}`);
    }
  }
}

console.log("Done. Verify with: vercel env ls");
