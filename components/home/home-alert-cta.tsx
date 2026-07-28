"use client";

import { useState, useTransition, type FormEvent } from "react";

import { useRouter } from "@/i18n/navigation";
import {
  RECEIPT_LENGTH,
  normalizeReceipt,
  validateReceipt,
} from "@/lib/receipt";

export function HomeAlertCta() {
  const router = useRouter();
  const [receipt, setReceipt] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const result = validateReceipt(receipt);
    if (!result.ok) {
      setMessage("Enter a valid 13-character receipt number first.");
      return;
    }
    if (!email.includes("@")) {
      setMessage("Enter an email address.");
      return;
    }
    setMessage(null);
    startTransition(() => {
      // Land on the case page with track form ready; tracking API needs that flow.
      router.push(`/case/${result.receipt}`);
    });
  }

  return (
    <form className="alert-form" onSubmit={onSubmit}>
      <div className="row">
        <input
          type="text"
          placeholder="Receipt number"
          aria-label="Receipt number"
          value={receipt}
          onChange={(event) =>
            setReceipt(normalizeReceipt(event.target.value).slice(0, RECEIPT_LENGTH))
          }
          disabled={isPending}
        />
      </div>
      <div className="row">
        <input
          type="email"
          placeholder="you@example.com"
          aria-label="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isPending}
        />
        <button className="button" type="submit" disabled={isPending}>
          Track it
        </button>
      </div>
      <small>Free. One confirmation email, then only real updates.</small>
      {message ? (
        <small className="is-error" role="alert">
          {message}
        </small>
      ) : null}
    </form>
  );
}
