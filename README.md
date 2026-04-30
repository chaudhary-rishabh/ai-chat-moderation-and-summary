# NexChat

Real-time chat platform with AI-assisted messaging, story sharing, content safety classification, and hybrid vector + full-text search — built as a TypeScript monorepo.

```
                   ┌──────────────────────────────────────────┐
                   │              Client (Browser)             │
                   │  ┌──────────┐  ┌──────────┐  ┌────────┐ │
                   │  │ Next.js  │  │ Next.js  │  │  REST  │ │
                   │  │ Web App  │  │  Admin   │  │ Client │ │
                   │  │ :3000    │  │ :3001    │  │        │ │
                   │  └────┬─────┘  └────┬─────┘  └───┬────┘ │
                   └───────┼─────────────┼───────────┼───────┘
                           │             │           │
                    ┌──────┴─────────────┴───────────┴──────┐
                    │              HTTPS / WSS               │
                    └──────────────────┬────────────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │              Express 5 Server (:4000)            │
              │  ┌──────────┐  ┌──────────┐  ┌───────────────┐ │
              │  │  REST    │  │  WebSocket│  │  BullMQ       │ │
              │  │  Routes  │  │  Server   │  │  Workers (4)  │ │
              │  │  /api/*  │  │  ws://    │  │               │ │
              │  └────┬─────┘  └────┬─────┘  └───────┬───────┘ │
              │       │             │                  │         │
              │  ┌────┴─────────────┴──────────────────┴──────┐ │
              │  │            Service Layer                    │ │
              │  │  Auth  │ Rooms │ Messages │ AI │ Admin     │ │
              │  └───────────────────────┬────────────────────┘ │
              │                          │                      │
              └──────────────────────────┼──────────────────────┘
                                         │
              ┌──────────────────────────┼──────────────────────┐
              │                    Data Layer                    │
              │  ┌──────────┐  ┌────────────┐  ┌─────────────┐ │
              │  │PostgreSQL│  │   Redis 7  │  │  AI APIs    │ │
              │  │ 16 +     │  │  pub/sub   │  │  DeepSeek   │ │
              │  │ pgvector  │  │  presence  │  │  Gemini     │ │
              │  └──────────┘  └────────────┘  └─────────────┘ │
              └─────────────────────────────────────────────────┘
```

## Features

| Messaging & Real-time | AI & Safety |
| --- | --- |
| Real-time messaging over WebSocket (ws@8) | Hybrid RAG: pgvector cosine similarity + PostgreSQL BM25 FTS merged via Reciprocal Rank Fusion |
| Threaded replies with self-referencing messages table | DeepSeek R1 for safety classification on every message |
| Typing indicators with debounce via Redis pub/sub | DeepSeek V3.2 for reply suggestions |
| Emoji reactions on messages | Gemini 2.5 Flash for room conversation summaries |
| Image/video/audio/file message types | Direct AI chat with streaming (SSE) responses |
| Per-room online presence with 30s heartbeat | Message embedding generation (DeepSeek V3) queued via BullMQ |
| Story sharing with 24h auto-expiry | Content safety alerts broadcast to admin WebSocket clients |
| Story views and reactions | |

## Tech Stack

| Category | Technology | Version |
| --- | --- | --- |
| **Monorepo** | TurboRepo + pnpm workspaces | turbo ^2.0, pnpm 9.0 |
| **Backend Framework** | Express | ^5.1 |
| **WebSocket** | ws (noServer:true on same HTTP server) | ^8.20 |
| **Frontend** | Next.js App Router + React | next ^15, react ^19 |
| **Auth (Server)** | JWT — 15min access + 7d refresh rotation | jsonwebtoken ^9.0 |
| **Auth (Client)** | NextAuth v5 (Auth.js beta) with Credentials provider | beta |
| **Database** | PostgreSQL 16 with pgvector extension | postgres ^3.4 |
| **ORM** | Drizzle ORM with custom pgvector type | ^0.30 |
| **Cache / Pub-Sub** | Redis 7 via ioredis | ^5.3 |
| **Job Queue** | BullMQ (embed, safety, story-expiry, summary) | ^5.0 |
| **Validation** | Zod | ^3.22 |
| **Password Hashing** | bcrypt (12 rounds) | ^2.4 |
| **Server State** | TanStack Query | ^5.0 |
| **Client State** | Zustand with Immer middleware | zustand ^5, immer ^10 |
| **Admin Tables** | TanStack Table | ^8.15 |
| **Admin Charts** | Recharts | ^2.12 |
| **Styling** | Tailwind CSS | ^4.0 |
| **Animation** | Framer Motion | ^11.0 |
| **Forms** | react-hook-form + @hookform/resolvers | ^7.0 |
| **Package Types** | TypeScript | 5.4 |
| **Email** | Nodemailer (password reset) | ^6.10 |

