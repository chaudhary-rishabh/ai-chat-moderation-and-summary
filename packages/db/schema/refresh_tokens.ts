import {
    pgTable,
    uuid,
    text,
    timestamp,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const refreshTokens = pgTable(
    "refresh_tokens",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        tokenHash: text("token_hash").notNull().unique(),
        jti: uuid("jti").notNull(),
        expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
        revokedAt: timestamp("revoked_at", { withTimezone: true }),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        userIdIdx: index("refresh_tokens_user_id_idx").on(table.userId),
        expiresAtIdx: index("refresh_tokens_expires_at_idx").on(table.expiresAt),
        tokenHashIdx: uniqueIndex("refresh_tokens_token_hash_idx").on(table.tokenHash),
    })
);


export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;