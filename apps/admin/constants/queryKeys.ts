export const adminQueryKeys = {
  users: {
    all: ["admin", "users"] as const,
    list: (filters: Record<string, unknown>) => ["admin", "users", "list", filters] as const,
    detail: (id: string) => ["admin", "users", id] as const,
  },
  rooms: {
    all: ["admin", "rooms"] as const,
    list: (filters: Record<string, unknown>) => ["admin", "rooms", "list", filters] as const,
    detail: (id: string) => ["admin", "rooms", id] as const,
  },
  safety: {
    all: ["admin", "safety"] as const,
    flags: (filters: Record<string, unknown>) => ["admin", "safety", "flags", filters] as const,
  },
  analytics: {
    all: ["admin", "analytics"] as const,
  },
  auditLog: {
    all: ["admin", "audit-log"] as const,
    list: (filters: Record<string, unknown>) => ["admin", "audit-log", "list", filters] as const,
  },
  stories: {
    all: ["admin", "stories"] as const,
    active: ["admin", "stories", "active"] as const,
  },
};
