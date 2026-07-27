"use client";

import { useId, useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import {
  RECEIPT_LENGTH,
  normalizeReceipt,
  validateReceipt,
  type ReceiptErrorCode,
} from "@/lib/receipt";

type ReceiptInputProps = {
  /** Renders the larger hero treatment used on landing pages. */
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

  function handleChange(next: string) {
    setValue(normalizeReceipt(next).slice(0, RECEIPT_LENGTH));
    // Clear the previous complaint as soon as they start fixing it.
    if (error) setError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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

  const isLarge = size === "lg";

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)} noValidate>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-ink-muted"
      >
        {t("label")}
      </label>

      <div className={cn("mt-2 flex flex-col gap-2", isLarge && "sm:flex-row")}>
        <input
          id={inputId}
          name="receipt"
          type="text"
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          placeholder={t("placeholder")}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus={autoFocus}
          inputMode="text"
          aria-describedby={error ? `${errorId} ${helpId}` : helpId}
          aria-invalid={error ? true : undefined}
          className={cn(
            "tabular w-full rounded-md border-hairline bg-surface px-4 text-ink",
            "placeholder:text-ink-subtle focus:border-brand-500 focus:outline-none",
            error ? "border-status-alert" : "border-line-strong",
            isLarge ? "h-14 text-lg" : "h-12 text-base",
          )}
        />

        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "shrink-0 rounded-md bg-brand-500 px-6 font-medium text-white",
            "hover:bg-brand-700 disabled:opacity-70",
            isLarge ? "h-14 text-lg" : "h-12 text-base",
          )}
        >
          {isPending ? t("checking") : t("submit")}
        </button>
      </div>

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="mt-2 text-sm text-status-alert"
        >
          {t(`errors.${error}`, {
            count: errorContext.count,
            prefix: errorContext.prefix,
          })}
        </p>
      ) : null}

      <p id={helpId} className="mt-2 text-sm text-ink-subtle">
        {t("help")}
      </p>
    </form>
  );
}
