import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { getAdminDatabaseUrl } from "./src/db/credentials";

config({ path: ".env.local" });
config();

export default defineConfig({
  out: "./drizzle/migrations",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: getAdminDatabaseUrl(),
  },
  strict: true,
  verbose: true,
});
