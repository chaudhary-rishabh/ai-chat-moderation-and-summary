"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const urlError =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("error") : null;

  return (
    <main className="mx-auto mt-20 max-w-md rounded border p-6">
      <h1 className="text-2xl font-semibold">Admin Login</h1>
      <p className="mb-4 text-sm text-gray-600">Admin access only</p>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const result = await signIn("credentials", { email, password, redirect: false });
          if (result?.error) {
            setError(
              result.error === "INSUFFICIENT_ROLE"
                ? "This account does not have admin access"
                : "Invalid credentials",
            );
          } else {
            window.location.href = "/dashboard";
          }
        }}
      >
        <input className="w-full rounded border p-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input
          className="w-full rounded border p-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button className="w-full rounded bg-black p-2 text-white" type="submit">
          Sign in
        </button>
      </form>
      {urlError === "unauthorized" || error ? (
        <p className="mt-3 text-sm text-red-600">{error || "This account does not have admin access"}</p>
      ) : null}
    </main>
  );
}
