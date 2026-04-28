import { cn } from "@/utils/cn";

export function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-glass rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct > 80 ? "bg-danger" : pct > 50 ? "bg-warning" : "bg-success",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-ink-faint w-8 text-right">{pct}%</span>
    </div>
  );
}
