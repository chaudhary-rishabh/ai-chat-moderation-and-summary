import { cn } from "@/utils/cn";

const roleStyles: Record<string, string> = {
  user: "bg-glass text-ink-soft border-glass-border",
  moderator: "bg-accent/20 text-accent border-accent/30",
  admin: "bg-warning/20 text-warning border-warning/30",
  superadmin: "bg-danger/20 text-danger border-danger/30",
};

export function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border",
        roleStyles[role] ?? roleStyles.user,
      )}
    >
      {role}
    </span>
  );
}
