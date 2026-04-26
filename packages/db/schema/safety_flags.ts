import {
    pgTable,
    uuid,
    text,
    real,
    timestamp,
    pgEnum,
    index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { messages } from "./messages";

export const flagTypeEnum = pgEnum("flag_type", [
    "abuse",
    "bullying",
    "harassment",
    "hate_speech",
    "spam",
    "self_harm",
    "other",
]);

export const flagStatusEnum = pgEnum("flag_status", [
    "pending",
    "reviewed_safe",
    "reviewed_removed",
    "auto_blocked",
]);

export const safetyFlags = pgTable(
    "safety_flags",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        messageId: uuid("message_id")
            .notNull()
            .references(() => messages.id, { onDelete: "cascade" }),
        // null = flagged by AI system, not a user report
        flaggedBy: uuid("flagged_by").references(() => users.id, {
            onDelete: "set null",
        }),
        flagType: flagTypeEnum("flag_type").notNull(),
        // 0.0 – 1.0 confidence score from DeepSeek R1
        confidenceScore: real("confidence_score").notNull(),
        // AI chain-of-thought reasoning
        reasoning: text("reasoning"),
        // The exact span of text that triggered the flag
        offendingSpan: text("offending_span"),
        status: flagStatusEnum("status").notNull().default("pending"),
        // Admin who reviewed it
        reviewedBy: uuid("reviewed_by").references(() => users.id, {
            onDelete: "set null",
        }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    },
    (table) => ({
        messageIdIdx: index("safety_flags_message_id_idx").on(table.messageId),
        statusIdx: index("safety_flags_status_idx").on(table.status),
        flagTypeIdx: index("safety_flags_flag_type_idx").on(table.flagType),
        // Composite for admin dashboard queries: pending flags ordered by time
        statusCreatedIdx: index("safety_flags_status_created_idx").on(
            table.status,
            table.createdAt
        ),
    })
);

export type SafetyFlag = typeof safetyFlags.$inferSelect;
export type NewSafetyFlag = typeof safetyFlags.$inferInsert;