import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if ((session as any)?.error === "RefreshTokenExpired") redirect("/login?error=session_expired");
  return <>{children}</>;
}
