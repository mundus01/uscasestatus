"use client";

import type { ReactNode } from "react";
import { useLocale } from "next-intl";

import { Link } from "@/i18n/navigation";
import { defaultLocale } from "@/i18n/routing";

type ClaimButtonProps = {
  className?: string;
  children: ReactNode;
  receipt: string;
  isSignedIn: boolean;
};

/**
 * Logged out → sign-in with return URL to this case.
 * Logged in → scroll/open the inline case details panel (no modal).
 */
export function ClaimButton({
  className,
  children,
  receipt,
  isSignedIn,
}: ClaimButtonProps) {
  const locale = useLocale();

  if (!isSignedIn) {
    const casePath = `/case/${receipt.toUpperCase()}#case-details`;
    const next =
      locale === defaultLocale ? casePath : `/${locale}${casePath}`;
    return (
      <Link
        href={{ pathname: "/sign-in", query: { next } }}
        className={className}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        window.dispatchEvent(new CustomEvent("uscasestatus:edit-case-details"));
      }}
    >
      {children}
    </button>
  );
}