## Monorepo Structure

```
nexchat/
├── apps/
│   ├── server/          # Express 5 + WebSocket + BullMQ workers
│   │   └── src/
│   │       ├── ai/            # RAG pipeline, safety, summaries, suggestions, direct chat
│   │       ├── controllers/   # Route handlers (auth, rooms, messages, stories, ai, admin, users)
│   │       ├── jobs/          # BullMQ workers (embed, safety, story-expiry, summary)
│   │       ├── lib/           # env, jwt, errors, email, redis, crypto, logger
│   │       ├── middleware/    # auth (JWT verify + role guard), rate limiter, sanitize
│   │       ├── routes/        # Express routers (auth, users, rooms, messages, stories, ai, admin)
│   │       ├── services/      # Business logic (auth, token, admin, users, messages, rooms, stories)
│   │       └── ws/            # WebSocket server + room manager + event handlers
│   ├── web/             # Next.js 15 — main chat application (:3000)
│   │   └── app/
│   │       ├── chat/          # Real-time chat UI
│   │       ├── ai/            # AI chat interface
│   │       ├── stories/       # Story feed + viewer
│   │       └── settings/      # User profile + password
│   └── admin/           # Next.js 15 — admin dashboard (:3001)
│       └── app/
│           └── admin/
│               ├── users/     # User management
│               ├── rooms/     # Room management
│               ├── safety/    # Safety flag review queue
│               ├── stories/   # Active story monitoring
│               └── analytics/ # Charts + metrics
├── packages/
│   ├── db/              # Drizzle ORM — schema, queries, migrations
│   │   ├── schema/       # 16 table definitions + relations
│   │   ├── queries/      # Reusable query functions
│   │   └── drizzle/      # Migrations
│   ├── types/           # Shared Zod schemas + TypeScript types
│   │   └── src/
│   │       ├── auth.ts       # Auth validation schemas + types
│   │       ├── ws-events.ts  # WebSocket event type definitions
│   │       └── index.ts      # Barrel export
│   ├── config/          # Shared tsconfig base
│   └── ui/              # Shared React component library (shadcn/ui-style)
├── .env.example         # All environment variables documented
├── turbo.json           # TurboRepo pipeline configuration
├── pnpm-workspace.yaml  # Workspace definition
└── package.json         # Root scripts (build, dev, lint)
```

## Prerequisites

| Dependency | Version | Required For |
| --- | --- | --- |
| **Node.js** | >= 18.17 | Runtime |
| **pnpm** | >= 9.0 | Package manager |
| **PostgreSQL** | >= 16 with pgvector extension | Primary database + vector search |
| **Redis** | >= 7 | Pub/sub, presence, rate limiting, job queues |

## Getting Started

```bash
# 1. Clone and install
git clone <repo-url> && cd nexchat
pnpm install

# 2. Set up environment
cp .env.example .env
# Edit .env — fill in DATABASE_URL, REDIS_URL, JWT secrets, SMTP credentials

# 3. Enable pgvector extension (PostgreSQL)
psql -U postgres -c "CREATE EXTENSION IF NOT EXISTS vector;"

# 4. Push database schema (Drizzle)
pnpm --filter db db:push

# 5. Start all services in dev mode
pnpm dev
```

The `pnpm dev` command starts three processes in parallel via TurboRepo:
- **Server** → `http://localhost:4000`
- **Web App** → `http://localhost:3000`
- **Admin Dashboard** → `http://localhost:3001`

## Available Scripts

| Script | Scope | Command | Description |
| --- | --- | --- | --- |
| `dev` | Root | `pnpm dev` | Start all three apps in dev mode |
| `build` | Root | `pnpm build` | Build all packages and apps |
| `lint` | Root | `pnpm lint` | Lint all packages and apps |
| `dev` | Server | `pnpm --filter server dev` | Start Express server with hot reload (tsx) |
| `build` | Server | `pnpm --filter server build` | TypeScript compilation (`tsc`) |
| `dev` | Web | `pnpm --filter web dev` | Start Next.js web app |
| `build` | Web | `pnpm --filter web build` | Production build of web app |
| `dev` | Admin | `pnpm --filter admin dev` | Start Next.js admin dashboard |
| `build` | Admin | `pnpm --filter admin build` | Production build of admin dashboard |
| `db:push` | DB | `pnpm --filter db db:push` | Push Drizzle schema to PostgreSQL |
| `db:generate` | DB | `pnpm --filter db db:generate` | Generate Drizzle migration files |
| `db:migrate` | DB | `pnpm --filter db db:migrate` | Run pending Drizzle migrations |

