import { cn } from "@/lib/cn";

type SkeletonProps = {
  className?: string;
  /** Announced to screen readers while content loads. */
  label?: string;
};

export function Skeleton({ className, label }: SkeletonProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn("block animate-pulse rounded-md bg-line", className)}
    >
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}
