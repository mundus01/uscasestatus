import { cn } from "@/lib/cn";
import type { TimelineStep } from "@/lib/uscis/types";

type TimelineProps = {
  title: string;
  steps: TimelineStep[];
  labels: Record<TimelineStep["id"], string>;
};

export function CaseTimeline({ title, steps, labels }: TimelineProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
      <ol className="mt-5 space-y-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <li key={step.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-1 size-2.5 shrink-0 rounded-full",
                    step.state === "complete" && "bg-brand-500",
                    step.state === "current" && "bg-brand-500 ring-4 ring-brand-50",
                    step.state === "upcoming" && "bg-line-strong",
                  )}
                />
                {!isLast ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "my-1 w-px flex-1",
                      step.state === "upcoming" ? "bg-line" : "bg-brand-50",
                    )}
                  />
                ) : null}
              </div>
              <div className={cn("pb-5", isLast && "pb-0")}>
                <p
                  className={cn(
                    "text-sm font-medium",
                    step.state === "upcoming" ? "text-ink-subtle" : "text-ink",
                    step.state === "current" && "text-brand-700",
                  )}
                >
                  {labels[step.id]}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
