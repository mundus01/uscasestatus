import { Callout } from "@/components/ui/callout";
import { Link } from "@/i18n/navigation";
import { ReceiptInput } from "@/components/receipt-input";
import { Card, CardBody } from "@/components/ui/card";

type CaseErrorProps = {
  title: string;
  body: string;
  retryLabel: string;
  homeLabel: string;
  reasons?: string[];
  reasonsTitle?: string;
  trackWhenAvailableTitle?: string;
  trackWhenAvailableBody?: string;
};

export function CaseError({
  title,
  body,
  retryLabel,
  homeLabel,
  reasons,
  reasonsTitle,
  trackWhenAvailableTitle,
  trackWhenAvailableBody,
}: CaseErrorProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 md:px-6 md:py-14">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
          {title}
        </h1>
        <Callout tone="alert" className="mt-4">
          {body}
        </Callout>
      </div>

      {reasons && reasons.length > 0 ? (
        <div>
          {reasonsTitle ? (
            <h2 className="text-sm font-semibold text-ink">{reasonsTitle}</h2>
          ) : null}
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-muted">
            {reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <Card>
        <CardBody>
          <p className="mb-3 text-sm font-medium text-ink-muted">{retryLabel}</p>
          <ReceiptInput />
        </CardBody>
      </Card>

      {trackWhenAvailableTitle && trackWhenAvailableBody ? (
        <Callout tone="brand" title={trackWhenAvailableTitle}>
          {trackWhenAvailableBody}
        </Callout>
      ) : null}

      <Link
        href="/"
        className="inline-flex text-sm font-medium text-brand-700 hover:text-brand-500"
      >
        {homeLabel}
      </Link>
    </div>
  );
}
