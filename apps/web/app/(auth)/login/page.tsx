"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LoginSchema, type LoginInput } from "types/src";

export default function LoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const { status } = useSession();
  const form = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) });

  if (status === "loading") return <div className="min-h-screen animate-pulse bg-gray-100" />;

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto mt-20 max-w-md">
      <form
        onSubmit={form.handleSubmit(async (values) => {
          const result = await signIn("credentials", { ...values, redirect: false });
          if (result?.error) return toast.error(result.error);
          router.push("/chat");
        })}
        className="space-y-4"
      >
        <input placeholder="Email" {...form.register("email")} className="w-full rounded border p-2" />
        <div className="flex gap-2">
          <input
            type={show ? "text" : "password"}
            placeholder="Password"
            {...form.register("password")}
            className="w-full rounded border p-2"
          />
          <button type="button" onClick={() => setShow((v) => !v)} className="rounded border px-3">
            {show ? "Hide" : "Show"}
          </button>
        </div>
        <button className="w-full rounded bg-black p-2 text-white" type="submit">
          Login
        </button>
      </form>
      <div className="mt-4 flex gap-4 text-sm">
        <Link href="/register">Create account</Link>
        <Link href="/forgot-password">Forgot password</Link>
      </div>
    </motion.main>
  );
}
