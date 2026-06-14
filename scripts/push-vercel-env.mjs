#!/usr/bin/env bun
/**
 * Push app env vars from .env.local to Vercel (non-interactive).
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
  "DATABASE_URL",
  "DATABASE_DIRECT_URL",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
  "NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL",
];

const TARGET_ENVS = ["production", "preview", "development"];

function stripQuotes(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function vercelEnvAdd(name, value, target, gitBranch) {
  const args = ["env", "add", name, target];
  if (gitBranch) {
    args.push(gitBranch);
  }
  args.push("--force", "-y", "--value", value);

  const result = spawnSync("vercel", args, {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    console.error(`Failed ${name}@${target}:`, result.stderr?.trim() || result.stdout?.trim());
    return false;
  }
  return true;
}

let skipPreview = false;

for (const key of KEYS) {
  const rawValue = env[key];
  if (!rawValue) {
    console.warn(`Skip ${key} (missing in .env.local)`);
    continue;
  }
  const value = stripQuotes(rawValue);
  for (const target of TARGET_ENVS) {
    if (target === "preview" && skipPreview) {
      continue;
    }

    if (!vercelEnvAdd(key, value, target)) {
      if (target === "preview") {
        skipPreview = true;
        console.warn(
          "⚠ Preview env sync skipped for remaining keys — Vercel requires branch-scoped Preview vars on this project. Add them under Project → Settings → Environment Variables → Preview (all branches).",
        );
      }
      continue;
    }

    console.log(`✓ ${key} → ${target}`);
  }
}

console.log("Done. Verify with: vercel env ls");