## Database Schema

16 tables in PostgreSQL, all managed via Drizzle ORM with FK dependency ordering.

### users
| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `uuid` | PK, default random |
| `email` | `text` | NOT NULL, UNIQUE |
| `name` | `text` | NOT NULL |
| `avatar_url` | `text` | nullable |
| `password_hash` | `text` | NOT NULL |
| `role` | `user_role` enum | NOT NULL, default `user` |
| `is_active` | `boolean` | NOT NULL, default true |
| `is_verified` | `boolean` | NOT NULL, default false |
| `last_seen_at` | `timestamptz` | nullable |
| `password_reset_token` | `text` | nullable |
| `password_reset_expires` | `timestamptz` | nullable |
| `created_at` | `timestamptz` | NOT NULL, default now |
| `updated_at` | `timestamptz` | NOT NULL, default now |

Indexes: `users_email_idx` (unique), `users_role_idx`, `users_last_seen_idx`

### refresh_tokens
| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `uuid` | PK, default random |
| `user_id` | `uuid` | FK → users.id, ON DELETE CASCADE |
| `token_hash` | `text` | NOT NULL |
| `jti` | `text` | NOT NULL |
| `ip_address` | `text` | nullable |
| `user_agent` | `text` | nullable |
| `revoked_at` | `timestamptz` | nullable |
| `expires_at` | `timestamptz` | NOT NULL |
| `created_at` | `timestamptz` | NOT NULL, default now |

### rooms
| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `uuid` | PK, default random |
| `name` | `text` | NOT NULL |
| `type` | `room_type` enum | NOT NULL, default `group` |
| `created_by` | `uuid` | FK → users.id |
| `is_archived` | `boolean` | NOT NULL, default false |
| `created_at` | `timestamptz` | NOT NULL, default now |
| `updated_at` | `timestamptz` | NOT NULL, default now |

### room_members
| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `uuid` | PK, default random |
| `user_id` | `uuid` | FK → users.id, ON DELETE CASCADE |
| `room_id` | `uuid` | FK → rooms.id, ON DELETE CASCADE |
| `role` | `room_member_role` enum | NOT NULL, default `member` |
| `joined_at` | `timestamptz` | NOT NULL, default now |

Unique constraint on `(user_id, room_id)`.

### messages
| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `uuid` | PK, default random |
| `room_id` | `uuid` | FK → rooms.id, ON DELETE CASCADE |
| `sender_id` | `uuid` | FK → users.id, ON DELETE RESTRICT |
| `thread_parent_id` | `uuid` | FK → messages.id (self), ON DELETE SET NULL |
| `type` | `message_type` enum | NOT NULL, default `text` |
| `content` | `text` | nullable |
| `media_url` | `text` | nullable |
| `is_deleted` | `boolean` | NOT NULL, default false |
| `is_flagged` | `boolean` | NOT NULL, default false |
| `created_at` | `timestamptz` | NOT NULL, default now |
| `updated_at` | `timestamptz` | NOT NULL, default now |

Indexes: `messages_room_id_idx`, `messages_sender_id_idx`, `messages_thread_parent_id_idx`, `messages_room_created_idx` (composite `room_id, created_at`), `messages_is_flagged_idx`

### threads
| Column | Type | Constraints |
| --- | --- | --- |
| `message_id` | `uuid` | PK, FK → messages.id |
| `room_id` | `uuid` | FK → rooms.id |
| `reply_count` | `integer` | NOT NULL, default 0 |
| `updated_at` | `timestamptz` | NOT NULL, default now |

### message_reads
| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `uuid` | PK, default random |
| `user_id` | `uuid` | FK → users.id |
| `message_id` | `uuid` | FK → messages.id, ON DELETE CASCADE |
| `read_at` | `timestamptz` | NOT NULL, default now |

### reactions
| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `uuid` | PK, default random |
| `user_id` | `uuid` | FK → users.id, ON DELETE CASCADE |
| `message_id` | `uuid` | FK → messages.id, ON DELETE CASCADE |
| `emoji` | `text` | NOT NULL |
| `created_at` | `timestamptz` | NOT NULL, default now |

