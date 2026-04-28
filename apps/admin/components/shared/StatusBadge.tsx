import { cn } from "@/utils/cn";

const variants: Record<string, string> = {
  active: "bg-success/20 text-success border-success/30",
  deactivated: "bg-ink-faint/20 text-ink-faint border-ink-faint/30",
  online: "bg-success/20 text-success border-success/30",
  offline: "bg-ink-faint/20 text-ink-faint border-ink-faint/30",
  pending: "bg-warning/20 text-warning border-warning/30",
  reviewed_safe: "bg-success/20 text-success border-success/30",
  reviewed_removed: "bg-danger/20 text-danger border-danger/30",
  auto_blocked: "bg-danger/20 text-danger border-danger/30",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border",
        variants[status] ?? "bg-glass text-ink-soft border-glass-border",
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
