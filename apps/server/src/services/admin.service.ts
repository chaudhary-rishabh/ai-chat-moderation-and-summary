import { db, users, rooms, messages, safetyFlags, stories, auditLog, roomMembers } from "db/src";
import { sql, eq, and, or, ilike, desc, asc, count, gte, lte, inArray } from "drizzle-orm";
import { AppError } from "../lib/errors";
import { logger } from "../lib/logger";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

interface UserFilters extends PaginationParams {
  role?: string;
  status?: string;
}

interface RoomFilters extends PaginationParams {
  type?: string;
  archived?: string;
}

interface SafetyFlagFilters extends PaginationParams {
  status?: string;
  flagType?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface AuditLogFilters extends PaginationParams {
  event?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

function paginate({ page = 1, limit = 20 }: PaginationParams) {
  const take = Math.min(Math.max(limit, 1), 100);
  const skip = (Math.max(page, 1) - 1) * take;
  return { take, skip };
}

// ─── Users ──────────────────────────────────────────────────────────────────────

export const adminService = {
  async getUsers(filters: UserFilters) {
    const { take, skip } = paginate(filters);
    const conditions: ReturnType<typeof eq>[] = [];

    if (filters.role) conditions.push(eq(users.role, filters.role as any));
    if (filters.status === "active") conditions.push(eq(users.isActive, true));
    if (filters.status === "deactivated") conditions.push(eq(users.isActive, false));
    if (filters.search) {
      conditions.push(
        or(ilike(users.name, `%${filters.search}%`), ilike(users.email, `%${filters.search}%`))!,
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, total] = await Promise.all([
      db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          isActive: users.isActive,
          isVerified: users.isVerified,
          lastSeenAt: users.lastSeenAt,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(where)
        .orderBy(desc(users.createdAt))
        .limit(take)
        .offset(skip),
      db
        .select({ count: count() })
        .from(users)
        .where(where)
        .then((r) => Number(r[0]?.count ?? 0)),
    ]);

    return { rows, total, page: filters.page ?? 1, limit: take };
  },

  async getUserDetail(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        passwordHash: false,
        passwordResetToken: false,
        passwordResetExpires: false,
      },
    });
    if (!user) throw new AppError(404, "User not found", "NOT_FOUND");

    const [userRooms, flags, logs] = await Promise.all([
      db
        .select({
          id: rooms.id,
          name: rooms.name,
          type: rooms.type,
          isArchived: rooms.isArchived,
          createdAt: rooms.createdAt,
        })
        .from(roomMembers)
        .innerJoin(rooms, eq(roomMembers.roomId, rooms.id))
        .where(eq(roomMembers.userId, userId))
        .limit(20),
      db
        .select({
          id: safetyFlags.id,
          flagType: safetyFlags.flagType,
          status: safetyFlags.status,
          confidenceScore: safetyFlags.confidenceScore,
          createdAt: safetyFlags.createdAt,
        })
        .from(safetyFlags)
        .where(eq(safetyFlags.flaggedBy, userId))
        .orderBy(desc(safetyFlags.createdAt))
        .limit(20),
      db
        .select({
          id: auditLog.id,
          event: auditLog.event,
          ipAddress: auditLog.ipAddress,
          createdAt: auditLog.createdAt,
        })
        .from(auditLog)
        .where(eq(auditLog.userId, userId))
        .orderBy(desc(auditLog.createdAt))
        .limit(20),
    ]);

    return { user, rooms: userRooms, safetyFlags: flags, auditLogs: logs };
  },

  async deactivateUser(userId: string) {
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user) throw new AppError(404, "User not found", "NOT_FOUND");