Unique constraint on `(user_id, message_id, emoji)`.

### stories
| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `uuid` | PK, default random |
| `user_id` | `uuid` | FK → users.id, ON DELETE CASCADE |
| `media_url` | `text` | NOT NULL |
| `media_type` | `story_media_type` enum | NOT NULL |
| `caption` | `text` | nullable |
| `expires_at` | `timestamptz` | NOT NULL |
| `created_at` | `timestamptz` | NOT NULL, default now |

### story_views
| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `uuid` | PK, default random |
| `user_id` | `uuid` | FK → users.id, ON DELETE CASCADE |
| `story_id` | `uuid` | FK → stories.id, ON DELETE CASCADE |
| `viewed_at` | `timestamptz` | NOT NULL, default now |

### story_reactions
| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `uuid` | PK, default random |
| `user_id` | `uuid` | FK → users.id, ON DELETE CASCADE |
| `story_id` | `uuid` | FK → stories.id, ON DELETE CASCADE |
| `reaction` | `text` | NOT NULL |
| `created_at` | `timestamptz` | NOT NULL, default now |

### safety_flags
| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `uuid` | PK, default random |
| `message_id` | `uuid` | FK → messages.id, ON DELETE CASCADE |
| `flag_type` | `flag_type` enum | NOT NULL |
| `confidence_score` | `numeric(3,2)` | NOT NULL |
| `reasoning` | `text` | nullable |
| `offending_span` | `text` | nullable |
| `status` | `flag_status` enum | NOT NULL, default `pending` |
| `reviewed_by` | `uuid` | FK → users.id, nullable |
| `reviewed_at` | `timestamptz` | nullable |
| `created_at` | `timestamptz` | NOT NULL, default now |

### summaries
| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `uuid` | PK, default random |
| `user_id` | `uuid` | FK → users.id |
| `room_id` | `uuid` | FK → rooms.id, ON DELETE CASCADE |
| `content` | `text` | NOT NULL |
| `created_at` | `timestamptz` | NOT NULL, default now |

### embeddings
| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `uuid` | PK, default random |
| `message_id` | `uuid` | FK → messages.id, ON DELETE CASCADE |
| `embedding` | `vector(1536)` | NOT NULL |
| `model` | `text` | NOT NULL, default `deepseek-v3` |
| `created_at` | `timestamptz` | NOT NULL, default now |

Uses pgvector `vector(1536)` type with IVFFlat index for cosine similarity search.

### ai_chat_sessions
| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `uuid` | PK, default random |
| `user_id` | `uuid` | FK → users.id, ON DELETE CASCADE |
| `title` | `text` | NOT NULL, default `New Chat` |
| `messages` | `jsonb` | NOT NULL, default `[]` |
| `created_at` | `timestamptz` | NOT NULL, default now |
| `updated_at` | `timestamptz` | NOT NULL, default now |

### audit_log
| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `uuid` | PK, default random |
| `user_id` | `uuid` | FK → users.id, ON DELETE SET NULL |
| `action` | `text` | NOT NULL |
| `entity_type` | `text` | NOT NULL |
| `entity_id` | `text` | NOT NULL |
| `details` | `jsonb` | nullable |
| `ip_address` | `text` | nullable |
| `created_at` | `timestamptz` | NOT NULL, default now |

Index: `audit_log_user_id_idx`, `audit_log_action_idx`, `audit_log_entity_idx`

### Enums

| Enum Name | Values |
| --- | --- |
| `user_role` | `user`, `moderator`, `admin`, `superadmin` |
| `room_type` | `direct`, `group` |
| `room_member_role` | `owner`, `admin`, `member` |
| `message_type` | `text`, `image`, `video`, `audio`, `file`, `system` |
| `story_media_type` | `image`, `video` |
| `flag_type` | `harassment`, `hate_speech`, `violence`, `self_harm`, `sexual_content`, `spam`, `other` |
| `flag_status` | `pending`, `reviewed`, `dismissed` |

## Architecture

### Backend Layers

Every request flows through a strict layer hierarchy. Each layer has defined responsibilities and boundaries.

```
Request → Middleware → Route → Controller → Service → Query → Database
                              │
                              ├─ Zod validation (route level)
                              ├─ JWT verify + role guard (middleware)
                              ├─ Rate limiting (middleware, per-route)
                              └─ HPP + XSS sanitization (app level)
```

