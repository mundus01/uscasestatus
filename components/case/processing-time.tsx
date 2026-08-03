import { ProcessingTimeSource } from "@/components/case/processing-time-source";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { ProcessingTimeContext } from "@/lib/processing-times";

function markerLeftClass(ratio: number): string {
  const pct = Math.min(100, Math.max(0, Math.round(ratio * 100)));
  const step = Math.round(pct / 5);
  const positions = [
    "left-0",
    "left-[5%]",
    "left-[10%]",
    "left-[15%]",
    "left-[20%]",
    "left-[25%]",
    "left-[30%]",
    "left-[35%]",
    "left-[40%]",
    "left-[45%]",
    "left-[50%]",
    "left-[55%]",
    "left-[60%]",
    "left-[65%]",
    "left-[70%]",
    "left-[75%]",
    "left-[80%]",
    "left-[85%]",
    "left-[90%]",
    "left-[95%]",
    "left-[100%]",
  ] as const;
  return positions[Math.min(step, positions.length - 1)];
}

type ProcessingTimeProps = {
  title: string;
  context: ProcessingTimeContext;
  rangeLabel: string;
  positionLabel: string;
  decidedLabel: string | null;
  inquiryTitle: string | null;
  inquiryBody: string | null;
  inquiryLinkLabel: string | null;
  inquiryHref: string | null;
  sourceFooter: string;
  disclaimer: string;
  insufficientLabel: string | null;
};

export function ProcessingTimeCard({
  title,
  context,
  rangeLabel,
  positionLabel,
  decidedLabel,
  inquiryTitle,
  inquiryBody,
  inquiryLinkLabel,
  inquiryHref,
  sourceFooter,
  disclaimer,
  insufficientLabel,
}: ProcessingTimeProps) {
  const { lowMonths, highMonths, elapsed, position, isTerminal } = context;
  const months = elapsed.months;
  const scaleMax = Math.max(highMonths * 1.25, (months ?? highMonths) * 1.05, 1);
  const lowRatio = lowMonths / scaleMax;
  const highRatio = highMonths / scaleMax;
  const markerRatio =
    months == null ? null : Math.min(1, Math.max(0, months / scaleMax));

  const bandWidthClass = (() => {
    const widthPct = Math.max(0, Math.round((highRatio - lowRatio) * 100));
    if (widthPct >= 50) return "w-1/2";
    if (widthPct >= 40) return "w-2/5";
    if (widthPct >= 33) return "w-1/3";
    if (widthPct >= 25) return "w-1/4";
    if (widthPct >= 20) return "w-1/5";
    return "w-[15%]";
  })();

  const ariaLabel = isTerminal
    ? (decidedLabel ?? positionLabel)
    : `${positionLabel}. Published range ${lowMonths} to ${highMonths} months. Elapsed ${months ?? "unknown"} months.`;

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-ink">{title}</h2>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="text-sm leading-relaxed text-ink-muted">{rangeLabel}</p>

        {months != null ? (
          <div>
            <p className="mb-2 text-sm font-medium text-ink">
              {isTerminal && decidedLabel ? decidedLabel : positionLabel}
            </p>

            {!isTerminal ? (
              <div
                className="relative h-3 rounded-full bg-line"
                role="img"
                aria-label={ariaLabel}
              >
                {/* Published range band */}
                <div
                  className={cn(
                    "absolute top-0 h-full rounded-full bg-brand-50",
                    markerLeftClass(lowRatio),
                    bandWidthClass,
                  )}
                />
                {/* Case marker */}
                {markerRatio != null ? (
                  <div
                    className={cn(
                      "absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white",
                      position === "over"
                        ? "bg-status-pending"
                        : "bg-brand-500",
                      markerLeftClass(markerRatio),
                    )}
                  />
                ) : null}
              </div>
            ) : (
              <div
                className="relative h-3 rounded-full bg-brand-50"
                role="img"
                aria-label={ariaLabel}
              >
                <div className="absolute top-1/2 left-full size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-status-approved" />
              </div>
            )}

            <div className="mt-2 flex justify-between text-xs text-ink-subtle">
              <span>0</span>
              <span>
                {lowMonths}–{highMonths} mo
              </span>
              <span>{Math.round(scaleMax)} mo</span>
            </div>

            <p className="mt-2 text-sm text-ink">
              {months} months
              {elapsed.isEstimated ? " (approximate)" : ""}
            </p>
          </div>
        ) : (
          <p className="text-sm text-ink-muted">
            {insufficientLabel ??
              "Filing date unknown — we can’t place this case on the published range yet."}
          </p>
        )}

        {!isTerminal && position === "over" && inquiryTitle && inquiryBody ? (
          <div className="rounded-md border-[0.5px] border-status-pending bg-status-pending-fill p-3">
            <p className="text-sm font-semibold text-status-pending">
              {inquiryTitle}
            </p>
            <p className="mt-1 text-sm text-ink">{inquiryBody}</p>
            {inquiryHref && inquiryLinkLabel ? (
              <a
                href={inquiryHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-medium text-brand-700 underline"
              >
                {inquiryLinkLabel}
              </a>
            ) : null}
          </div>
        ) : null}

        <ProcessingTimeSource
          label={sourceFooter}
          className="text-xs text-ink-subtle"
        />
        <p className="text-xs leading-relaxed text-ink-subtle">{disclaimer}</p>
      </CardBody>
    </Card>
  );
}
