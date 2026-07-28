import { ClaimButton } from "@/components/case/claim-button";
import type { ProcessingTimeContext } from "@/lib/processing-times";

type EstimateCardProps = {
  processing: ProcessingTimeContext | null;
  pendingAhead: number;
};

export function EstimateCard({ processing, pendingAhead }: EstimateCardProps) {
  const months = processing?.elapsed.months;
  const low = processing?.lowMonths ?? 7.5;
  const high = processing?.highMonths ?? 13;
  const scaleMax = Math.max(high * 1.4, 18);
  const fillLeft = (low / scaleMax) * 100;
  const fillRight = 100 - (high / scaleMax) * 100;
  const tickLeft =
    months != null ? Math.min(100, Math.max(0, (months / scaleMax) * 100)) : 52;

  const weeksLow = pendingAhead > 0 ? Math.max(1, Math.round(pendingAhead / 55)) : 11;
  const weeksHigh = pendingAhead > 0 ? Math.max(weeksLow, Math.round(pendingAhead / 40)) : 14;
  const estLowMo = Math.max(1, Math.round((weeksLow / 4.3) * 10) / 10);
  const estHighMo = Math.max(estLowMo, Math.round((weeksHigh / 4.3) * 1.5 * 10) / 10);

  return (
    <section className="card">
      <div className="card-h">
        <h3>When something is likely to happen</h3>
      </div>
      <div className="est">
        <div className="est-l">
          <div className="text-small grey">If your block keeps its current pace</div>
          <div className="est-big" id="estRange">
            Roughly {estLowMo}–{estHighMo} months
          </div>
          <div className="text-small grey">
            until a decision or next major update. Here&apos;s the arithmetic, so
            you can check it yourself:
          </div>
          <div className="est-math">
            <div className="row">
              <span>Active cases ahead of yours</span>
              <b>{pendingAhead.toLocaleString("en-US")}</b>
            </div>
            <div className="row">
              <span>Decisions in your block per week (last 8)</span>
              <b>~40–55</b>
            </div>
            <div className="row">
              <span>
                Simple estimate ({pendingAhead.toLocaleString("en-US")} ÷ pace)
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
            <div className="tick" style={{ left: `${tickLeft}%` }} />
          </div>
          <div className="rangelabels">
            <span>0</span>
            <span>
              {low}–{high} mo
            </span>
            <span>{Math.round(scaleMax)} mo</span>
          </div>
          <p style={{ marginTop: "0.75rem" }}>
            Published ranges describe most cases, not yours. The estimate on the
            left comes from your block&apos;s actual recent pace — when the two
            disagree, watch the block.
          </p>
        </div>
      </div>
    </section>
  );
}
