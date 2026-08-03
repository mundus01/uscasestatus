import { ClaimButton } from "@/components/case/claim-button";
import type { NearbySummary } from "@/lib/neighbors";
import { MIN_CELL_SIZE, isSufficientSample } from "@/lib/privacy";

type QueueCardProps = {
  block: string;
  receiptSerial: number;
  nearby: NearbySummary | null;
  insufficientTitle: string;
  insufficientBody: string;
  title: string;
  receipt: string;
  isSignedIn: boolean;
  addDetailsLabel: string;
  categoryNudgeBody: string;
};

/**
 * Queue visualization from observed cases in the same receipt block.
 * Never invents demo counts — shows an insufficient-data state below
 * the privacy floor (MIN_CELL_SIZE).
 */
export function QueueCard({
  block,
  receiptSerial,
  nearby,
  insufficientTitle,
  insufficientBody,
  title,
  receipt,
  isSignedIn,
  addDetailsLabel,
  categoryNudgeBody,
}: QueueCardProps) {
  const sampleSize = nearby?.sampleSize ?? 0;

  if (!nearby || !isSufficientSample(sampleSize)) {
    return (
      <section className="card">
        <div className="card-h">
          <h3>{title}</h3>
          <span className="meta">
            Block {block} · {sampleSize.toLocaleString("en-US")} / {MIN_CELL_SIZE}
          </span>
        </div>
        <div className="card-b">
          <p className="queue-lede">
            <b>{insufficientTitle}</b>
          </p>
          <p className="text-small grey">{insufficientBody}</p>
        </div>
      </section>
    );
  }

  const approved = nearby.approved;
  const denied = nearby.alert;
  const pending = nearby.pending;
  const behind = Math.max(
    0,
    sampleSize - approved - denied - pending - nearby.other,
  );
  // Corpus-relative position among cases we observe (not a full USCIS queue).
  const ahead = approved + denied + pending;
  const youIndex = Math.min(
    Math.max(1, ahead),
    Math.max(1, (receiptSerial % Math.max(sampleSize, 1)) + 1),
  );
  const youPct =
    sampleSize > 0 ? Math.min(99, (ahead / sampleSize) * 100) : 0;
  const decided = approved + denied;
  const approvalRate =
    decided > 0 ? ((approved / decided) * 100).toFixed(1) : "—";
  const decidedShare =
    sampleSize > 0 ? ((decided / sampleSize) * 100).toFixed(1) : "—";

  return (
    <section className="card">
      <div className="card-h">
        <h3>{title}</h3>
        <span className="meta">
          Block {block} · {sampleSize.toLocaleString("en-US")} cases
        </span>
      </div>
      <div className="card-b">
        <p className="queue-lede">
          Among cases we track in the same receipt block as yours, by receipt
          number, <b>{ahead.toLocaleString("en-US")} cases</b> sit ahead of you
          in our corpus — many of them may already be decided.
        </p>
        <div className="qtrack">
          <div
            className="qbar"
            role="img"
            aria-label={`Of ${ahead} cases ahead of yours: ${approved} approved, ${denied} denied, ${pending} still active. ${behind} cases are behind you.`}
          >
            <div className="q1" style={{ flex: approved || 1 }} />
            <div className="q2" style={{ flex: denied || 1 }} />
            <div className="q3" style={{ flex: pending || 1 }} />
            <div className="q4" style={{ flex: behind || 1 }} />
          </div>
          <div
            className="qyou"
            aria-hidden="true"
            style={{ left: `${youPct.toFixed(2)}%` }}
            data-label={`You · #${youIndex.toLocaleString("en-US")}`}
          />
        </div>
        <style>{`.qyou::after{content:attr(data-label) !important;}`}</style>
        <div className="qlegend">
          <span>
            <span className="sw" style={{ background: "var(--success)" }} />
            <b>{approved.toLocaleString("en-US")}</b> ahead, approved
          </span>
          <span>
            <span className="sw" style={{ background: "var(--error)" }} />
            <b>{denied.toLocaleString("en-US")}</b> ahead, denied
          </span>
          <span>
            <span className="sw" style={{ background: "var(--skyblue)" }} />
            <b>{pending.toLocaleString("en-US")}</b> ahead, still waiting — like
            you
          </span>
          <span>
            <span className="sw" style={{ background: "var(--neutral-light)" }} />
            <b>{behind.toLocaleString("en-US")}</b> behind you
          </span>
        </div>
        <div className="qstats">
          <div className="qstat">
            <div className="n">{pending.toLocaleString("en-US")}</div>
            <div className="l">Active cases ahead of yours</div>
          </div>
          <div className="qstat">
            <div className="n">{approvalRate}%</div>
            <div className="l">Of decided cases in your block were approved</div>
          </div>
          <div className="qstat">
            <div className="n">{decidedShare}%</div>
            <div className="l">Of your block is already decided</div>
          </div>
        </div>
        <div className="nudge">
          <span className="ic">?</span>
          <div>{categoryNudgeBody}</div>
          <ClaimButton receipt={receipt} isSignedIn={isSignedIn}>
            {addDetailsLabel}
          </ClaimButton>
        </div>
        <div className="honest">
          USCIS does not process cases strictly in receipt order, so your
          position is a useful reference point, not a countdown. Approval rates
          describe your block as a group — they are not a prediction for your
          individual case. Counts reflect only cases we observe.
        </div>
      </div>
    </section>
  );
}