**Rules enforced in code:**
1. Routes define the HTTP method, path, middleware chain, and validation schema only
2. Controllers extract request data, call services, and format responses — no business logic
3. Services contain all business logic — no direct DB access, only query functions
4. Queries are pure Drizzle query builders exported from `packages/db/queries/`
5. WebSocket handlers receive parsed payloads, call services, and broadcast via RoomManager

### WebSocket Flow

```
Client connects with JWT in query string: ws://host?token=<accessToken>
        │
        ▼
HTTP Upgrade handler:
  1. Extract + verify JWT from URL query param
  2. Fetch user + room memberships from DB
  3. Reject if user inactive or token invalid
  4. Attach userId, role, isAlive to socket
  5. Register via RoomManager.handleConnect()
        │
        ▼
Connected — client sends typed JSON events:
  { "type": "msg:send", "payload": { "roomId": "...", "content": "..." } }
        │
        ▼
RoomManager dispatches to handler → handler calls service → broadcast result
        │
        ▼
Redis pub/sub forwards to other server instances (horizontal scaling)
        │
        ▼
Heartbeat: server pings every 30s, terminates dead sockets
Presence: client pings every 25s, server refreshes Redis key (35s TTL)
```

**Client → Server events:**
| Event Type | Payload | Handler |
| --- | --- | --- |
| `msg:send` | `{ roomId, content, type?, mediaUrl?, threadParentId? }` | `handleMsgSend` |
| `typing:start` | `{ roomId }` | `handleTypingStart` |
| `typing:stop` | `{ roomId }` | `handleTypingStop` |
| `reaction:add` | `{ roomId, messageId, emoji }` | `handleReactionAdd` |
| `reaction:remove` | `{ roomId, messageId, emoji }` | `handleReactionRemove` |
| `presence:ping` | `{}` | `handlePresencePing` |

**Server → Client events:**
| Event Type | Payload | Trigger |
| --- | --- | --- |
| `msg:new` | `{ message: { id, roomId, sender, type, content, mediaUrl, threadParentId, createdAt } }` | Message created + embed job queued |
| `msg:deleted` | `{ messageId, roomId }` | Message soft-deleted |
| `msg:flagged` | `{ messageId, roomId, flagType }` | Safety worker flags content |
| `typing:update` | `{ roomId, userId, userName, isTyping }` | Typing start/stop |
| `presence:update` | `{ userId, status, lastSeenAt? }` | User connects/disconnects |
| `reaction:update` | `{ messageId, roomId, reactions[] }` | Reaction added/removed |
| `safety:alert` | `{ messageId, roomId, senderId, flagType, confidenceScore, offendingSpan }` | Sent to admin clients only |

### AI Pipeline

```
Message sent
     │
     ├─→ BullMQ Embed Queue ──→ DeepSeek V3 ──→ pgvector embedding stored
     │
     ├─→ BullMQ Safety Queue ──→ DeepSeek R1 classification
     │         │
     │         ├─ score ≤ 0.7 or "safe" → no action
     │         └─ score > 0.7 + unsafe → insert safety_flag + alert admins via WS
     │
     └─→ (on demand) Hybrid RAG Search
              │
              ├─ Path 1: pgvector cosine similarity (semantic)
              ├─ Path 2: PostgreSQL BM25 full-text search (keyword)
              └─ Merge via Reciprocal Rank Fusion (RRF k=60)
```

**Scheduled jobs:**
| Job | Queue | Schedule | Worker |
| --- | --- | --- | --- |
| Story expiry | `story-expiry` | Every 60 min (`0 * * * *`) | Deletes stories where `expires_at < now()` |
| Room summaries | `summary` | Every 6 hours (`0 */6 * * *`) | Generates AI conversation summaries via Gemini 2.5 Flash |

**On-demand jobs (queued per event):**
| Job | Queue | Concurrency | Worker |
| --- | --- | --- | --- |
| Embedding generation | `embed` | 2 | Generates 1536-dim vector embedding via DeepSeek V3 |
| Safety classification | `safety` | 1 | Classifies message content via DeepSeek R1 |

### Frontend State Architecture

```
┌──────────────────────────────────────────────────┐
│                  TanStack Query                    │
│  Server state (read-through cache)                │
│  ─ rooms list, messages, stories, AI sessions     │
│  ─ Automatic refetch on window focus              │
│  ─ Stale time: 60s (rooms), 30s (messages)        │
└──────────────────────┬───────────────────────────┘
                       │
┌──────────────────────┴───────────────────────────┐
│                    Zustand                         │
│  Client-only state (ephemeral)                    │
│  ─ rooms[] — synced from TanStack Query on mount  │
│  ─ messages{} — map of roomId → messages[]        │
│  ─ typingUsers[] — who is typing in each room     │
│  ─ presence map — online/offline per user         │
│  ─ WebSocket singleton — module-level reference   │
└──────────────────────────────────────────────────┘
```

