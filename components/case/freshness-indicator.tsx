"use client";

import { useRouter } from "@/i18n/navigation";
import { useEffect, useState, useTransition } from "react";

type FreshnessIndicatorProps = {
  receipt: string;
  lastCheckedAt: string;
  relativeLabel: string;
  staleLabel: string;
  checkAgainLabel: string;
  checkingLabel: string;
  waitLabelTemplate: string;
  isStale: boolean;
  nextRefreshAvailableAt: string;
  locale: string;
};

export function FreshnessIndicator({
  receipt,
  lastCheckedAt,
  relativeLabel,
  staleLabel,
  checkAgainLabel,
  checkingLabel,
  waitLabelTemplate,
  isStale,
  nextRefreshAvailableAt,
  locale,
}: FreshnessIndicatorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nextAt, setNextAt] = useState(nextRefreshAvailableAt);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNextAt(nextRefreshAvailableAt);
  }, [nextRefreshAvailableAt]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const remainingMs = Math.max(0, new Date(nextAt).getTime() - now);
  const remainingSec = Math.ceil(remainingMs / 1000);
  const onCooldown = remainingMs > 0;

  async function onRefresh() {
    if (onCooldown || isPending) return;
    try {
      const response = await fetch(`/api/case/${receipt}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const headerNext = response.headers.get("X-Next-Refresh-At");
      if (headerNext) setNextAt(headerNext);
      else if (response.status === 429) {
        setNextAt(new Date(Date.now() + 60_000).toISOString());
      }
      if (response.ok || response.status === 503) {
        startTransition(() => router.refresh());
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={onCooldown || isPending}
      title={isStale ? staleLabel : relativeLabel}
      style={{
        background: "none",
        border: 0,
        padding: 0,
        color: "var(--blue-medium)",
        font: "inherit",
        cursor: onCooldown || isPending ? "default" : "pointer",
        textDecoration: "underline",
      }}
    >
      {isPending
        ? checkingLabel
        : onCooldown
          ? waitLabelTemplate.replace("{seconds}", String(remainingSec))
          : checkAgainLabel}
    </button>
  );
}
