import {
    pgTable,
    uuid,
    text,
    boolean,
    timestamp,
    pgEnum,
    index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const roomTypeEnum = pgEnum("room_type", ["dm", "group", "channel"]);

export const rooms = pgTable(
    "rooms",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        type: roomTypeEnum("type").notNull(),
        name: text("name"),
        description: text("description"),
        avatarUrl: text("avatar_url"),
        createdBy: uuid("created_by")
            .notNull()
            .references(() => users.id, { onDelete: "restrict" }),
        isArchived: boolean("is_archived").notNull().default(false),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        typeIdx: index("rooms_type_idx").on(table.type),
        createdByIdx: index("rooms_created_by_idx").on(table.createdBy),
        archivedIdx: index("rooms_is_archived_idx").on(table.isArchived),
    })
);

export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;