"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import api from "@/lib/axios";
import { RegisterSchema } from "types/src";

const schema = RegisterSchema.extend({
  confirmPassword: z.string(),
}).refine((v) => v.password === v.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  return (
    <main className="mx-auto mt-20 max-w-md">
      <form
        className="space-y-3"
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
        <input {...form.register("name")} placeholder="Name" className="w-full rounded border p-2" />
        <input {...form.register("email")} placeholder="Email" className="w-full rounded border p-2" />
        <input type="password" {...form.register("password")} placeholder="Password" className="w-full rounded border p-2" />
        <input
          type="password"
          {...form.register("confirmPassword")}
          placeholder="Confirm password"
          className="w-full rounded border p-2"
        />
        <button type="submit" className="w-full rounded bg-black p-2 text-white">
          Register
        </button>
      </form>
    </main>
  );
}
