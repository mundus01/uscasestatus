"use client";

import type { ReactNode } from "react";

type ClaimButtonProps = {
  className?: string;
  children: ReactNode;
};

export function ClaimButton({ className, children }: ClaimButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        window.dispatchEvent(new CustomEvent("uscasestatus:open-claim"));
      }}
    >
      {children}
    </button>
  );
}
