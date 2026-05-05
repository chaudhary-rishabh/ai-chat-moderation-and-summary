"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import api from "@/lib/axios";
import { RegisterSchema } from "@repo/types/auth";

const schema = RegisterSchema.extend({
  confirmPassword: z.string(),
}).refine((v: { password: string; confirmPassword: string }) => v.password === v.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

const inputClass =
  "w-full rounded-xl border border-blue-200 bg-white/60 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 backdrop-blur-sm transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200/50";

export default function RegisterPage() {
  const router = useRouter();
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <div>
      <p className="mb-6 text-center text-sm text-slate-500">Create a new account</p>

      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async ({ confirmPassword, ...values }) => {
          try {
            await api.post("/api/auth/register", values);
            await signIn("credentials", { ...values, redirect: false });
            router.push("/chat");
          } catch (error: any) {
            if (error?.response?.status === 409) {
              form.setError("email", { message: "Email already in use" });
            }
          }
        })}
      >
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Name</label>
          <input {...form.register("name")} placeholder="Your name" className={inputClass} />
          {form.formState.errors.name && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Email</label>
          <input {...form.register("email")} placeholder="you@example.com" className={inputClass} />
          {form.formState.errors.email && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Password</label>
          <input
            type="password"
            {...form.register("password")}
            placeholder="••••••••"
            className={inputClass}
          />
          {form.formState.errors.password && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Confirm password</label>
          <input
            type="password"
            {...form.register("confirmPassword")}
            placeholder="••••••••"
            className={inputClass}
          />
          {form.formState.errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-linear-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-blue-200/50 transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-200/70 active:scale-[0.98]"
        >
          Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-blue-500 hover:text-blue-600 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
