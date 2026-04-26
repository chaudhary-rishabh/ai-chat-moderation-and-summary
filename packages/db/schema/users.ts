import {
    pgTable,
    uuid,
    text,
    boolean,
    timestamp,
    pgEnum,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
    "user",
    "moderator",
    "admin",
    "superadmin",
]);

export const users = pgTable(
    "users",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        email: text("email").notNull().unique(),
        name: text("name").notNull(),
        avatarUrl: text("avatar_url"),
        passwordHash: text("password_hash").notNull(),
        role: userRoleEnum("role").notNull().default("user"),
        isActive: boolean("is_active").notNull().default(true),
        isVerified: boolean("is_verified").notNull().default(false),
        lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
        passwordResetToken: text("password_reset_token"),
        passwordResetExpires: timestamp("password_reset_expires", {
            withTimezone: true,
        }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        emailIdx: uniqueIndex("users_email_idx").on(table.email),
        roleIdx: index("users_role_idx").on(table.role),
        lastSeenIdx: index("users_last_seen_idx").on(table.lastSeenAt),
    })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;