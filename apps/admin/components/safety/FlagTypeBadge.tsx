import { cn } from "@/utils/cn";

const typeStyles: Record<string, string> = {
  abuse: "bg-danger/20 text-danger border-danger/30",
  bullying: "bg-warning/20 text-warning border-warning/30",
  harassment: "bg-danger/20 text-danger border-danger/30",
  hate_speech: "bg-danger/20 text-danger border-danger/30",
  spam: "bg-ink-faint/20 text-ink-faint border-ink-faint/30",
  self_harm: "bg-warning/20 text-warning border-warning/30",
  other: "bg-glass text-ink-soft border-glass-border",
};

export function FlagTypeBadge({ type }: { type: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border",
        typeStyles[type] ?? typeStyles.other,
      )}
    >
      {type.replace(/_/g, " ")}
    </span>
  );
}
