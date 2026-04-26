/**
 * packages/db/schema/index.ts
 *
 * Single barrel export for the entire Drizzle schema — 16 tables.
 * Import everything from this one file:
 *
 *   import { users, messages, rooms } from "@repo/db/schema"
 *
 * Exported in FK dependency order so Drizzle's migration generator
 * produces CREATE TABLE statements in the correct order.
 *
 * Tables (16):
 *   1.  users
 *   2.  refresh_tokens         → users
 *   3.  rooms                  → users
 *   4.  room_members           → users, rooms
 *   5.  messages               → users, rooms, messages (self)
 *   6.  threads                → messages, rooms
 *   7.  message_reads          → users, messages
 *   8.  reactions              → users, messages
 *   9.  stories                → users
 *   10. story_views            → users, stories
 *   11. story_reactions        → users, stories
 *   12. safety_flags           → users, messages
 *   13. summaries              → users, rooms
 *   14. embeddings             → messages
 *   15. ai_chat_sessions       → users
 *   16. audit_log              → users
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export { userRoleEnum } from "./users";
export { roomTypeEnum } from "./rooms";
export { roomMemberRoleEnum } from "./room_members";
export { messageTypeEnum } from "./messages";
export { storyMediaTypeEnum } from "./stories";
export { flagTypeEnum, flagStatusEnum } from "./safety_flags";

// ─── 1. Users ─────────────────────────────────────────────────────────────────

export { users } from "./users";
export type { User, NewUser } from "./users";

// ─── 2. Refresh Tokens ───────────────────────────────────────────────────────

export { refreshTokens } from "./refresh_tokens";
export type { RefreshToken, NewRefreshToken } from "./refresh_tokens";

// ─── 3. Rooms ────────────────────────────────────────────────────────────────

export { rooms } from "./rooms";
export type { Room, NewRoom } from "./rooms";

// ─── 4. Room Members ─────────────────────────────────────────────────────────

export { roomMembers } from "./room_members";
export type { RoomMember, NewRoomMember } from "./room_members";

// ─── 5. Messages ─────────────────────────────────────────────────────────────

export { messages } from "./messages";
export type { Message, NewMessage } from "./messages";

// ─── 6. Threads ──────────────────────────────────────────────────────────────

export { threads } from "./threads";
export type { Thread, NewThread } from "./threads";

// ─── 7. Message Reads ────────────────────────────────────────────────────────

export { messageReads } from "./message_reads";
export type { MessageRead, NewMessageRead } from "./message_reads";

// ─── 8. Reactions ────────────────────────────────────────────────────────────

export { reactions } from "./reactions";
export type { Reaction, NewReaction } from "./reactions";

// ─── 9. Stories ──────────────────────────────────────────────────────────────

export { stories } from "./stories";
export type { Story, NewStory } from "./stories";

// ─── 10. Story Views ─────────────────────────────────────────────────────────

export { storyViews } from "./story_views";
export type { StoryView, NewStoryView } from "./story_views";

// ─── 11. Story Reactions ─────────────────────────────────────────────────────

export { storyReactions } from "./story_reactions";
export type { StoryReaction, NewStoryReaction } from "./story_reactions";

// ─── 12. Safety Flags ────────────────────────────────────────────────────────

export { safetyFlags } from "./safety_flags";
export type { SafetyFlag, NewSafetyFlag } from "./safety_flags";

// ─── 13. Summaries ───────────────────────────────────────────────────────────

export { summaries } from "./summaries";
export type { Summary, NewSummary } from "./summaries";

// ─── 14. Embeddings ──────────────────────────────────────────────────────────

export { embeddings, vector } from "./embeddings";
export type { Embedding, NewEmbedding } from "./embeddings";

// ─── 15. AI Chat Sessions ────────────────────────────────────────────────────

export { aiChatSessions } from "./ai_chat_sessions";
export type {
    AiChatSession,
    NewAiChatSession,
    AiMessage,
} from "./ai_chat_sessions";

// ─── 16. Audit Log ───────────────────────────────────────────────────────────

export { auditLog } from "./audit_log";
export type { AuditLog, NewAuditLog } from "./audit_log";

// ─── Relations (required for db.query.* relational API) ──────────────────────

export {
    usersRelations,
    refreshTokensRelations,
    roomsRelations,
    roomMembersRelations,
    messagesRelations,
    threadsRelations,
    messageReadsRelations,
    reactionsRelations,
    storiesRelations,
    storyViewsRelations,
    storyReactionsRelations,
    safetyFlagsRelations,
    summariesRelations,
    embeddingsRelations,
    aiChatSessionsRelations,
    auditLogRelations,
} from "./relations";