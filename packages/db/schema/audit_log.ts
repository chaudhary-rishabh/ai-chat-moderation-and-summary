/**
 * packages/db/schema/audit_log.ts
 *
 * Immutable audit trail for all security-relevant events.
 * Written by the audit middleware (fire-and-forget, never blocks responses).
 *
 * Events logged: login, logout, register, token_refresh, failed_login,
 *   password_reset_request, password_reset_complete, password_changed,
 *   message_flagged, user_deactivated, admin_action, role_changed
 *
 * This table is append-only — rows are never updated or deleted.
 * Retention policy (e.g. delete rows older than 90 days) is handled
 * externally via a scheduled database job, not application code.
 */

import {
    pgTable,
    uuid,
    text,
    jsonb,
    timestamp,
    index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const auditLog = pgTable(
    "audit_log",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        // null = system-generated event (e.g. scheduled job, automated action)
        userId: uuid("user_id").references(() => users.id, {
            onDelete: "set null",
        }),

        // Event identifier e.g. "login", "logout", "message_flagged"
        event: text("event").notNull(),

        // Client IP address — may be IPv4 or IPv6
        ipAddress: text("ip_address"),

        userAgent: text("user_agent"),

        // Arbitrary structured data specific to the event type.
        // Example for "message_flagged": { messageId, flagType, confidence }
        // Example for "login": { method: "credentials" }
        // Example for "role_changed": { oldRole, newRole, changedBy }
        metadata: jsonb("metadata"),

        // Always stored with timezone — audit logs must be timezone-aware
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        userIdIdx: index("audit_log_user_id_idx").on(table.userId),
        eventIdx: index("audit_log_event_idx").on(table.event),
        // Most audit queries are time-range filtered
        createdAtIdx: index("audit_log_created_at_idx").on(table.createdAt),
        // Composite: all events for a user in time order
        userCreatedIdx: index("audit_log_user_created_idx").on(
            table.userId,
            table.createdAt
        ),
    })
);

export type AuditLog = typeof auditLog.$inferSelect;
export type NewAuditLog = typeof auditLog.$inferInsert;