"use client";

import { useTranslations } from "next-intl";

import { ClaimButton } from "@/components/case/claim-button";
import { MIN_CELL_SIZE, isSufficientSample } from "@/lib/privacy";

type ClaimStripProps = {
  sampleSize: number;
  receipt: string;
  isSignedIn: boolean;
  hasClaim: boolean;
};

export function ClaimStrip({
  sampleSize,
  receipt,
  isSignedIn,
  hasClaim,
}: ClaimStripProps) {
  const t = useTranslations("case.claim");

  if (hasClaim) {
    // Claimed UI lives in CaseDetailsPanel when signed in.
    return null;
  }

  const sufficient = isSufficientSample(sampleSize);
  const count = sampleSize.toLocaleString();

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
          {sufficient
            ? t("stripEnough", { count })
            : t("stripGathering", { count, min: MIN_CELL_SIZE })}
        </b>
        <span>
          {isSignedIn ? t("stripSignedInBody") : t("stripSignedOutBody")}
        </span>
      </div>
      <ClaimButton
        className="button is-small"
        receipt={receipt}
        isSignedIn={isSignedIn}
      >
        {isSignedIn ? t("addDetails") : t("signInToClaim")}
      </ClaimButton>
    </section>
  );
}
