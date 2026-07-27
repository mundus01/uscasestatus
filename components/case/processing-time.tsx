import { Card, CardBody, CardHeader } from "@/components/ui/card";
import type { ProcessingTimeContext } from "@/lib/processing-times";

function progressWidthClass(progress: number): string {
  const step = Math.min(20, Math.max(0, Math.round(progress / 5)));
  const widths = [
    "w-0",
    "w-[5%]",
    "w-[10%]",
    "w-[15%]",
    "w-[20%]",
    "w-[25%]",
    "w-[30%]",
    "w-[35%]",
    "w-[40%]",
    "w-[45%]",
    "w-[50%]",
    "w-[55%]",
    "w-[60%]",
    "w-[65%]",
    "w-[70%]",
    "w-[75%]",
    "w-[80%]",
    "w-[85%]",
    "w-[90%]",
    "w-[95%]",
    "w-full",
  ] as const;
  return widths[step];
}

type ProcessingTimeProps = {
  title: string;
  context: ProcessingTimeContext;
  rangeLabel: string;
  progressLabel: string | null;
  disclaimer: string;
};

export function ProcessingTimeCard({
  title,
  context,
  rangeLabel,
  progressLabel,
  disclaimer,
}: ProcessingTimeProps) {
  const progress =
    context.monthsSinceFiled == null
      ? null
      : Math.min(
          100,
          Math.round(
            (context.monthsSinceFiled / Math.max(context.highMonths, 0.1)) *
              100,
          ),
        );

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-ink">{title}</h2>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="text-sm leading-relaxed text-ink-muted">{rangeLabel}</p>

        {progress != null ? (
          <div>
            {progressLabel ? (
              <p className="mb-2 text-sm font-medium text-ink">{progressLabel}</p>
            ) : null}
            <div
              className="h-2 overflow-hidden rounded-full bg-line"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {/* 20 discrete steps so we stay on Tailwind utilities (no inline styles). */}
              <div
                className={`h-full rounded-full bg-brand-500 ${progressWidthClass(progress)}`}
              />
            </div>
          </div>
        ) : null}

        <p className="text-xs leading-relaxed text-ink-subtle">{disclaimer}</p>
      </CardBody>
    </Card>
  );
}
