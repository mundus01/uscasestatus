"use client";

import { useState, type FormEvent } from "react";

type TrackFormProps = {
  receipt: string;
  locale: string;
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
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receipt, email, locale }),
      });
      const json = (await response.json()) as {
        data: { alreadyTracked?: boolean; needsConfirmation?: boolean } | null;
        error: { message?: string } | null;
      };

      if (!response.ok || json.error) {
        setStatus("error");
        setMessage(json.error?.message ?? errorGeneric);
        return;
      }

      setStatus("ok");
      setMessage(
        json.data?.alreadyTracked ? successAlready : successConfirm,
      );
    } catch {
      setStatus("error");
      setMessage(errorGeneric);
    }
  }

  return (
    <section className="rounded-lg border-[0.5px] border-line bg-surface p-5 md:p-6">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-ink-muted">{body}</p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div>
          <label
            htmlFor="track-email"
            className="block text-sm font-medium text-ink"
          >
            {emailLabel}
          </label>
          <input
            id="track-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={emailPlaceholder}
            className="mt-1.5 w-full rounded-md border-[0.5px] border-line bg-canvas px-3 py-2.5 text-base text-ink outline-none focus:border-brand-500"
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-md bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {status === "loading" ? submittingLabel : submitLabel}
        </button>
      </form>

      {message ? (
        <p
          className={`mt-3 text-sm ${
            status === "error" ? "text-status-alert" : "text-brand-700"
          }`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
