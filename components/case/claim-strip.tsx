"use client";

import { useEffect, useState } from "react";

import { ClaimButton } from "@/components/case/claim-button";

type ClaimStripProps = {
  sampleSize: number;
};

export function ClaimStrip({ sampleSize }: ClaimStripProps) {
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    function onClaimed() {
      setClaimed(true);
    }
    window.addEventListener("uscasestatus:case-claimed", onClaimed);
    return () => window.removeEventListener("uscasestatus:case-claimed", onClaimed);
  }, []);

  if (claimed) {
    return (
      <div className="claimed-note show" id="claimedNote">
        <span className="ic">✓</span>
        <div>
          <b>Case claimed.</b> These figures now use cases matching the filing
          details you provided.{" "}
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("uscasestatus:open-claim"))
            }
            style={{
              background: "none",
              border: 0,
              color: "var(--skyblue)",
              font: "inherit",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Edit details
          </button>
        </div>
      </div>
    );
  }

  const count = sampleSize > 0 ? sampleSize.toLocaleString("en-US") : "cases";

  return (
    <section className="claim" id="claimStrip">
      <span className="icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M12 3l7 4v5c0 4.4-2.9 8.3-7 9.5C7.9 20.3 5 16.4 5 12V7l7-4z" />
          <path d="M9.5 12.2l1.9 1.9 3.6-3.8" />
        </svg>
      </span>
      <div className="copy">
        <b>
          {sampleSize > 0
            ? `Every number here describes all ${count} cases in your block.`
            : "Claim your case to personalize every number on this page."}
        </b>
        <span>
          Claim your case and add your filing details — we&apos;ll narrow them to
          cases that match yours.
        </span>
      </div>
      <ClaimButton className="button is-small">Claim this case</ClaimButton>
    </section>
  );
}
