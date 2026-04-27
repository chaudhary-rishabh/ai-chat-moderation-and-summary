import { ForbiddenError, NotFoundError, ConflictError } from "../lib/errors";
import {
  createRoom,
  getRoomsForUser,
  getRoomById,
  getRoomWithMembers,
  addMember,
  removeMember,
  getMembership,
  archiveRoom,
} from "db/queries";
import { getUnreadCount } from "db/queries";

export const createRoomService = async (creatorId: string, data: { type: "dm" | "group" | "channel"; name?: string; description?: string; memberIds?: string[] }) => {
  // For DM, check if a DM already exists between these two users
  if (data.type === "dm" && data.memberIds?.length === 1) {
    const existingRooms = await getRoomsForUser(creatorId);
    const existingDM = existingRooms.find(
      (m) =>
        m.room.type === "dm" &&
        m.room.members.some((mb) => mb.userId === data.memberIds![0])
    );
    if (existingDM) return { room: existingDM.room, isExisting: true };
  }

  const [room] = await createRoom({
    type: data.type,
    name: data.name ?? null,
    description: data.description ?? null,
    createdBy: creatorId,
  });

  if (!room) throw new Error("Failed to create room");

  // Add creator as admin
  await addMember(room.id, creatorId, "admin");

  // Add other members
  if (data.memberIds) {
    for (const memberId of data.memberIds) {
      if (memberId !== creatorId) {
        await addMember(room.id, memberId, "member");
      }
    }
  }

  const fullRoom = await getRoomWithMembers(room.id);
  return { room: fullRoom, isExisting: false };
};

export const getRoomsForUserService = async (userId: string) => {
  const memberships = await getRoomsForUser(userId);
  const rooms = await Promise.all(
    memberships.map(async (m) => {
      const [unread] = await getUnreadCount(m.room.id, userId);
      return {
        ...m.room,
        unreadCount: unread?.count ?? 0,
      };
    })
  );
  return rooms;
};

export const getRoomService = async (roomId: string, userId: string) => {
  const membership = await getMembership(roomId, userId);
  if (!membership) throw new ForbiddenError("Not a member of this room", "NOT_MEMBER");

  const room = await getRoomWithMembers(roomId);
  if (!room) throw new NotFoundError("Room not found", "ROOM_NOT_FOUND");
  return room;
};

export const addMemberService = async (roomId: string, requesterId: string, targetUserId: string) => {
  const requesterMembership = await getMembership(roomId, requesterId);
  if (!requesterMembership || requesterMembership.role !== "admin") {
    throw new ForbiddenError("Only admins can add members", "NOT_ADMIN");
  }

  const existing = await getMembership(roomId, targetUserId);
  if (existing) throw new ConflictError("User is already a member", "ALREADY_MEMBER");

  const [member] = await addMember(roomId, targetUserId, "member");
  return member;
};

export const removeMemberService = async (roomId: string, requesterId: string, targetUserId: string) => {
  const requesterMembership = await getMembership(roomId, requesterId);
  if (!requesterMembership) throw new ForbiddenError("Not a member of this room", "NOT_MEMBER");

  // Admins can remove anyone; members can only remove themselves (leave)
  if (requesterMembership.role !== "admin" && requesterId !== targetUserId) {
    throw new ForbiddenError("Only admins can remove other members", "NOT_ADMIN");
  }

  // Check target is a member
  const targetMembership = await getMembership(roomId, targetUserId);
  if (!targetMembership) throw new NotFoundError("User is not a member", "NOT_MEMBER");

  // Can't remove the last admin
  if (targetMembership.role === "admin") {
    const room = await getRoomWithMembers(roomId);
    const adminCount = room?.members.filter((m) => m.role === "admin").length ?? 0;
    if (adminCount <= 1) throw new ForbiddenError("Cannot remove the last admin", "LAST_ADMIN");
  }

  return removeMember(roomId, targetUserId);
};

export const validateMembership = async (roomId: string, userId: string) => {
  const membership = await getMembership(roomId, userId);
  if (!membership) throw new ForbiddenError("Not a member of this room", "NOT_MEMBER");
  return membership;
};
