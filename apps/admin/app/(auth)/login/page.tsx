"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Shield } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const urlError =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("error") : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = (await signIn("credentials", { email, password, redirect: false })) as
      | { error?: string }
      | undefined;
    if (result?.error) {
      setError(
        result.error === "INSUFFICIENT_ROLE"
          ? "This account does not have admin access"
          : "Invalid credentials",
      );
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  const displayError = error || (urlError === "unauthorized" ? "This account does not have admin access" : null);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-glass mb-4">
            <Shield className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-xl font-bold text-ink">Admin Login</h1>
          <p className="text-sm text-ink-soft mt-1">Restricted to admins and superadmins</p>
        </div>

        <div className="glass-panel p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-soft mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-glass border border-glass-border rounded-xl px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-accent/50 transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-soft mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-glass border border-glass-border rounded-xl px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-accent/50 transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-white rounded-xl py-2.5 text-sm font-medium transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {displayError && (
            <p className="mt-4 text-sm text-danger text-center bg-danger/10 rounded-xl py-2 px-3">
              {displayError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
