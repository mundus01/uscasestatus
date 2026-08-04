"use client";

import { useState } from "react";

type ClearClaimsPanelProps = {
  labels: {
    title: string;
    body: string;
    start: string;
    confirmTitle: string;
    confirmBody: string;
    confirm: string;
    cancel: string;
    clearing: string;
    success: string;
    error: string;
  };
};

export function ClearClaimsPanel({ labels }: ClearClaimsPanelProps) {
  const [step, setStep] = useState<"idle" | "confirm">("idle");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function onConfirmClear() {
    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/account/claims", {
        method: "DELETE",
      });
      const json = (await response.json()) as {
        error: { message?: string } | null;
      };

      if (!response.ok || json.error) {
        setStatus("error");
        setMessage(json.error?.message ?? labels.error);
        return;
      }

      setStatus("ok");
      setStep("idle");
      setMessage(labels.success);
    } catch {
      setStatus("error");
      setMessage(labels.error);
    }
  }

  return (
    <section className="card" aria-labelledby="clear-claims-title">
      <div className="card-b">
        <h3 id="clear-claims-title">{labels.title}</h3>
        <p className="grey">{labels.body}</p>

        {step === "idle" ? (
          <div className="content-actions">
            <button
              type="button"
              className="button is-tertiary"
              onClick={() => {
                setStep("confirm");
                if (status !== "ok") {
                  setStatus("idle");
                  setMessage(null);
                }
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
                className="button is-secondary"
                disabled={status === "loading"}
                onClick={() => void onConfirmClear()}
              >
                {status === "loading" ? labels.clearing : labels.confirm}
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
          </div>
        )}

        {message ? (
          <p
            className={status === "error" ? "helper is-error" : "helper"}
            role="status"
          >
            {message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
