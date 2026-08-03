import { Link } from "@/i18n/navigation";
import { ReceiptInput } from "@/components/receipt-input";

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
    <div className="shell content-page">
      <h1>{title}</h1>

      <div className="nudge is-alert" role="alert">
        <span className="ic" aria-hidden="true">
          !
        </span>
        <div>{body}</div>
      </div>

      {reasons && reasons.length > 0 ? (
        <section className="card">
          {reasonsTitle ? (
            <div className="card-h">
              <h3>{reasonsTitle}</h3>
            </div>
          ) : null}
          <div className="card-b">
            <ul className="case-error-reasons">
              {reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="card receipt-box">
        <div className="card-h">
          <h3>{retryLabel}</h3>
        </div>
        <div className="card-b">
          <ReceiptInput autoFocus />
        </div>
      </section>

      {trackWhenAvailableTitle && trackWhenAvailableBody ? (
        <div className="nudge">
          <span className="ic" aria-hidden="true">
            i
          </span>
          <div>
            <b>{trackWhenAvailableTitle}</b> {trackWhenAvailableBody}
          </div>
        </div>
      ) : null}

      <p className="content-actions content-links">
        <Link href="/">{homeLabel}</Link>
      </p>
    </div>
  );
}
