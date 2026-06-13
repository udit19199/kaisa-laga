import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDatabaseUrl } from "@/db/credentials";
import * as schema from "@/db/schema";

type KaisaLagaDatabase = PostgresJsDatabase<typeof schema>;
type PostgresClient = ReturnType<typeof postgres>;

const globalForDatabase = globalThis as typeof globalThis & {
  kaisaLagaDrizzleClient?: PostgresClient;
  kaisaLagaDrizzleDb?: KaisaLagaDatabase;
};

function createClient() {
  const databaseUrl = getDatabaseUrl();
  const hostname = new URL(databaseUrl).hostname;
  const shouldRequireSsl =
    hostname !== "localhost" &&
    hostname !== "127.0.0.1" &&
    hostname !== "::1";

  return postgres(databaseUrl, {
    ssl: shouldRequireSsl ? "require" : undefined,
    // Supabase transaction-mode poolers do not support prepared statements.
    prepare: false,
    max: process.env.NODE_ENV === "production" ? 10 : 1,
  });
}

function getClient(): PostgresClient {
  if (process.env.NODE_ENV === "production") {
    return createClient();
  }

  globalForDatabase.kaisaLagaDrizzleClient ??= createClient();
  return globalForDatabase.kaisaLagaDrizzleClient;
}

function createDb(): KaisaLagaDatabase {
  return drizzle(getClient(), { schema });
}

export const db =
  process.env.NODE_ENV === "production"
    ? createDb()
    : (globalForDatabase.kaisaLagaDrizzleDb ??= createDb());

export { schema };
