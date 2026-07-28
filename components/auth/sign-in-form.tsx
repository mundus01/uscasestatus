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
    <form onSubmit={onSubmit} className="auth-form">
      <label htmlFor="sign-in-email">{emailLabel}</label>
      <input
        id="sign-in-email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={emailPlaceholder}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="button"
      >
        {status === "loading" ? submittingLabel : submitLabel}
      </button>
      {message ? (
        <p
          className={status === "error" ? "helper is-error" : "helper"}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
