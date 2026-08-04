"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { authCallbackUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/client";

type AuthTab = "password" | "magic";
type PasswordMode = "signIn" | "signUp";

type SignInFormProps = {
  locale: string;
  next: string;
  initialError?: boolean;
};

export function SignInForm({ locale, next, initialError = false }: SignInFormProps) {
  const t = useTranslations("auth");
  const router = useRouter();

  const [tab, setTab] = useState<AuthTab>("password");
  const [passwordMode, setPasswordMode] = useState<PasswordMode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    initialError ? "error" : "idle",
  );
  const [message, setMessage] = useState<string | null>(
    initialError ? t("errorAuthCallback") : null,
  );

  function setError(text: string) {
    setStatus("error");
    setMessage(text);
  }

  function setOk(text: string) {
    setStatus("ok");
    setMessage(text);
  }

  async function onGoogle() {
    setStatus("loading");
    setMessage(null);
    try {
      const supabase = createClient();
      const redirectTo = authCallbackUrl(window.location.origin, next);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) {
        setError(error.message || t("errorGeneric"));
      }
    } catch {
      setError(t("errorGeneric"));
    }
  }

  async function onPasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const supabase = createClient();

      if (passwordMode === "signIn") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) {
          setError(error.message || t("errorPassword"));
          return;
        }
        router.replace(next);
        router.refresh();
        return;
      }

      const redirectTo = authCallbackUrl(window.location.origin, next);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) {
        setError(error.message || t("errorPassword"));
        return;
      }

      if (data.session) {
        router.replace(next);
        router.refresh();
        return;
      }

      setOk(t("confirmEmailSent"));
    } catch {
      setError(t("errorPassword"));
    }
  }

  async function onMagicSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale, next }),
      });
      const json = (await response.json()) as {
        error: { message?: string } | null;
      };

      if (!response.ok || json.error) {
        setError(json.error?.message ?? t("errorGeneric"));
        return;
      }

      setOk(t("linkSent"));
    } catch {
      setError(t("errorGeneric"));
    }
  }

  return (
    <div className="auth-panel">
      <button
        type="button"
        className="button is-tertiary auth-google"
        onClick={onGoogle}
        disabled={status === "loading"}
      >
        <GoogleIcon />
        {t("continueWithGoogle")}
      </button>

      <div className="auth-divider" role="separator">
        <span>{t("orDivider")}</span>
      </div>

      <div className="auth-tabs" role="tablist" aria-label={t("methodLabel")}>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "password"}
          className={tab === "password" ? "is-active" : undefined}
          onClick={() => {
            setTab("password");
            setStatus("idle");
            setMessage(null);
          }}
        >
          {t("tabPassword")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "magic"}
          className={tab === "magic" ? "is-active" : undefined}
          onClick={() => {
            setTab("magic");
            setStatus("idle");
            setMessage(null);
          }}
        >
          {t("tabMagic")}
        </button>
      </div>

      {tab === "password" ? (
        <form onSubmit={onPasswordSubmit} className="auth-form">
          <div className="auth-mode-toggle">
            <button
              type="button"
              className={passwordMode === "signIn" ? "is-active" : undefined}
              onClick={() => setPasswordMode("signIn")}
            >
              {t("modeSignIn")}
            </button>
            <button
              type="button"
              className={passwordMode === "signUp" ? "is-active" : undefined}
              onClick={() => setPasswordMode("signUp")}
            >
              {t("modeSignUp")}
            </button>
          </div>

          <label htmlFor="sign-in-email">{t("emailLabel")}</label>
          <input
            id="sign-in-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("emailPlaceholder")}
          />

          <label htmlFor="sign-in-password">{t("passwordLabel")}</label>
          <input
            id="sign-in-password"
            type="password"
            required
            minLength={8}
            autoComplete={
              passwordMode === "signIn" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t("passwordPlaceholder")}
          />

          <button
            type="submit"
            disabled={status === "loading"}
            className="button"
          >
            {status === "loading"
              ? t("working")
              : passwordMode === "signIn"
                ? t("signInPassword")
                : t("createAccount")}
          </button>
        </form>
      ) : (
        <form onSubmit={onMagicSubmit} className="auth-form">
          <p className="auth-tab-help">{t("magicHelp")}</p>
          <label htmlFor="magic-email">{t("emailLabel")}</label>
          <input
            id="magic-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("emailPlaceholder")}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="button"
          >
            {status === "loading" ? t("sending") : t("sendLink")}
          </button>
        </form>
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
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
      />
    </svg>
  );
}
