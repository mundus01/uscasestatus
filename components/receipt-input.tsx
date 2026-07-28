"use client";

import { useId, useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import {
  RECEIPT_LENGTH,
  normalizeReceipt,
  validateReceipt,
  type ReceiptErrorCode,
} from "@/lib/receipt";

type ReceiptInputProps = {
  /** Larger CTA button — same layout either way. */
  size?: "md" | "lg";
  className?: string;
  autoFocus?: boolean;
};

export function ReceiptInput({
  size = "md",
  className,
  autoFocus = false,
}: ReceiptInputProps) {
  const t = useTranslations("receipt");
  const router = useRouter();
  const inputId = useId();
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;

  const [value, setValue] = useState("");
  const [error, setError] = useState<ReceiptErrorCode | null>(null);
  const [errorContext, setErrorContext] = useState<{
    count: number;
    prefix: string;
  }>({ count: 0, prefix: "" });
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = validateReceipt(value);
    if (!result.ok) {
      setError(result.code);
      setErrorContext({ count: result.length, prefix: result.prefix ?? "" });
      return;
    }

    startTransition(() => {
      router.push(`/case/${result.receipt}`);
    });
  }

  return (
    <form
      className={className ? `lookup ${className}` : "lookup"}
      onSubmit={handleSubmit}
      noValidate
    >
      <label htmlFor={inputId} className="sr-only">
        {t("label")}
      </label>
      <div className="lookup-row">
        <input
          id={inputId}
          name="receipt"
          type="text"
          value={value}
          onChange={(event) => {
            setValue(normalizeReceipt(event.target.value).slice(0, RECEIPT_LENGTH));
            if (error) setError(null);
          }}
          placeholder={t("placeholder")}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus={autoFocus}
          inputMode="text"
          aria-describedby={error ? `${errorId} ${helpId}` : helpId}
          aria-invalid={error ? true : undefined}
          disabled={isPending}
        />
        <button
          className={size === "lg" ? "button is-large" : "button"}
          type="submit"
          disabled={isPending}
        >
          {isPending ? t("checking") : t("submit")}
        </button>
      </div>
      {error ? (
        <p id={errorId} className="helper is-error" role="alert">
          {t(`errors.${error}`, {
            count: errorContext.count,
            prefix: errorContext.prefix,
          })}
        </p>
      ) : null}
      <p id={helpId} className="helper">
        {t("help")}
      </p>
    </form>
  );
}
