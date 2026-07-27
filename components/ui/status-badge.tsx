import { cn } from "@/lib/cn";
import type { StatusTone } from "@/lib/status";

type StatusBadgeProps = {
  tone: StatusTone;
  children: string;
  size?: "sm" | "lg";
  className?: string;
};

const TONE_STYLES: Record<StatusTone, string> = {
  pending: "bg-status-pending-fill text-status-pending",
  approved: "bg-status-approved-fill text-status-approved",
  alert: "bg-status-alert-fill text-status-alert",
  neutral: "bg-status-neutral-fill text-status-neutral",
};

const DOT_STYLES: Record<StatusTone, string> = {
  pending: "bg-status-pending",
  approved: "bg-status-approved",
  alert: "bg-status-alert",
  neutral: "bg-status-neutral",
};

export function StatusBadge({
  tone,
  children,
  size = "sm",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-md font-medium",
        size === "lg" ? "px-3 py-1.5 text-base" : "px-2.5 py-1 text-sm",
        TONE_STYLES[tone],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", DOT_STYLES[tone])}
      />
      {children}
    </span>
  );
}
