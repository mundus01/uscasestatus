"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";
import type { CaseTimelineModel, CaseTimelineNode } from "@/lib/timeline";
import type { TimelineStepId } from "@/lib/uscis/types";

type TimelineProps = {
  title: string;
  model: CaseTimelineModel;
  stageLabels: Record<TimelineStepId, string>;
  codeLabels: Record<string, string>;
  reportedByUscis: string;
  detectedByUs: string;
  /** Template with `{date}` placeholder. */
  singleEventNoteTemplate: string;
  /** Template with `{count}` placeholder. */
  showAllLabelTemplate: string;
  showFewerLabel: string;
  locale: string;
};

export function CaseTimeline({
  title,
  model,
  stageLabels,
  codeLabels,
  reportedByUscis,
  detectedByUs,
  singleEventNoteTemplate,
  showAllLabelTemplate,
  showFewerLabel,
  locale,
}: TimelineProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = pickVisibleNodes(model.nodes, model.totalActualEvents, expanded);

  return (
    <section>
      <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>

      {model.singleEventNote && model.trackingStartedAt ? (
        <p className="mt-2 text-sm text-ink-muted">
          {singleEventNoteTemplate.replace(
            "{date}",
            new Date(model.trackingStartedAt).toLocaleDateString(locale, {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
          )}
        </p>
      ) : null}

      <ol className="mt-5 space-y-0">
        {visible.map((node, index) => {
          const isLast = index === visible.length - 1;
          const label = resolveLabel(node, stageLabels, codeLabels);
          return (
            <li key={node.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-1 size-2.5 shrink-0 rounded-full",
                    node.kind === "completed" && "bg-brand-500",
                    node.kind === "current" &&
                      "bg-brand-500 ring-4 ring-brand-50",
                    node.kind === "expected" &&
                      "border-[1.5px] border-line-strong bg-transparent",
                  )}
                />
                {!isLast ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "my-1 w-px flex-1",
                      node.kind === "expected" ? "bg-line" : "bg-brand-50",
                    )}
                  />
                ) : null}
              </div>
              <div
                className={cn("pb-5", isLast && "pb-0")}
                {...(node.kind === "current"
                  ? { "aria-current": "step" as const }
                  : {})}
              >
                <p
                  className={cn(
                    "text-sm font-medium",
                    node.kind === "expected" ? "text-ink-subtle" : "text-ink",
                    node.kind === "current" && "text-brand-700",
                  )}
                >
                  {label}
                </p>
                {node.dateIso ? (
                  <p className="mt-0.5 text-xs text-ink-muted">
                    <time dateTime={node.dateIso}>
                      {new Date(node.dateIso).toLocaleDateString(locale, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        timeZone: "UTC",
                      })}
                    </time>
                    {" · "}
                    {node.dateSource === "observed"
                      ? detectedByUs
                      : reportedByUscis}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {model.totalActualEvents > 5 ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 text-sm font-medium text-brand-700"
        >
          {expanded
            ? showFewerLabel
            : showAllLabelTemplate.replace(
                "{count}",
                String(model.totalActualEvents),
              )}
        </button>
      ) : null}
    </section>
  );
}

function pickVisibleNodes(
  nodes: CaseTimelineNode[],
  totalActualEvents: number,
  expanded: boolean,
): CaseTimelineNode[] {
  if (expanded || totalActualEvents <= 5) return nodes;
  const actual = nodes.filter((node) => node.kind !== "expected");
  const expected = nodes.filter((node) => node.kind === "expected");
  return [...actual.slice(-5), ...expected];
}

function resolveLabel(
  node: CaseTimelineNode,
  stageLabels: Record<TimelineStepId, string>,
  codeLabels: Record<string, string>,
): string {
  if (node.kind === "expected" && node.stageId) {
    return stageLabels[node.stageId] ?? codeLabels[node.label] ?? node.label;
  }
  if (codeLabels[node.label]) {
    return codeLabels[node.label];
  }
  if (node.stageId && stageLabels[node.stageId] && !node.label.includes(" ")) {
    return stageLabels[node.stageId];
  }
  return node.label;
}
