import { relations } from "drizzle-orm";
import { users } from "./users";
import { refreshTokens } from "./refresh_tokens";
import { rooms } from "./rooms";
import { roomMembers } from "./room_members";
import { messages } from "./messages";
import { messageReads } from "./message_reads";
import { reactions } from "./reactions";
import { stories } from "./stories";
import { storyViews, storyReactions } from "./story_views_reactions";
import { safetyFlags } from "./safety_flags";
import { summaries, embeddings, aiChatSessions, auditLog } from "./ai_and_audit";

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
    refreshTokens: many(refreshTokens),
    createdRooms: many(rooms),
    roomMemberships: many(roomMembers),
    sentMessages: many(messages),
    messageReads: many(messageReads),
    reactions: many(reactions),
    stories: many(stories),
    storyViews: many(storyViews),
    storyReactions: many(storyReactions),
    aiChatSessions: many(aiChatSessions),
    auditLogs: many(auditLog),
    // Safety flags they reported (user reports)
    reportedFlags: many(safetyFlags, { relationName: "flaggedByUser" }),
    // Safety flags they reviewed (admin actions)
    reviewedFlags: many(safetyFlags, { relationName: "reviewedByAdmin" }),
    // Summaries they triggered
    summaries: many(summaries),
}));

// ─── Refresh Tokens ───────────────────────────────────────────────────────────

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
    user: one(users, {
        fields: [refreshTokens.userId],
        references: [users.id],
    }),
}));

// ─── Rooms ────────────────────────────────────────────────────────────────────

export const roomsRelations = relations(rooms, ({ one, many }) => ({
    creator: one(users, {
        fields: [rooms.createdBy],
        references: [users.id],
    }),
    members: many(roomMembers),
    messages: many(messages),
    summaries: many(summaries),
}));

// ─── Room Members ─────────────────────────────────────────────────────────────

export const roomMembersRelations = relations(roomMembers, ({ one }) => ({
    room: one(rooms, {
        fields: [roomMembers.roomId],
        references: [rooms.id],
    }),
    user: one(users, {
        fields: [roomMembers.userId],
        references: [users.id],
    }),
}));

// ─── Messages ─────────────────────────────────────────────────────────────────

export const messagesRelations = relations(messages, ({ one, many }) => ({
    room: one(rooms, {
        fields: [messages.roomId],
        references: [rooms.id],
    }),
    sender: one(users, {
        fields: [messages.senderId],
        references: [users.id],
    }),
    // Thread parent (self-join)
    threadParent: one(messages, {
        fields: [messages.threadParentId],
        references: [messages.id],
        relationName: "threadReplies",
    }),
    // Thread replies (self-join reverse)
    threadReplies: many(messages, {
        relationName: "threadReplies",
    }),
    reads: many(messageReads),
    reactions: many(reactions),
    safetyFlags: many(safetyFlags),
    embedding: one(embeddings, {
        fields: [messages.id],
        references: [embeddings.messageId],
    }),
}));

// ─── Message Reads ────────────────────────────────────────────────────────────

export const messageReadsRelations = relations(messageReads, ({ one }) => ({
    message: one(messages, {
        fields: [messageReads.messageId],
        references: [messages.id],
    }),
    user: one(users, {
        fields: [messageReads.userId],
        references: [users.id],
    }),
}));

// ─── Reactions ────────────────────────────────────────────────────────────────

export const reactionsRelations = relations(reactions, ({ one }) => ({
    message: one(messages, {
        fields: [reactions.messageId],
        references: [messages.id],
    }),
    user: one(users, {
        fields: [reactions.userId],
        references: [users.id],
    }),
}));

// ─── Stories ─────────────────────────────────────────────────────────────────

export const storiesRelations = relations(stories, ({ one, many }) => ({
    user: one(users, {
        fields: [stories.userId],
        references: [users.id],
    }),
    views: many(storyViews),
    reactions: many(storyReactions),
}));

// ─── Story Views ──────────────────────────────────────────────────────────────

export const storyViewsRelations = relations(storyViews, ({ one }) => ({
    story: one(stories, {
        fields: [storyViews.storyId],
        references: [stories.id],
    }),
    viewer: one(users, {
        fields: [storyViews.viewerId],
        references: [users.id],
    }),
}));

// ─── Story Reactions ──────────────────────────────────────────────────────────

export const storyReactionsRelations = relations(storyReactions, ({ one }) => ({
    story: one(stories, {
        fields: [storyReactions.storyId],
        references: [stories.id],
    }),
    user: one(users, {
        fields: [storyReactions.userId],
        references: [users.id],
    }),
}));

// ─── Safety Flags ─────────────────────────────────────────────────────────────

export const safetyFlagsRelations = relations(safetyFlags, ({ one }) => ({
    message: one(messages, {
        fields: [safetyFlags.messageId],
        references: [messages.id],
    }),
    flaggedByUser: one(users, {
        fields: [safetyFlags.flaggedBy],
        references: [users.id],
        relationName: "flaggedByUser",
    }),
    reviewedByAdmin: one(users, {
        fields: [safetyFlags.reviewedBy],
        references: [users.id],
        relationName: "reviewedByAdmin",
    }),
}));

// ─── Summaries ────────────────────────────────────────────────────────────────

export const summariesRelations = relations(summaries, ({ one }) => ({
    room: one(rooms, {
        fields: [summaries.roomId],
        references: [rooms.id],
    }),
    createdByUser: one(users, {
        fields: [summaries.createdBy],
        references: [users.id],
    }),
}));

// ─── Embeddings ───────────────────────────────────────────────────────────────

export const embeddingsRelations = relations(embeddings, ({ one }) => ({
    message: one(messages, {
        fields: [embeddings.messageId],
        references: [messages.id],
    }),
}));

// ─── AI Chat Sessions ─────────────────────────────────────────────────────────

export const aiChatSessionsRelations = relations(aiChatSessions, ({ one }) => ({
    user: one(users, {
        fields: [aiChatSessions.userId],
        references: [users.id],
    }),
}));

// ─── Audit Log ────────────────────────────────────────────────────────────────

export const auditLogRelations = relations(auditLog, ({ one }) => ({
    user: one(users, {
        fields: [auditLog.userId],
        references: [users.id],
    }),
}));