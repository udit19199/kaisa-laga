function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}

function getSupabaseProjectRef(supabaseUrl: string): string {
  const hostname = new URL(supabaseUrl).hostname;
  const projectRef = hostname.split(".")[0];

  return requireEnv(projectRef, "NEXT_PUBLIC_SUPABASE_URL");
}

export function buildSupabaseDatabaseUrl(
  supabaseUrl: string,
  password: string,
): string {
  const projectRef = getSupabaseProjectRef(supabaseUrl);

  return `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`;
}

function getDerivedDirectDatabaseUrl(
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const password = env.SUPABASE_DB_PASSWORD?.trim();

  if (!supabaseUrl || !password) {
    return null;
  }

  return buildSupabaseDatabaseUrl(supabaseUrl, password);
}

function getRuntimeDatabaseUrl(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const runtimeUrl = env.DATABASE_URL?.trim();
  if (runtimeUrl) {
    return runtimeUrl;
  }

  const derivedDirectUrl = getDerivedDirectDatabaseUrl(env);
  if (derivedDirectUrl) {
    return derivedDirectUrl;
  }

  throw new Error(
    "Missing DATABASE_URL. Set DATABASE_URL directly, or set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_DB_PASSWORD to derive a direct Supabase Postgres connection string.",
  );
}

export function getAdminDatabaseUrl(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const directUrl = env.DATABASE_DIRECT_URL?.trim();
  if (directUrl) {
    return directUrl;
  }

  const derivedDirectUrl = getDerivedDirectDatabaseUrl(env);
  if (derivedDirectUrl) {
    return derivedDirectUrl;
  }

  const runtimeUrl = env.DATABASE_URL?.trim();
  if (runtimeUrl) {
    return runtimeUrl;
  }

  throw new Error(
    "Missing DATABASE_DIRECT_URL. Set DATABASE_DIRECT_URL, or set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_DB_PASSWORD to derive a direct Supabase Postgres connection string. DATABASE_URL is only used as a final fallback.",
  );
}

export function getDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  return getRuntimeDatabaseUrl(env);
}