**State rules enforced:**
- TanStack Query owns all server-fetched data (rooms, stories, AI sessions)
- Zustand owns real-time WebSocket state (messages, typing, presence)
- Components never call axios directly — they use query hooks or mutation hooks
- The WebSocket connection is a module-level singleton in `hooks/useWebSocket.ts`

## Authentication Flow

### Server-side (JWT)

```
POST /api/auth/register          POST /api/auth/login
        │                                │
        ▼                                ▼
  bcrypt(password, 12)            bcrypt.compare(password, hash)
        │                                │
        ▼                                ▼
  issueTokenPair(userId, role)    issueTokenPair(userId, role)
        │                                │
        ▼                                ▼
  { accessToken (15min), refreshToken (7d), user }
```

**Token rotation on refresh:**
```
POST /api/auth/refresh { refreshToken }
        │
        ▼
  1. Verify JWT signature (REFRESH_SECRET)
  2. Hash token, look up in refresh_tokens table
  3. Check not revoked, not expired, userId matches
  4. Revoke old token (set revoked_at)
  5. Issue NEW access + refresh pair (rotation)
```

**Logout:** revokes the specific refresh token. **Password reset:** revokes ALL refresh tokens for the user.

### Client-side (NextAuth v5)

```
┌─────────────────────────────────────────────────────────────┐
│  Web App (apps/web)                                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ NextAuth Credentials Provider                          │  │
│  │   authorize() → POST {email, password} to server       │  │
│  │   JWT callback → auto-refresh 60s before expiry        │  │
│  │   Session callback → exposes user + accessToken        │  │
│  │   Cookies: httpOnly, sameSite lax, secure in prod      │  │
│  └───────────────────────────────────────────────────────┘  │
│  Middleware:                                                 │
│    /chat, /ai, /stories, /settings → require session        │
│    /login, /register, /forgot-password → redirect if logged │
│    RefreshTokenExpired → redirect to /login?error=          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Admin App (apps/admin)                                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ NextAuth Credentials Provider (separate config)        │  │
│  │   JWT callback → rejects if role ∉ {admin, superadmin}│  │
│  │   Session callback → user without refreshToken         │  │
│  └───────────────────────────────────────────────────────┘  │
│  Middleware: all /admin/* routes require session + role     │
└─────────────────────────────────────────────────────────────┘
```

## Environment Variables

All variables from `.env.example`. Every variable is validated via Zod on server startup — the server exits immediately if validation fails.

| Variable | Type | Default | Description |
| --- | --- | --- | --- |
| `DATABASE_URL` | `string` | required | PostgreSQL connection string (e.g. `postgresql://user:pass@localhost:5432/chatapp`) |
| `DB_POOL_MAX` | `number` | `10` | PostgreSQL connection pool max size |
| `REDIS_URL` | `string (URL)` | required | Redis connection string (e.g. `redis://localhost:6379`) |
| `JWT_ACCESS_SECRET` | `string` | required | Secret for signing access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | `string` | required | Secret for signing refresh tokens (min 32 chars) |
| `JWT_ACCESS_EXPIRY` | `string` | `15m` | Access token TTL (e.g. `15m`, `1h`) |
| `JWT_REFRESH_EXPIRY` | `string` | `7d` | Refresh token TTL (e.g. `7d`, `30d`) |
| `NEXTAUTH_SECRET` | `string` | required | NextAuth session encryption key (min 32 chars) |
| `NEXTAUTH_URL` | `string` | `http://localhost:3000` | Canonical URL of the web app |
| `NEXT_PUBLIC_ADMIN_URL` | `string` | `http://localhost:3001` | Admin app URL (used for CORS) |
| `SERVER_PORT` | `number` | `4000` | Express server port |
| `NODE_ENV` | `enum` | `development` | `development`, `test`, or `production` |
| `CORS_ORIGIN` | `string` | required | Comma-separated allowed origins (e.g. `http://localhost:3000,http://localhost:3001`) |
| `SERVER_URL` | `string` | `http://localhost:4000` | Backend URL (server-side fetch) |
| `NEXT_PUBLIC_SERVER_URL` | `string` | `http://localhost:4000` | Backend URL (browser-side fetch) |
| `SMTP_HOST` | `string` | required | SMTP server host for password reset emails |
| `SMTP_PORT` | `number` | `587` | SMTP server port |
| `SMTP_USER` | `string` | required | SMTP authentication username |
| `SMTP_PASS` | `string` | required | SMTP authentication password |
| `SMTP_FROM` | `string (email)` | required | From address for password reset emails |
| `FRONTEND_URL` | `string (URL)` | required | Frontend base URL (used in password reset links) |
| `PASSWORD_RESET_EXPIRY_MINUTES` | `number` | `30` | Password reset token validity duration |

