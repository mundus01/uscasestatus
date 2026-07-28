"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import {
  RECEIPT_LENGTH,
  normalizeReceipt,
  validateReceipt,
  type ReceiptErrorCode,
} from "@/lib/receipt";

export function HomeLookup() {
  const t = useTranslations("home.hero");
  const tReceipt = useTranslations("receipt");
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<ReceiptErrorCode | null>(null);
  const [errorContext, setErrorContext] = useState<{
    count: number;
    prefix: string;
  }>({ count: 0, prefix: "" });
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const result = validateReceipt(value);
    if (!result.ok) {
      setError(result.code);
      setErrorContext({ count: result.length, prefix: result.prefix ?? "" });
      return;
    }
    setError(null);
    startTransition(() => {
      router.push(`/case/${result.receipt}`);
    });
  }

  return (
    <form className="lookup" onSubmit={onSubmit} noValidate>
      <div className="lookup-row">
        <input
          type="text"
          name="receipt"
          value={value}
          onChange={(event) => {
            setValue(normalizeReceipt(event.target.value).slice(0, RECEIPT_LENGTH));
            if (error) setError(null);
          }}
          placeholder={t("placeholder")}
          aria-label={t("receiptLabel")}
          autoComplete="off"
          spellCheck={false}
          disabled={isPending}
          aria-invalid={error ? true : undefined}
        />
        <button className="button is-large" type="submit" disabled={isPending}>
          {isPending ? tReceipt("checking") : t("submit")}
        </button>
      </div>
      <p className="helper">{t("helper")}</p>
      {error ? (
        <p className="helper is-error" role="alert">
          {tReceipt(`errors.${error}`, errorContext)}
        </p>
      ) : null}
    </form>
  );
}
