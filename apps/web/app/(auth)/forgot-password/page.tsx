"use client";

import Link from "next/link";
import { useState } from "react";
import api from "@/lib/axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div>
      <p className="mb-6 text-center text-sm text-slate-500">Enter your email to receive a reset link</p>

      {submitted ? (
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-700">Check your email</p>
          <p className="mt-1 text-xs text-slate-500">If that email exists, we sent a reset link.</p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await api.post("/api/auth/forgot-password", { email });
            } finally {
              setSubmitted(true);
            }
          }}
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-blue-200 bg-white/60 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 backdrop-blur-sm transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200/50"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-linear-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-blue-200/50 transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-200/70 active:scale-[0.98]"
          >
            Send reset link
          </button>

          <p className="text-center text-sm text-slate-500">
            <Link href="/login" className="font-medium text-blue-500 hover:text-blue-600 transition-colors">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
