"use client";

import { useState, type FormEvent } from "react";

import type { Locale } from "@/i18n/routing";

type TrackFormProps = {
  receipt: string;
  locale: Locale;
  title: string;
  body: string;
  emailLabel: string;
  emailPlaceholder: string;
  submitLabel: string;
  submittingLabel: string;
  successConfirm: string;
  successAlready: string;
  errorGeneric: string;
};

export function TrackForm({
  receipt,
  locale,
  title,
  body,
  emailLabel,
  emailPlaceholder,
  submitLabel,
  submittingLabel,
  successConfirm,
  successAlready,
  errorGeneric,
}: TrackFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "already" | "error">(
    "idle",
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");
    try {
      const response = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receipt, email, locale, consent: true }),
      });
      const json = (await response.json()) as {
        data?: { alreadyTracked?: boolean };
        error?: unknown;
      };
      if (!response.ok) {
        setStatus("error");
        return;
      }
      setStatus(json.data?.alreadyTracked ? "already" : "ok");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="card">
      <div className="card-h">
        <h3>{title}</h3>
      </div>
      <div className="card-b">
        <p className="text-small grey">{body}</p>
        {status === "ok" || status === "already" ? (
          <p className="text-small" style={{ marginTop: "0.9rem" }}>
            {status === "already" ? successAlready : successConfirm}
          </p>
        ) : (
          <form className="alert-row" onSubmit={onSubmit}>
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={emailPlaceholder}
              aria-label={emailLabel}
              disabled={status === "loading"}
            />
            <button className="button" type="submit" disabled={status === "loading"}>
              {status === "loading" ? submittingLabel : submitLabel}
            </button>
          </form>
        )}
        {status === "error" ? (
          <p className="text-small" style={{ marginTop: "0.75rem", color: "var(--error)" }}>
            {errorGeneric}
          </p>
        ) : null}
      </div>
    </section>
  );
}
