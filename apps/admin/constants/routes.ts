export const adminRoutes = {
  dashboard: "/dashboard",
  users: "/users",
  userDetail: (id: string) => `/users/${id}`,
  rooms: "/rooms",
  roomDetail: (id: string) => `/rooms/${id}`,
  stories: "/stories",
  safety: "/safety",
  analytics: "/analytics",
  login: "/login",
} as const;
