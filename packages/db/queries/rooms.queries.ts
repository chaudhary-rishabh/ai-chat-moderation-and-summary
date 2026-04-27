import { db, rooms, roomMembers } from "../src";
import { and, eq } from "drizzle-orm";
import type { NewRoom } from "../schema";

export const createRoom = (data: NewRoom) =>
  db.insert(rooms).values(data).returning();

export const getRoomsForUser = (userId: string) =>
  db.query.roomMembers.findMany({
    where: eq(roomMembers.userId, userId),
    with: {
      room: {
        with: {
          members: { with: { user: { columns: { id: true, name: true, avatarUrl: true, lastSeenAt: true } } } },
        },
      },
    },
  });

export const getRoomById = (id: string) =>
  db.query.rooms.findFirst({ where: eq(rooms.id, id) });

export const getRoomWithMembers = (id: string) =>
  db.query.rooms.findFirst({
    where: eq(rooms.id, id),
    with: {
      members: { with: { user: { columns: { id: true, name: true, email: true, avatarUrl: true, role: true, lastSeenAt: true } } } },
    },
  });

export const addMember = (roomId: string, userId: string, role: "member" | "moderator" | "admin" = "member") =>
  db.insert(roomMembers).values({ roomId, userId, role }).returning();

export const removeMember = (roomId: string, userId: string) =>
  db.delete(roomMembers).where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId))).returning();

export const getMembership = (roomId: string, userId: string) =>
  db.query.roomMembers.findFirst({
    where: and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId)),
  });

export const updateRoomLastActivity = (id: string) =>
  db.update(rooms).set({ updatedAt: new Date() }).where(eq(rooms.id, id));

export const archiveRoom = (id: string) =>
  db.update(rooms).set({ isArchived: true, updatedAt: new Date() }).where(eq(rooms.id, id));
