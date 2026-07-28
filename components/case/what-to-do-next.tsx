import { Callout } from "@/components/ui/callout";
import {
  nextStepsBordered,
  nextStepsTone,
  type NextStepsContent,
} from "@/lib/next-steps";
import type { Severity } from "@/lib/taxonomy/types";
import { cn } from "@/lib/cn";

type WhatToDoNextProps = {
  title: string;
  content: NextStepsContent;
  severity: Severity;
  notLegalAdvice: string;
  citationFallbackLabel: string;
};

export function WhatToDoNext({
  title,
  content,
  severity,
  notLegalAdvice,
  citationFallbackLabel,
}: WhatToDoNextProps) {
  const tone = nextStepsTone(severity);
  const bordered = nextStepsBordered(severity);

  return (
    <Callout
      tone={tone}
      title={title}
      className={cn(bordered && "border-[0.5px] border-status-pending")}
    >
      <ol className="list-decimal space-y-1.5 pl-4">
        {content.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
      {content.citationHref ? (
        <p className="mt-3">
          <a
            href={content.citationHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline"
          >
            {content.citationLabel ?? citationFallbackLabel}
          </a>
        </p>
      ) : null}
      <p className="mt-2 text-xs opacity-80">{notLegalAdvice}</p>
    </Callout>
  );
}
