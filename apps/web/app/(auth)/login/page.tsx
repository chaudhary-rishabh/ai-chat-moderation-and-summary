"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LoginSchema, type LoginInput } from "@repo/types/auth";

const inputClass =
  "w-full rounded-xl border border-blue-200 bg-white/60 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 backdrop-blur-sm transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200/50";

export default function LoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const { status } = useSession();
  const form = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) });

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-500" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <p className="mb-6 text-center text-sm text-slate-500">Sign in to your account</p>

      <form
        onSubmit={form.handleSubmit(async (values) => {
          const result = (await signIn("credentials", { ...values, redirect: false })) as
            | { error?: string }
            | undefined;
          if (result?.error) return toast.error(result.error);
          router.push("/chat");
        })}
        className="space-y-4"
      >
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Email</label>
          <input placeholder="you@example.com" {...form.register("email")} className={inputClass} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Password</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              placeholder="••••••••"
              {...form.register("password")}
              className={inputClass + " pr-12"}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-linear-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-blue-200/50 transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-200/70 active:scale-[0.98]"
        >
          Sign in
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link href="/register" className="font-medium text-blue-500 hover:text-blue-600 transition-colors">
          Create account
        </Link>
        <Link href="/forgot-password" className="text-slate-400 hover:text-slate-600 transition-colors">
          Forgot password?
        </Link>
      </div>
    </motion.div>
  );
}
