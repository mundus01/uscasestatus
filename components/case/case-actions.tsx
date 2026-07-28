"use client";

import { useState } from "react";

type CaseActionsProps = {
  receipt: string;
  copyLabel: string;
  copiedLabel: string;
  uscisLabel: string;
  uscisHint: string;
};

export function CaseActions({
  receipt,
  copyLabel,
  copiedLabel,
  uscisLabel,
  uscisHint,
}: CaseActionsProps) {
  const [copied, setCopied] = useState(false);

  async function copyReceipt() {
    try {
      await navigator.clipboard.writeText(receipt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function openUscis() {
    await copyReceipt();
    window.open("https://egov.uscis.gov/", "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={copyReceipt}
        className="rounded-md border-[0.5px] border-line bg-surface px-3 py-2 text-sm font-medium text-ink"
      >
        {copied ? copiedLabel : copyLabel}
      </button>
      <button
        type="button"
        onClick={openUscis}
        className="rounded-md border-[0.5px] border-line bg-surface px-3 py-2 text-sm font-medium text-brand-700"
        title={uscisHint}
      >
        {uscisLabel}
      </button>
    </div>
  );
}