## API Reference

Base URL: `http://localhost:4000/api`

All routes except `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/forgot-password`, and `/auth/reset-password` require a `Bearer <accessToken>` header.

### Auth — `/api/auth`

| Method | Path | Auth | Body | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/api/auth/register` | No | `{ name, email, password }` | `{ user, accessToken, refreshToken }` |
| `POST` | `/api/auth/login` | No | `{ email, password }` | `{ user, accessToken, refreshToken }` |
| `POST` | `/api/auth/refresh` | No | `{ refreshToken }` | `{ accessToken, refreshToken, userId, role }` |
| `POST` | `/api/auth/logout` | Yes | `{ refreshToken }` | `204 No Content` |
| `POST` | `/api/auth/forgot-password` | No | `{ email }` | `{ message, userId }` |
| `POST` | `/api/auth/reset-password` | No | `{ token, email, newPassword }` | `{ message, userId }` |

Rate limit: 10 requests per hour on all auth routes.

### Users — `/api/users`

| Method | Path | Auth | Body | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/api/users/me` | Yes | — | `{ user }` |
| `PUT` | `/api/users/me` | Yes | `{ name?, avatarUrl? }` | `{ user }` |
| `PATCH` | `/api/users/me/password` | Yes | `{ currentPassword, newPassword }` | `{ message }` |
| `PATCH` | `/api/users/me/last-seen` | Yes | — | `204 No Content` |

### Rooms — `/api/rooms`

| Method | Path | Auth | Body | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/api/rooms` | Yes | `{ name, memberIds[] }` | `{ room }` |
| `GET` | `/api/rooms` | Yes | — | `{ rooms[] }` |
| `GET` | `/api/rooms/:roomId` | Yes | — | `{ room }` |
| `POST` | `/api/rooms/:roomId/members` | Yes | `{ userId }` | `{ member }` |
| `DELETE` | `/api/rooms/:roomId/members/:userId` | Yes | — | `204 No Content` |
| `GET` | `/api/rooms/:roomId/messages` | Yes | `?before&limit` | `{ messages[] }` |
| `POST` | `/api/rooms/read` | Yes | `{ roomId, messageId }` | `204 No Content` |

### Messages — `/api/rooms/:roomId/messages`

| Method | Path | Auth | Body | Response |
| --- | --- | --- | --- | --- |
| `DELETE` | `/api/rooms/:roomId/messages/:messageId` | Yes | — | `{ message }` |
| `GET` | `/api/rooms/:roomId/messages/search` | Yes | `?q` | `{ messages[] }` |

Message creation happens exclusively via WebSocket (`msg:send` event), not via REST.

### Stories — `/api/stories`

| Method | Path | Auth | Body | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/api/stories` | Yes | `{ mediaUrl, mediaType, caption? }` | `{ story }` |
| `GET` | `/api/stories/feed` | Yes | — | `{ stories[] }` |
| `POST` | `/api/stories/:storyId/view` | Yes | — | `204 No Content` |
| `POST` | `/api/stories/:storyId/react` | Yes | `{ reaction }` | `{ reaction }` |
| `DELETE` | `/api/stories/:storyId` | Yes | — | `204 No Content` |
| `GET` | `/api/stories/:storyId/viewers` | Yes | — | `{ viewers[] }` |

### AI — `/api/ai`

