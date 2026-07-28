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
  waitLabel: (seconds: number) => string;
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
  waitLabel,
  isStale,
  nextRefreshAvailableAt,
  locale,
}: FreshnessIndicatorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nextAt, setNextAt] = useState(nextRefreshAvailableAt);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState<string | null>(null);

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
    setError(null);

    try {
      const response = await fetch(`/api/case/${receipt}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });

      const payload = (await response.json()) as {
        data?: { freshness?: { nextRefreshAvailableAt?: string }; changed?: boolean };
        error?: { message?: string };
      };

      const headerNext = response.headers.get("X-Next-Refresh-At");
      const fromBody = payload.data?.freshness?.nextRefreshAvailableAt;
      if (headerNext || fromBody) {
        setNextAt(headerNext ?? fromBody ?? nextAt);
      } else if (response.status === 429) {
        setNextAt(new Date(Date.now() + 60_000).toISOString());
      }

      if (!response.ok && response.status !== 503) {
        setError(payload.error?.message ?? "Refresh failed");
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("Refresh failed");
    }
  }

  const label = isStale ? staleLabel : relativeLabel;

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm" aria-live="polite">
      <time
        dateTime={lastCheckedAt}
        className={isStale ? "text-status-pending" : "text-ink"}
      >
        {label}
      </time>
      <button
        type="button"
        onClick={onRefresh}
        disabled={onCooldown || isPending}
        className="rounded-md border-[0.5px] border-line px-2 py-1 text-xs font-medium text-brand-700 disabled:opacity-50"
        aria-label={checkAgainLabel}
      >
        {isPending
          ? checkingLabel
          : onCooldown
            ? waitLabel(remainingSec)
            : checkAgainLabel}
      </button>
      {error ? (
        <span className="text-xs text-status-alert" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
