import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardBody } from "@/components/ui/card";
import { formatReceipt } from "@/lib/receipt";
import type { StatusTone } from "@/lib/status";

type StatusCardProps = {
  receipt: string;
  statusText: string;
  formType: string | null;
  formLabel: string | null;
  tone: StatusTone;
  toneLabel: string;
  checkedLabel: string;
  sourceLabel: string | null;
  officeLabel: string;
  office: string;
};

export function StatusCard({
  receipt,
  statusText,
  formType,
  formLabel,
  tone,
  toneLabel,
  checkedLabel,
  sourceLabel,
  officeLabel,
  office,
}: StatusCardProps) {
  return (
    <Card>
      <CardBody className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge tone={tone} size="lg">
            {toneLabel}
          </StatusBadge>
          {formType ? (
            <span className="tabular text-sm font-semibold text-brand-700">
              {formType}
              {formLabel ? (
                <span className="font-normal text-ink-muted"> · {formLabel}</span>
              ) : null}
            </span>
          ) : null}
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
            {statusText}
          </h1>
          <p className="tabular mt-2 text-sm text-ink-muted">
            {formatReceipt(receipt)}
          </p>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink-subtle">{officeLabel}</dt>
            <dd className="mt-0.5 font-medium text-ink">{office}</dd>
          </div>
          <div>
            <dt className="text-ink-subtle">{checkedLabel}</dt>
            <dd className="mt-0.5 font-medium text-ink">
              {sourceLabel ?? "—"}
            </dd>
          </div>
        </dl>
      </CardBody>
    </Card>
  );
}
