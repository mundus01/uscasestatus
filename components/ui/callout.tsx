import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import type { StatusTone } from "@/lib/status";

type CalloutProps = {
  children: ReactNode;
  tone?: StatusTone | "brand";
  title?: string;
  className?: string;
  /** Set for messages the user must hear immediately, such as form errors. */
  assertive?: boolean;
};

const TONE_STYLES: Record<NonNullable<CalloutProps["tone"]>, string> = {
  brand: "bg-brand-50 text-brand-700",
  pending: "bg-status-pending-fill text-status-pending",
  approved: "bg-status-approved-fill text-status-approved",
  alert: "bg-status-alert-fill text-status-alert",
  neutral: "bg-status-neutral-fill text-status-neutral",
};

export function Callout({
  children,
  tone = "brand",
  title,
  className,
  assertive = false,
}: CalloutProps) {
  return (
    <div
      role={assertive ? "alert" : undefined}
      className={cn(
        "rounded-md px-4 py-3 text-sm leading-relaxed",
        TONE_STYLES[tone],
        className,
      )}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={title ? "mt-1" : undefined}>{children}</div>
    </div>
  );
}
