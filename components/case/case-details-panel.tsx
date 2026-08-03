"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

import {
  COUNTRY_OF_BIRTH_OPTIONS,
  SERVICE_CENTER_OPTIONS,
  VISA_CATEGORY_OPTIONS,
  type CaseClaimProfile,
  type PremiumProcessing,
} from "@/lib/claim-fields";

type CaseDetailsPanelProps = {
  receipt: string;
  initialProfile: CaseClaimProfile | null;
  /** When true, expand the form immediately (e.g. hash #case-details). */
  startEditing?: boolean;
};

export function CaseDetailsPanel({
  receipt,
  initialProfile,
  startEditing = false,
}: CaseDetailsPanelProps) {
  const t = useTranslations("case.claim");
  const [editing, setEditing] = useState(
    startEditing || initialProfile == null,
  );
  const [countryOfBirth, setCountryOfBirth] = useState(
    initialProfile?.countryOfBirth ?? "",
  );
  const [premiumProcessing, setPremiumProcessing] = useState<
    PremiumProcessing | ""
  >(initialProfile?.premiumProcessing ?? "");
  const [visaCategory, setVisaCategory] = useState(
    initialProfile?.visaCategory ?? "",
  );
  const [serviceCenter, setServiceCenter] = useState(
    initialProfile?.serviceCenter ?? "",
  );
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState(initialProfile != null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#case-details") {
      setEditing(true);
      document
        .getElementById("case-details")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function onEdit() {
      setEditing(true);
      document
        .getElementById("case-details")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    window.addEventListener("uscasestatus:edit-case-details", onEdit);
    return () =>
      window.removeEventListener("uscasestatus:edit-case-details", onEdit);
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receipt,
          countryOfBirth: countryOfBirth || null,
          premiumProcessing: premiumProcessing || null,
          visaCategory: visaCategory || null,
          serviceCenter: serviceCenter || null,
        }),
      });
      const json = (await response.json()) as {
        data: { profile: CaseClaimProfile } | null;
        error: { code?: string; message?: string } | null;
      };

      if (!response.ok || json.error || !json.data?.profile) {
        setStatus("error");
        setMessage(json.error?.message ?? t("errorGeneric"));
        return;
      }

      setSaved(true);
      setEditing(false);
      setStatus("ok");
      setMessage(t("saved"));
      window.dispatchEvent(
        new CustomEvent("uscasestatus:case-claimed", {
          detail: json.data.profile,
        }),
      );
    } catch {
      setStatus("error");
      setMessage(t("errorGeneric"));
    }
  }

  if (!editing && saved) {
    return (
      <div className="claimed-note show" id="case-details">
        <span className="ic" aria-hidden="true">
          ✓
        </span>
        <div>
          <b>{t("claimedTitle")}</b> {t("claimedBody")}{" "}
          <button
            type="button"
            className="linkish"
            onClick={() => setEditing(true)}
          >
            {t("editDetails")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="card case-details" id="case-details">
      <div className="card-h">
        <h3>{t("formTitle", { receipt })}</h3>
      </div>
      <form className="card-b" onSubmit={onSubmit}>
        <p className="case-details-lede">{t("formBody")}</p>

        <div className="field">
          <label htmlFor="claim-cob">{t("countryLabel")}</label>
          <select
            id="claim-cob"
            value={countryOfBirth}
            onChange={(event) => setCountryOfBirth(event.target.value)}
          >
            <option value="">{t("selectPlaceholder")}</option>
            {COUNTRY_OF_BIRTH_OPTIONS.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          <div className="hint">{t("countryHint")}</div>
        </div>

        <div className="field">
          <label>{t("premiumLabel")}</label>
          <div className="radio-row">
            {(
              [
                ["yes", t("premiumYes")],
                ["no", t("premiumNo")],
                ["unknown", t("premiumUnknown")],
              ] as const
            ).map(([value, label]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="premium"
                  value={value}
                  checked={premiumProcessing === value}
                  onChange={() => setPremiumProcessing(value)}
                />{" "}
                {label}
              </label>
            ))}
          </div>
          <div className="hint">{t("premiumHint")}</div>
        </div>

        <div className="field">
          <label htmlFor="claim-cat">{t("visaLabel")}</label>
          <select
            id="claim-cat"
            value={visaCategory}
            onChange={(event) => setVisaCategory(event.target.value)}
          >
            <option value="">{t("selectPlaceholder")}</option>
            {VISA_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
          <div className="hint">{t("visaHint")}</div>
        </div>

        <div className="field">
          <label htmlFor="claim-ctr">{t("centerLabel")}</label>
          <select
            id="claim-ctr"
            value={serviceCenter}
            onChange={(event) => setServiceCenter(event.target.value)}
          >
            <option value="">{t("selectPlaceholder")}</option>
            {SERVICE_CENTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
          <div className="hint">{t("centerHint")}</div>
        </div>

        <p className="later">{t("laterNote")}</p>

        <div className="case-details-actions">
          <p className="privacy">{t("privacy")}</p>
          <div className="case-details-buttons">
            {saved ? (
              <button
                type="button"
                className="button is-secondary is-small"
                onClick={() => setEditing(false)}
              >
                {t("cancel")}
              </button>
            ) : null}
            <button
              type="submit"
              className="button"
              disabled={status === "loading"}
            >
              {status === "loading" ? t("saving") : t("save")}
            </button>
          </div>
        </div>

        {message ? (
          <p
            className={status === "error" ? "helper is-error" : "helper"}
            role="status"
          >
            {message}
          </p>
        ) : null}
      </form>
    </section>
  );
}
