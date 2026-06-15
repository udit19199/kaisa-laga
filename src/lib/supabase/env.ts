function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

export function getSupabaseUrl() {
  // Static access required — Next.js only inlines NEXT_PUBLIC_* at build time.
  return requireEnv(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL",
  );
}



/** Server-only secret key (`sb_secret_...`). Never expose to the browser. */
export function getSupabaseSecretKey() {
  return requireEnv(process.env.SUPABASE_SECRET_KEY, "SUPABASE_SECRET_KEY");
}
