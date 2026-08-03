import { ClaimButton } from "@/components/case/claim-button";
import type { ProcessingTimeContext } from "@/lib/processing-times";

type EstimateCardProps = {
  processing: ProcessingTimeContext | null;
  /** Pending cases ahead from corpus; null when sample is below privacy floor. */
  pendingAhead: number | null;
  /** Weekly decision pace band from corpus; null until real pace exists. */
  pacePerWeek: { low: number; high: number } | null;
  title: string;
  publishedOnlyBody: string;
  noPaceBody: string;
};

export function EstimateCard({
  processing,
  pendingAhead,
  pacePerWeek,
  title,
  publishedOnlyBody,
  noPaceBody,
}: EstimateCardProps) {
  const months = processing?.elapsed.months;
  const low = processing?.lowMonths ?? null;
  const high = processing?.highMonths ?? null;
  const hasPublishedRange = low != null && high != null;
  const scaleMax = hasPublishedRange ? Math.max(high * 1.4, 18) : 18;
  const fillLeft = hasPublishedRange ? (low / scaleMax) * 100 : 0;
  const fillRight = hasPublishedRange ? 100 - (high / scaleMax) * 100 : 100;
  const tickLeft =
    months != null && hasPublishedRange
      ? Math.min(100, Math.max(0, (months / scaleMax) * 100))
      : null;

  const canEstimate =
    pendingAhead != null &&
    pendingAhead > 0 &&
    pacePerWeek != null &&
    pacePerWeek.high > 0;

  const weeksLow = canEstimate
    ? Math.max(1, Math.round(pendingAhead / pacePerWeek.high))
    : null;
  const weeksHigh = canEstimate
    ? Math.max(weeksLow ?? 1, Math.round(pendingAhead / pacePerWeek.low))
    : null;
  const estLowMo =
    weeksLow != null ? Math.max(1, Math.round((weeksLow / 4.3) * 10) / 10) : null;
  const estHighMo =
    weeksHigh != null && estLowMo != null
      ? Math.max(estLowMo, Math.round((weeksHigh / 4.3) * 1.5 * 10) / 10)
      : null;

  return (
    <section className="card">
      <div className="card-h">
        <h3>{title}</h3>
      </div>
      <div className="est">
        <div className="est-l">
          {canEstimate &&
          estLowMo != null &&
          estHighMo != null &&
          weeksLow != null &&
          weeksHigh != null &&
          pacePerWeek != null &&
          pendingAhead != null ? (
            <>
              <div className="text-small grey">
                If your block keeps its current pace
              </div>
              <div className="est-big" id="estRange">
                Roughly {estLowMo}–{estHighMo} months
              </div>
              <div className="text-small grey">
                until a decision or next major update. Here&apos;s the
                arithmetic, so you can check it yourself:
              </div>
              <div className="est-math">
                <div className="row">
                  <span>Active cases ahead of yours</span>
                  <b>{pendingAhead.toLocaleString("en-US")}</b>
                </div>
                <div className="row">
                  <span>Decisions in your block per week (last 8)</span>
                  <b>
                    ~{pacePerWeek.low}–{pacePerWeek.high}
                  </b>
                </div>
                <div className="row">
                  <span>
                    Simple estimate (
                    {pendingAhead.toLocaleString("en-US")} ÷ pace)
                  </span>
                  <b>
                    {weeksLow}–{weeksHigh} wks
                  </b>
                </div>
                <div className="row">
                  <span>Widened for out-of-order processing</span>
                  <b id="estRow">
                    {estLowMo}–{estHighMo} mo
                  </b>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-small grey">Block pace estimate</div>
              <div className="est-big" id="estRange">
                —
              </div>
              <p className="text-small grey">
                {pendingAhead == null ? publishedOnlyBody : noPaceBody}
              </p>
            </>
          )}
          <div className="nudge">
            <span className="ic">!</span>
            <div>
              <b>Filed with premium processing?</b> That replaces this estimate
              entirely with a 15-business-day statutory clock.
            </div>
            <ClaimButton>Tell us</ClaimButton>
          </div>
        </div>
        <div className="est-r">
          <h4>How this compares to published times</h4>
          {hasPublishedRange ? (
            <>
              <p>
                USCIS publishes a range of{" "}
                <span className="pub">
                  {low}–{high} months
                </span>{" "}
                for {processing?.formType ?? "this form"}
                {processing?.centerCode ? ` at your service center` : ""}.
                {months != null
                  ? ` At ${months} months in, you're ${
                      processing?.position === "under"
                        ? "earlier than"
                        : processing?.position === "over"
                          ? "past"
                          : "inside"
                    } that range.`
                  : null}
              </p>
              <div
                className="rangebar"
                role="img"
                aria-label={`Published range ${low} to ${high} months${
                  months != null ? `, you are at ${months} months` : ""
                }`}
              >
                <div
                  className="fill"
                  style={{ left: `${fillLeft}%`, right: `${fillRight}%` }}
                />
                {tickLeft != null ? (
                  <div className="tick" style={{ left: `${tickLeft}%` }} />
                ) : null}
              </div>
              <div className="rangelabels">
                <span>0</span>
                <span>
                  {low}–{high} mo
                </span>
                <span>{Math.round(scaleMax)} mo</span>
              </div>
              <p style={{ marginTop: "0.75rem" }}>
                Published ranges describe most cases, not yours. Corpus pace
                estimates appear on the left only when we have enough nearby
                cases and recent decisions.
              </p>
            </>
          ) : (
            <p className="text-small grey">
              No published USCIS processing range is available for this form
              yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