| Method | Path | Auth | Body | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/api/ai/summarize/:roomId` | Yes | — | `{ summary }` |
| `POST` | `/api/ai/suggest` | Yes | `{ roomId }` | `{ suggestions[] }` |
| `POST` | `/api/ai/chat` | Yes | `{ message, sessionId? }` | `{ reply, sessionId }` |
| `GET` | `/api/ai/chat/stream` | Yes | `?sessionId&message` | SSE stream |
| `GET` | `/api/ai/chat/session` | Yes | `?sessionId` | `{ session }` |

### Admin — `/api/admin`

All admin routes require auth + `admin` or `superadmin` role.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/admin/users` | List users with pagination + filters |
| `GET` | `/api/admin/users/:userId` | Get user detail |
| `PUT` | `/api/admin/users/:userId/deactivate` | Deactivate/activate user |
| `PUT` | `/api/admin/users/:userId/role` | Change user role |
| `POST` | `/api/admin/users/:userId/reset-password` | Admin-initiated password reset |
| `GET` | `/api/admin/rooms` | List rooms with pagination |
| `GET` | `/api/admin/rooms/:roomId` | Get room detail + members |
| `PUT` | `/api/admin/rooms/:roomId/archive` | Archive/unarchive room |
| `DELETE` | `/api/admin/messages/:messageId` | Hard delete a message |
| `GET` | `/api/admin/safety/flags` | List safety flags with filters |
| `PUT` | `/api/admin/safety/flags/:flagId/review` | Review a safety flag (status + notes) |
| `GET` | `/api/admin/stories` | List active stories |
| `DELETE` | `/api/admin/stories/:storyId` | Admin delete a story |
| `GET` | `/api/admin/analytics` | Dashboard analytics (users, messages, rooms over time) |
| `GET` | `/api/admin/audit-log` | Query audit log with filters |

### Error Response Format

All errors follow a consistent shape:

```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE",
  "details": []
}
```

HTTP status codes used: `400` (validation), `401` (auth), `403` (forbidden), `404` (not found), `409` (conflict), `429` (rate limited), `500` (server error).

## Security

| # | Measure | Implementation |
| --- | --- | --- |
| 1 | JWT access/refresh token rotation | 15min access + 7d refresh. Refresh rotates on every use — old token revoked in DB |
| 2 | Password hashing | bcrypt with 12 salt rounds |
| 3 | httpOnly cookies | NextAuth session token: `httpOnly: true, sameSite: "lax", secure: true` in production |
| 4 | CSP headers | Helmet with restrictive directives: `defaultSrc 'self'`, no `unsafe-eval` |
| 5 | HSTS | `max-age=31536000, includeSubDomains, preload` |
| 6 | Frame guard | `DENY` — prevents clickjacking |
| 7 | Referrer policy | `no-referrer` |
| 8 | CORS | Whitelist-based, credentials enabled, origins from `CORS_ORIGIN` env var |
| 9 | Rate limiting | Redis-backed: 100 req/15min global, 10 req/hr on auth routes, progressive slowdown after 50 req/15min |
| 10 | Request size limiting | `express.json({ limit: "10kb" })` — prevents body parser DoS |
| 11 | Parameter pollution | `hpp()` — strips duplicate query params |
| 12 | XSS sanitization | `xss-clean` middleware on all routes |
| 13 | Input validation | Zod schemas on every route body via `validateBody` middleware. WebSocket payloads validated in handlers |
| 14 | SQL injection protection | Drizzle ORM parameterized queries throughout — no raw SQL in application code |
| 15 | WebSocket authentication | JWT verified on HTTP upgrade before WebSocket connection established. Inactive users rejected |
| 16 | Payload size limit | WebSocket messages capped at 64 KB — connections sending larger payloads are closed with code 1009 |
| 17 | Forgot-password timing safety | Always returns 200 with same message regardless of whether email exists |

## Contributing

### Architecture Rules

Before contributing, review the enforced layer rules:

1. **Routes** define HTTP method, path, middleware, and validation only — no logic
2. **Controllers** extract from `req`, call services, format responses — no DB access
3. **Services** contain all business logic, call query functions only — no `db` or `eq` imports
4. **Queries** (`packages/db/queries/`) are the only place Drizzle ORM calls live
5. **WebSocket handlers** receive parsed payloads, call services, broadcast results
6. **Frontend pages/components** never call axios directly — use TanStack Query hooks
7. **Zustand** stores only client-side ephemeral state (messages, typing, presence) — never server-fetched data
8. **Admin NextAuth** rejects non-admin roles in the JWT callback — never in middleware alone
9. **Type imports** use `types/src` for shared types, `db/src` for DB types

### Development Workflow

```bash
# Start everything in dev mode
pnpm dev

# Type-check a specific package
pnpm --filter server build        # runs tsc
pnpm --filter web build           # runs next build (includes type checking)

# Lint
pnpm lint

# Generate a DB migration after schema changes
pnpm --filter db db:generate

# Push schema directly (dev only)
pnpm --filter db db:push
```

### Commit Style

- `feat:` — new feature
- `fix:` — bug fix
- `refactor:` — code change that neither fixes nor adds
- `chore:` — deps, config, tooling
- `docs:` — documentation only

## License

MIT
