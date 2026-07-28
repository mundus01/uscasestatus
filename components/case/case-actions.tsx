"use client";

import { useState } from "react";

type CaseActionsProps = {
  receipt: string;
};

export function CaseActions({ receipt }: CaseActionsProps) {
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
    <div className="footrow">
      <button className="button is-tertiary is-small" type="button" onClick={copyReceipt}>
        {copied ? "Copied" : "Copy receipt number"}
      </button>
      <button className="button is-tertiary is-small" type="button" onClick={openUscis}>
        Check on USCIS
      </button>
    </div>
  );
}
