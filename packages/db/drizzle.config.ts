/**
 * drizzle.config.ts
 *
 * Drizzle Kit configuration for schema introspection and migrations.
 * Place this at: apps/server/drizzle.config.ts
 *
 * Commands:
 *   pnpm drizzle-kit generate   — generate SQL migration from schema changes
 *   pnpm drizzle-kit migrate    — apply pending migrations to the DB
 *   pnpm drizzle-kit studio     — open Drizzle Studio (local DB GUI)
 *   pnpm drizzle-kit push       — push schema directly (dev only, no migration file)
 */

import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for drizzle-kit");
}

export default defineConfig({
    // Point to the shared packages/db schema
    schema: "../../packages/db/schema/index.ts",

    // Output generated SQL migration files here
    out: "./drizzle/migrations",

    dialect: "postgresql",

    dbCredentials: {
        url: process.env.DATABASE_URL,
    },

    // Verbose logging during generation
    verbose: true,

    // Strict mode: fails if a breaking change (e.g. column drop) is detected
    // without an explicit --force flag — protects production data
    strict: true,
});