"use client";

import { useState } from "react";
import api from "@/lib/axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="mx-auto mt-20 max-w-md">
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await api.post("/api/auth/forgot-password", { email });
          } finally {
            setSubmitted(true);
          }
        }}
      >
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          className="w-full rounded border p-2"
        />
        <button type="submit" className="w-full rounded bg-black p-2 text-white">
          Send reset link
        </button>
      </form>
      {submitted ? <p className="mt-3 text-sm">If that email exists, we sent a reset link.</p> : null}
    </main>
  );
}
