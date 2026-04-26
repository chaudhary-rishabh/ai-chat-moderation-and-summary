import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const max = Number(process.env.DB_POOL_MAX ?? 10);

export const queryClient = postgres(databaseUrl, {
  max,
  prepare: false,
});

export const db = drizzle(queryClient, { schema });
