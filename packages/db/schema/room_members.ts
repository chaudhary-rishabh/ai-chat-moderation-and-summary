import {
    pgTable,
    uuid,
    boolean,
    timestamp,
    pgEnum,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { rooms } from "./rooms";

export const roomMemberRoleEnum = pgEnum("room_member_role", [
    "member",
    "moderator",
    "admin",
]);

export const roomMembers = pgTable(
    "room_members",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        roomId: uuid("room_id")
            .notNull()
            .references(() => rooms.id, { onDelete: "cascade" }),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        role: roomMemberRoleEnum("role").notNull().default("member"),
        joinedAt: timestamp("joined_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        lastReadAt: timestamp("last_read_at", { withTimezone: true }),
        isMuted: boolean("is_muted").notNull().default(false),
    },
    (table) => ({
        // Enforce one membership record per user per room
        roomUserUnique: uniqueIndex("room_members_room_user_unique").on(
            table.roomId,
            table.userId
        ),
        roomIdIdx: index("room_members_room_id_idx").on(table.roomId),
        userIdIdx: index("room_members_user_id_idx").on(table.userId),
    })
);

export type RoomMember = typeof roomMembers.$inferSelect;
export type NewRoomMember = typeof roomMembers.$inferInsert;