    await db.update(users).set({ isActive: false, updatedAt: new Date() }).where(eq(users.id, userId));
    logger.info({ userId }, "user_deactivated_by_admin");
    return { success: true };
  },

  async changeUserRole(userId: string, role: string) {
    const validRoles = ["user", "moderator", "admin", "superadmin"];
    if (!validRoles.includes(role)) throw new AppError(400, "Invalid role", "VALIDATION_ERROR");

    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user) throw new AppError(404, "User not found", "NOT_FOUND");

    await db.update(users).set({ role: role as any, updatedAt: new Date() }).where(eq(users.id, userId));
    logger.info({ userId, newRole: role }, "user_role_changed_by_admin");
    return { success: true };
  },

  async resetUserPassword(userId: string) {
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user) throw new AppError(404, "User not found", "NOT_FOUND");

    // Generate a temporary reset token valid for 1 hour
    const crypto = await import("crypto");
    const token = crypto.randomBytes(32).toString("hex");
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    const expires = new Date(Date.now() + 3600_000);

    await db
      .update(users)
      .set({ passwordResetToken: hash, passwordResetExpires: expires })
      .where(eq(users.id, userId));

    logger.info({ userId }, "admin_initiated_password_reset");
    return { resetToken: token, expiresIn: 3600 };
  },

  // ─── Rooms ──────────────────────────────────────────────────────────────────

  async getRooms(filters: RoomFilters) {
    const { take, skip } = paginate(filters);
    const conditions: ReturnType<typeof eq>[] = [];

    if (filters.type) conditions.push(eq(rooms.type, filters.type as any));
    if (filters.archived === "true") conditions.push(eq(rooms.isArchived, true));
    if (filters.archived === "false") conditions.push(eq(rooms.isArchived, false));
    if (filters.search) conditions.push(ilike(rooms.name!, `%${filters.search}%`));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, total] = await Promise.all([
      db
        .select({
          id: rooms.id,
          type: rooms.type,
          name: rooms.name,
          isArchived: rooms.isArchived,
          createdBy: rooms.createdBy,
          createdAt: rooms.createdAt,
        })
        .from(rooms)
        .where(where)
        .orderBy(desc(rooms.createdAt))
        .limit(take)
        .offset(skip),
      db
        .select({ count: count() })
        .from(rooms)
        .where(where)
        .then((r) => Number(r[0]?.count ?? 0)),
    ]);

    // Enrich with member counts
    const roomIds = rows.map((r) => r.id);
    const memberCounts =
      roomIds.length > 0
        ? (await db
            .select({ roomId: roomMembers.roomId, count: count() })
            .from(roomMembers)
            .where(inArray(roomMembers.roomId, roomIds))
            .groupBy(roomMembers.roomId)) as { roomId: string; count: number }[]
        : [];

    const countMap = new Map(memberCounts.map((m) => [m.roomId, Number(m.count)]));
    const enriched = rows.map((r) => ({ ...r, memberCount: countMap.get(r.id) ?? 0 }));

    return { rows: enriched, total, page: filters.page ?? 1, limit: take };
  },

  async getRoomDetail(roomId: string) {
    const room = await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
    if (!room) throw new AppError(404, "Room not found", "NOT_FOUND");

    const [members, recentMessages] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: roomMembers.role,
          joinedAt: roomMembers.joinedAt,
        })
        .from(roomMembers)
        .innerJoin(users, eq(roomMembers.userId, users.id))
        .where(eq(roomMembers.roomId, roomId))
        .limit(50),
      db
        .select({
          id: messages.id,
          content: messages.content,
          type: messages.type,
          senderId: messages.senderId,
          senderName: users.name,
          isDeleted: messages.isDeleted,
          isFlagged: messages.isFlagged,
          createdAt: messages.createdAt,
        })
        .from(messages)
        .innerJoin(users, eq(messages.senderId, users.id))
        .where(and(eq(messages.roomId, roomId), eq(messages.isDeleted, false)))
        .orderBy(desc(messages.createdAt))
        .limit(50),
    ]);

    return { room, members, recentMessages };
  },

  async archiveRoom(roomId: string) {
    const room = await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
    if (!room) throw new AppError(404, "Room not found", "NOT_FOUND");

    await db.update(rooms).set({ isArchived: true, updatedAt: new Date() }).where(eq(rooms.id, roomId));
    logger.info({ roomId }, "room_archived_by_admin");
    return { success: true };
  },

  async hardDeleteMessage(messageId: string) {
    const msg = await db.query.messages.findFirst({ where: eq(messages.id, messageId) });
    if (!msg) throw new AppError(404, "Message not found", "NOT_FOUND");

    await db.delete(messages).where(eq(messages.id, messageId));
    logger.info({ messageId, roomId: msg.roomId }, "message_hard_deleted_by_admin");
    return { success: true };
  },

  // ─── Safety ─────────────────────────────────────────────────────────────────

  async getSafetyFlags(filters: SafetyFlagFilters) {
    const { take, skip } = paginate(filters);
    const conditions: ReturnType<typeof eq>[] = [];

    if (filters.status) conditions.push(eq(safetyFlags.status, filters.status as any));
    if (filters.flagType) conditions.push(eq(safetyFlags.flagType, filters.flagType as any));
    if (filters.dateFrom) conditions.push(gte(safetyFlags.createdAt, new Date(filters.dateFrom)));
    if (filters.dateTo) conditions.push(lte(safetyFlags.createdAt, new Date(filters.dateTo)));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, total] = await Promise.all([
      db
        .select({
          id: safetyFlags.id,
          messageId: safetyFlags.messageId,
          flaggedBy: safetyFlags.flaggedBy,
          flagType: safetyFlags.flagType,
          confidenceScore: safetyFlags.confidenceScore,
          reasoning: safetyFlags.reasoning,
          offendingSpan: safetyFlags.offendingSpan,
          status: safetyFlags.status,
          reviewedBy: safetyFlags.reviewedBy,
          reviewedAt: safetyFlags.reviewedAt,
          createdAt: safetyFlags.createdAt,
          messageContent: messages.content,
          senderName: users.name,
        })
        .from(safetyFlags)
        .leftJoin(messages, eq(safetyFlags.messageId, messages.id))
        .leftJoin(users, eq(messages.senderId, users.id))
        .where(where)
        .orderBy(desc(safetyFlags.createdAt))
        .limit(take)
        .offset(skip),
      db
        .select({ count: count() })
        .from(safetyFlags)
        .where(where)
        .then((r) => Number(r[0]?.count ?? 0)),
    ]);

    return { rows, total, page: filters.page ?? 1, limit: take };
  },

  async reviewFlag(flagId: string, status: string, reviewedBy: string) {
    const validStatuses = ["reviewed_safe", "reviewed_removed", "auto_blocked"];
    if (!validStatuses.includes(status)) throw new AppError(400, "Invalid status", "VALIDATION_ERROR");

    const flag = await db.query.safetyFlags.findFirst({ where: eq(safetyFlags.id, flagId) });
    if (!flag) throw new AppError(404, "Flag not found", "NOT_FOUND");

    await db
      .update(safetyFlags)
      .set({ status: status as any, reviewedBy, reviewedAt: new Date() })
      .where(eq(safetyFlags.id, flagId));

    logger.info({ flagId, status, reviewedBy }, "safety_flag_reviewed");
    return { success: true };
  },

  // ─── Stories ────────────────────────────────────────────────────────────────

  async getActiveStories() {
    const rows = await db
      .select({
        id: stories.id,
        userId: stories.userId,
        mediaType: stories.mediaType,
        mediaUrl: stories.mediaUrl,
        caption: stories.caption,
        bgColor: stories.bgColor,
        expiresAt: stories.expiresAt,
        isActive: stories.isActive,
        createdAt: stories.createdAt,
        userName: users.name,
      })
      .from(stories)
      .innerJoin(users, eq(stories.userId, users.id))
      .where(eq(stories.isActive, true))
      .orderBy(desc(stories.createdAt))
      .limit(100);

    return { rows, total: rows.length };
  },

  async deleteStory(storyId: string) {
    const story = await db.query.stories.findFirst({ where: eq(stories.id, storyId) });
    if (!story) throw new AppError(404, "Story not found", "NOT_FOUND");

    await db.update(stories).set({ isActive: false }).where(eq(stories.id, storyId));
    logger.info({ storyId }, "story_deleted_by_admin");
    return { success: true };
  },

  // ─── Analytics ──────────────────────────────────────────────────────────────

  async getAnalytics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      userGrowth,
      messageVolume,
      safetyTrends,
      aiUsage,
      topOffenders,
    ] = await Promise.all([
      // User growth: signups per day for last 30 days
      db.execute(sql`
        SELECT DATE(created_at) AS date, COUNT(*) AS count
        FROM users
        WHERE created_at >= ${thirtyDaysAgo.toISOString()}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `),

      // Message volume: messages per day for last 30 days
      db.execute(sql`
        SELECT DATE(created_at) AS date, COUNT(*) AS count
        FROM messages
        WHERE created_at >= ${thirtyDaysAgo.toISOString()} AND is_deleted = false
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `),

      // Safety trends: flags per day by type for last 30 days
      db.execute(sql`
        SELECT DATE(created_at) AS date, flag_type, COUNT(*) AS count
        FROM safety_flags
        WHERE created_at >= ${thirtyDaysAgo.toISOString()}
        GROUP BY DATE(created_at), flag_type
        ORDER BY date ASC
      `),

      // AI usage: chat sessions and summaries per day for last 30 days
      db.execute(sql`
        SELECT
          DATE(acs.created_at) AS date,
          COUNT(DISTINCT acs.id) AS sessions,
          COUNT(DISTINCT s.id) AS summaries
        FROM generate_series(
          ${thirtyDaysAgo.toISOString()}::date,
          CURRENT_DATE,
          '1 day'::interval
        ) AS d(date)
        LEFT JOIN ai_chat_sessions acs ON DATE(acs.created_at) = d.date
        LEFT JOIN summaries s ON DATE(s.created_at) = d.date
        GROUP BY d.date
        ORDER BY d.date ASC
      `),

      // Top repeat offenders: users with most safety flags
      db.execute(sql`
        SELECT
          u.id,
          u.name,
          u.email,
          COUNT(sf.id) AS flag_count,
          MAX(sf.created_at) AS last_flag_at
        FROM safety_flags sf
        JOIN messages m ON m.id = sf.message_id
        JOIN users u ON u.id = m.sender_id
        WHERE sf.created_at >= ${thirtyDaysAgo.toISOString()}
        GROUP BY u.id, u.name, u.email
        ORDER BY flag_count DESC
        LIMIT 20
      `),
    ]);

    return {
      userGrowth,
      messageVolume,
      safetyTrends,
      aiUsage,
      topOffenders,
    };
  },

  // ─── Audit Log ──────────────────────────────────────────────────────────────

  async getAuditLog(filters: AuditLogFilters) {
    const { take, skip } = paginate(filters);
    const conditions: ReturnType<typeof eq>[] = [];

    if (filters.event) conditions.push(eq(auditLog.event, filters.event));
    if (filters.userId) conditions.push(eq(auditLog.userId, filters.userId));
    if (filters.dateFrom) conditions.push(gte(auditLog.createdAt, new Date(filters.dateFrom)));
    if (filters.dateTo) conditions.push(lte(auditLog.createdAt, new Date(filters.dateTo)));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, total] = await Promise.all([
      db
        .select({
          id: auditLog.id,
          userId: auditLog.userId,
          event: auditLog.event,
          ipAddress: auditLog.ipAddress,
          userAgent: auditLog.userAgent,
          metadata: auditLog.metadata,
          createdAt: auditLog.createdAt,
          userName: users.name,
        })
        .from(auditLog)
        .leftJoin(users, eq(auditLog.userId, users.id))
        .where(where)
        .orderBy(desc(auditLog.createdAt))
        .limit(take)
        .offset(skip),
      db
        .select({ count: count() })
        .from(auditLog)
        .where(where)
        .then((r) => Number(r[0]?.count ?? 0)),
    ]);

    return { rows, total, page: filters.page ?? 1, limit: take };
  },
};
