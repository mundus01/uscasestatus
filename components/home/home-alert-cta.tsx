"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import {
  RECEIPT_LENGTH,
  normalizeReceipt,
  validateReceipt,
} from "@/lib/receipt";

export function HomeAlertCta() {
  const t = useTranslations("home.alerts");
  const router = useRouter();
  const [receipt, setReceipt] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const result = validateReceipt(receipt);
    if (!result.ok) {
      setMessage(t("badReceipt"));
      return;
    }
    if (!email.includes("@")) {
      setMessage(t("badEmail"));
      return;
    }
    setMessage(null);
    startTransition(() => {
      router.push(`/case/${result.receipt}`);
    });
  }

  return (
    <form className="alert-form" onSubmit={onSubmit}>
      <div className="row">
        <input
          type="text"
          placeholder={t("receiptPlaceholder")}
          aria-label={t("receiptLabel")}
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
          placeholder={t("emailPlaceholder")}
          aria-label={t("emailLabel")}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isPending}
        />
        <button className="button" type="submit" disabled={isPending}>
          {t("submit")}
        </button>
      </div>
      <small>{t("note")}</small>
      {message ? (
        <small className="is-error" role="alert">
          {message}
        </small>
      ) : null}
    </form>
  );
}
