"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore";

const schema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
    confirmPassword: z.string().min(1),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordForm = z.infer<typeof schema>;

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const setUser = useAuthStore((s) => s.setUser);
  const form = useForm<PasswordForm>({ resolver: zodResolver(schema) });

  if (status === "loading") return <div className="min-h-screen animate-pulse bg-gray-100" />;

  return (
    <main className="mx-auto mt-10 max-w-2xl space-y-8 p-4">
      <motion.section initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-2 rounded border p-4">
        <h1 className="text-xl font-semibold">Profile</h1>
        <input
          defaultValue={session?.user?.name ?? ""}
          className="w-full rounded border p-2"
          onBlur={async (e) => {
            const name = e.target.value.trim();
            if (!name) return;
            const response = await api.put("/api/users/me", { name });
            setUser(response.data);
            await update({ user: { ...session?.user, name } });
            toast.success("Profile updated");
          }}
        />
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return toast.error("Invalid file type");
            if (file.size > 5 * 1024 * 1024) return toast.error("Max size is 5MB");
            const avatarUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result ?? ""));
              reader.onerror = () => reject(new Error("Failed to read file"));
              reader.readAsDataURL(file);
            });
            const response = await api.patch("/api/users/me/avatar", { avatarUrl });
            setUser({ ...(session!.user as any), avatarUrl: response.data.avatarUrl });
            await update({ user: { ...session?.user, avatarUrl: response.data.avatarUrl } });
            toast.success("Avatar updated");
          }}
        />
      </motion.section>

      <motion.section initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-2 rounded border p-4">
        <h2 className="font-semibold">Change Password</h2>
        <form
          className="space-y-2"
          onSubmit={form.handleSubmit(async (values) => {
            await api.patch("/api/users/me/password", values);
            toast.success("Password changed");
            form.reset();
          })}
        >
          <input type="password" placeholder="Current password" {...form.register("currentPassword")} className="w-full rounded border p-2" />
          <input type="password" placeholder="New password" {...form.register("newPassword")} className="w-full rounded border p-2" />
          <input type="password" placeholder="Confirm password" {...form.register("confirmPassword")} className="w-full rounded border p-2" />
          <button className="rounded bg-black px-3 py-2 text-white" type="submit">
            Update password
          </button>
        </form>
      </motion.section>
    </main>
  );
}
