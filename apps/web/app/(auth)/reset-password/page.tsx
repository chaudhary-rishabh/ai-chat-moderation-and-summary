"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/lib/axios";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const token =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("token") ?? "" : "";
  const email =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("email") ?? "" : "";

  return (
    <main className="mx-auto mt-20 max-w-md">
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (newPassword !== confirmPassword) return setError("Passwords do not match");
          try {
            await api.post("/api/auth/reset-password", { token, email, newPassword });
            router.push("/login");
          } catch {
            setError("This reset link is invalid or expired");
          }
        }}
      >
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded border p-2"
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded border p-2"
        />
        <button type="submit" className="w-full rounded bg-black p-2 text-white">
          Reset password
        </button>
      </form>
      {error ? (
        <p className="mt-4 text-sm text-red-600">
          {error} <Link href="/forgot-password">Request another link</Link>
        </p>
      ) : null}
    </main>
  );
}
