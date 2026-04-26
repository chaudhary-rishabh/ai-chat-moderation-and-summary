/**
 * packages/db/schema/relations.ts
 *
 * Drizzle ORM relational query definitions.
 * These are NOT foreign keys — those are defined per-table.
 * These enable db.query.users.findMany({ with: { messages: true } }) syntax.
 *
 * Import order matches table dependency order to avoid circular ref issues.
 */

import { relations } from "drizzle-orm";
import { users } from "./users";
import { refreshTokens } from "./refresh_token";
import { rooms } from "./rooms";
import { roomMembers } from "./room_members";
import { messages } from "./messages";
import { threads } from "./threads";
import { messageReads } from "./message_reads";
import { reactions } from "./reactions";
import { stories } from "./stories";
import { storyViews } from "./story_views";
import { storyReactions } from "./story_reactions";
import { safetyFlags } from "./safety_flags";
import { summaries } from "./summaries";
import { embeddings } from "./embeddings";
import { aiChatSessions } from "./ai_chat_sessions";
import { auditLog } from "./audit_log";

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
  summaries: many(summaries),
  // Two separate named relations to users from safety_flags (flaggedBy + reviewedBy)
  reportedFlags: many(safetyFlags, { relationName: "flaggedByUser" }),
  reviewedFlags: many(safetyFlags, { relationName: "reviewedByAdmin" }),
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
  threads: many(threads),
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
  // Self-referencing: this message's parent in a thread
  threadParent: one(messages, {
    fields: [messages.threadParentId],
    references: [messages.id],
    relationName: "threadReplies",
  }),
  // Self-referencing: all replies to this message
  threadReplies: many(messages, {
    relationName: "threadReplies",
  }),
  // Thread metadata record for this root message (if it has replies)
  thread: one(threads, {
    fields: [messages.id],
    references: [threads.rootMessageId],
  }),
  reads: many(messageReads),
  reactions: many(reactions),
  safetyFlags: many(safetyFlags),
  embedding: one(embeddings, {
    fields: [messages.id],
    references: [embeddings.messageId],
  }),
}));

// ─── Threads ──────────────────────────────────────────────────────────────────

export const threadsRelations = relations(threads, ({ one }) => ({
  // The root message this thread belongs to
  rootMessage: one(messages, {
    fields: [threads.rootMessageId],
    references: [messages.id],
  }),
  room: one(rooms, {
    fields: [threads.roomId],
    references: [rooms.id],
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
  // Named relation: user who submitted the report (may be null = AI flagged)
  flaggedByUser: one(users, {
    fields: [safetyFlags.flaggedBy],
    references: [users.id],
    relationName: "flaggedByUser",
  }),
  // Named relation: admin who reviewed the flag
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