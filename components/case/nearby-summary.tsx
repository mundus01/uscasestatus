import type { NearbySummary } from "@/lib/neighbors";

type NearbySummaryCardProps = {
  title: string;
  summary: NearbySummary;
  body: string;
  approvedLabel: string;
  pendingLabel: string;
  alertLabel: string;
};

function widthClass(pct: number): string {
  if (pct <= 0) return "w-0";
  if (pct >= 100) return "w-full";
  if (pct >= 90) return "w-[90%]";
  if (pct >= 80) return "w-4/5";
  if (pct >= 75) return "w-3/4";
  if (pct >= 66) return "w-2/3";
  if (pct >= 60) return "w-3/5";
  if (pct >= 50) return "w-1/2";
  if (pct >= 40) return "w-2/5";
  if (pct >= 33) return "w-1/3";
  if (pct >= 25) return "w-1/4";
  if (pct >= 20) return "w-1/5";
  if (pct >= 10) return "w-[10%]";
  return "w-[5%]";
}

export function NearbySummaryCard({
  title,
  summary,
  body,
  approvedLabel,
  pendingLabel,
  alertLabel,
}: NearbySummaryCardProps) {
  const total = Math.max(summary.sampleSize, 1);
  const approvedPct = Math.round((summary.approved / total) * 100);
  const pendingPct = Math.round((summary.pending / total) * 100);
  const alertPct = Math.round((summary.alert / total) * 100);

  return (
    <section className="rounded-lg border-[0.5px] border-line bg-surface p-5 md:p-6">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm text-ink">{body}</p>

      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-line">
        <div
          className={`h-full bg-status-approved ${widthClass(approvedPct)}`}
          title={approvedLabel}
        />
        <div
          className={`h-full bg-status-pending ${widthClass(pendingPct)}`}
          title={pendingLabel}
        />
        <div
          className={`h-full bg-status-alert ${widthClass(alertPct)}`}
          title={alertLabel}
        />
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-3 text-center text-xs text-ink-muted">
        <div>
          <dt>{approvedLabel}</dt>
          <dd className="mt-1 text-base font-semibold text-status-approved">
            {summary.approved}
          </dd>
        </div>
        <div>
          <dt>{pendingLabel}</dt>
          <dd className="mt-1 text-base font-semibold text-status-pending">
            {summary.pending}
          </dd>
        </div>
        <div>
          <dt>{alertLabel}</dt>
          <dd className="mt-1 text-base font-semibold text-status-alert">
            {summary.alert}
          </dd>
        </div>
      </dl>
    </section>
  );
}
