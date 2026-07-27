"use client";

import { useState, type FormEvent } from "react";

type SignInFormProps = {
  locale: string;
  emailLabel: string;
  emailPlaceholder: string;
  submitLabel: string;
  submittingLabel: string;
  successMessage: string;
  errorMessage: string;
};

export function SignInForm({
  locale,
  emailLabel,
  emailPlaceholder,
  submitLabel,
  submittingLabel,
  successMessage,
  errorMessage,
}: SignInFormProps) {
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
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      const json = (await response.json()) as {
        error: { message?: string } | null;
      };

      if (!response.ok || json.error) {
        setStatus("error");
        setMessage(json.error?.message ?? errorMessage);
        return;
      }

      setStatus("ok");
      setMessage(successMessage);
    } catch {
      setStatus("error");
      setMessage(errorMessage);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor="sign-in-email" className="block text-sm font-medium text-ink">
          {emailLabel}
        </label>
        <input
          id="sign-in-email"
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
      {message ? (
        <p
          className={`text-sm ${status === "error" ? "text-status-alert" : "text-brand-700"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
