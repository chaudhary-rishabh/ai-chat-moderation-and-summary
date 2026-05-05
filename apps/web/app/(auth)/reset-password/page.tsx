"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/lib/axios";

const inputClass =
  "w-full rounded-xl border border-blue-200 bg-white/60 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 backdrop-blur-sm transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200/50";

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
    <div>
      <p className="mb-6 text-center text-sm text-slate-500">Set a new password for your account</p>

      <form
        className="space-y-4"
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
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">New password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Confirm password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-linear-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-blue-200/50 transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-200/70 active:scale-[0.98]"
        >
          Reset password
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50/50 px-4 py-3 text-sm text-red-500">
          {error}{" "}
          <Link href="/forgot-password" className="font-medium text-red-600 hover:text-red-700 underline">
            Request another link
          </Link>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/login" className="font-medium text-blue-500 hover:text-blue-600 transition-colors">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
