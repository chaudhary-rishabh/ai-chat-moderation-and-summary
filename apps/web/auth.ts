import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

type LoginResponse = {
  user: { id: string; name: string; email: string; role: string; avatarUrl: string | null };
  accessToken: string;
  refreshToken: string;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const response = await fetch(`${process.env.SERVER_URL}/api/auth/login`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(credentials),
        });
        if (!response.ok) return null;
        const data = (await response.json()) as LoginResponse;
        return {
          ...data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          accessTokenExpiry: Date.now() + 14 * 60 * 1000,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return { ...token, ...user };
      }
      if (Date.now() < ((token.accessTokenExpiry as number) ?? 0) - 60_000) return token;
      try {
        const response = await fetch(`${process.env.SERVER_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ refreshToken: token.refreshToken }),
        });
        if (!response.ok) throw new Error();
        const refreshed = (await response.json()) as { accessToken: string; refreshToken: string };
        token.accessToken = refreshed.accessToken;
        token.refreshToken = refreshed.refreshToken;
        token.accessTokenExpiry = Date.now() + 14 * 60 * 1000;
        delete token.error;
        return token;
      } catch {
        token.error = "RefreshTokenExpired";
        return token;
      }
    },
    async session({ session, token }) {
      session.user = {
        id: String(token.id),
        name: String(token.name),
        email: String(token.email),
        role: String(token.role),
        avatarUrl: (token.avatarUrl as string | null) ?? null,
      } as typeof session.user;
      (session as any).accessToken = token.accessToken;
      (session as any).error = token.error;
      return session;
    },
  },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60,
      },
    },
  },
});
