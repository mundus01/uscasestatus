"use client";

import { useState } from "react";

type DeleteAccountPanelProps = {
  locale: string;
  labels: {
    title: string;
    body: string;
    deletesHeading: string;
    deletesAccount: string;
    deletesClaims: string;
    deletesTracked: string;
    keepsHeading: string;
    keepsCorpus: string;
    keepsUscis: string;
    timeline: string;
    start: string;
    confirmTitle: string;
    confirmBody: string;
    confirm: string;
    cancel: string;
    deleting: string;
    error: string;
  };
};

export function DeleteAccountPanel({
  locale,
  labels,
}: DeleteAccountPanelProps) {
  const [step, setStep] = useState<"idle" | "confirm">("idle");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onConfirmDelete() {
    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      const json = (await response.json()) as {
        error: { message?: string } | null;
      };

      if (!response.ok || json.error) {
        setStatus("error");
        setMessage(json.error?.message ?? labels.error);
        return;
      }

      // Full navigation so session cookies clear and the flash query is applied.
      const home = locale === "en" ? "/?deleted=1" : `/${locale}?deleted=1`;
      window.location.assign(home);
    } catch {
      setStatus("error");
      setMessage(labels.error);
    }
  }

  return (
    <section className="settings-danger" aria-labelledby="delete-account-title">
      <h3 id="delete-account-title">{labels.title}</h3>
      <p>{labels.body}</p>

      <div className="settings-delete-lists">
        <div>
          <h4>{labels.deletesHeading}</h4>
          <ul>
            <li>{labels.deletesAccount}</li>
            <li>{labels.deletesClaims}</li>
            <li>{labels.deletesTracked}</li>
          </ul>
        </div>
        <div>
          <h4>{labels.keepsHeading}</h4>
          <ul>
            <li>{labels.keepsCorpus}</li>
            <li>{labels.keepsUscis}</li>
          </ul>
        </div>
      </div>

      <p className="settings-note">{labels.timeline}</p>

      {step === "idle" ? (
        <div className="content-actions">
          <button
            type="button"
            className="button is-danger"
            onClick={() => {
              setStep("confirm");
              setStatus("idle");
              setMessage(null);
            }}
          >
            {labels.start}
          </button>
        </div>
      ) : (
        <div className="settings-confirm" role="group" aria-label={labels.confirmTitle}>
          <p className="settings-confirm-title">{labels.confirmTitle}</p>
          <p>{labels.confirmBody}</p>
          <div className="content-actions">
            <button
              type="button"
              className="button is-danger"
              disabled={status === "loading"}
              onClick={() => void onConfirmDelete()}
            >
              {status === "loading" ? labels.deleting : labels.confirm}
            </button>
            <button
              type="button"
              className="button is-tertiary"
              disabled={status === "loading"}
              onClick={() => {
                setStep("idle");
                setStatus("idle");
                setMessage(null);
              }}
            >
              {labels.cancel}
            </button>
          </div>
          {message ? (
            <p className="helper is-error" role="alert">
              {message}
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
