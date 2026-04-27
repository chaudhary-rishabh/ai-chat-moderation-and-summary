import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session as any).error === "INSUFFICIENT_ROLE") {
    redirect("/login?error=unauthorized");
  }
  return <>{children}</>;
}
