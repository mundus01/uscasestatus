import "server-only";

import { Resend } from "resend";

import { getResendEnv } from "@/lib/env";
import { publicEnv } from "@/lib/env";
import type { Locale } from "@/i18n/routing";

function getResend(): Resend | null {
  const env = getResendEnv();
  if (!env) return null;
  return new Resend(env.apiKey);
}

function siteUrl() {
  return publicEnv.siteUrl.replace(/\/$/, "");
}

function localePath(locale: Locale, path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === "en") return `${siteUrl()}${normalized}`;
  return `${siteUrl()}/${locale}${normalized}`;
}

export type SendResult = { ok: true } | { ok: false; reason: string };

export async function sendConfirmTrackEmail(input: {
  to: string;
  receipt: string;
  confirmToken: string;
  locale: Locale;
}): Promise<SendResult> {
  const env = getResendEnv();
  const resend = getResend();
  if (!env || !resend) {
    console.warn("[email] RESEND_API_KEY missing — skipped confirm email");
    return { ok: false, reason: "email_not_configured" };
  }

  const confirmUrl = `${siteUrl()}/api/track/confirm?token=${encodeURIComponent(input.confirmToken)}`;
  const caseUrl = localePath(input.locale, `/case/${input.receipt}`);

  const isEs = input.locale === "es";
  const subject = isEs
    ? `Confirma alertas para ${input.receipt}`
    : `Confirm alerts for ${input.receipt}`;

  const html = isEs
    ? `<p>Confirmaste querer alertas por correo cuando cambie el estado de <strong>${input.receipt}</strong>.</p>
       <p><a href="${confirmUrl}">Confirmar alertas</a></p>
       <p>Si no pediste esto, ignora este mensaje.</p>
       <p><a href="${caseUrl}">Ver el caso</a></p>`
    : `<p>You asked for email alerts when the status of <strong>${input.receipt}</strong> changes.</p>
       <p><a href="${confirmUrl}">Confirm alerts</a></p>
       <p>If you didn’t request this, ignore this email.</p>
       <p><a href="${caseUrl}">View the case</a></p>`;

  const { error } = await resend.emails.send({
    from: env.from,
    to: input.to,
    subject,
    html,
  });

  if (error) {
    console.warn("[email] confirm send failed:", error.message);
    return { ok: false, reason: error.message };
  }
  return { ok: true };
}

export async function sendStatusChangeEmail(input: {
  to: string;
  receipt: string;
  fromStatus: string | null;
  toStatus: string;
  plainEnglish: string;
  whatToDo: string;
  unsubscribeToken: string;
  locale: Locale;
}): Promise<SendResult> {
  const env = getResendEnv();
  const resend = getResend();
  if (!env || !resend) {
    return { ok: false, reason: "email_not_configured" };
  }

  const caseUrl = localePath(input.locale, `/case/${input.receipt}`);
  const unsubUrl = `${siteUrl()}/api/track/unsubscribe?token=${encodeURIComponent(input.unsubscribeToken)}`;
  const isEs = input.locale === "es";

  const subject = isEs
    ? `Actualización: ${input.receipt} — ${input.toStatus}`
    : `Update: ${input.receipt} — ${input.toStatus}`;

  const fromLine =
    input.fromStatus != null
      ? isEs
        ? `<p><strong>Antes:</strong> ${input.fromStatus}<br/><strong>Ahora:</strong> ${input.toStatus}</p>`
        : `<p><strong>Before:</strong> ${input.fromStatus}<br/><strong>Now:</strong> ${input.toStatus}</p>`
      : isEs
        ? `<p><strong>Estado:</strong> ${input.toStatus}</p>`
        : `<p><strong>Status:</strong> ${input.toStatus}</p>`;

  const html = isEs
    ? `${fromLine}
       <p><strong>Qué significa</strong><br/>${input.plainEnglish}</p>
       <p><strong>Qué hacer</strong><br/>${input.whatToDo}</p>
       <p><a href="${caseUrl}">Ver detalles</a></p>
       <p style="color:#666;font-size:12px"><a href="${unsubUrl}">Cancelar alertas</a></p>`
    : `${fromLine}
       <p><strong>What this means</strong><br/>${input.plainEnglish}</p>
       <p><strong>What to do next</strong><br/>${input.whatToDo}</p>
       <p><a href="${caseUrl}">View details</a></p>
       <p style="color:#666;font-size:12px"><a href="${unsubUrl}">Unsubscribe</a></p>`;

  const { error } = await resend.emails.send({
    from: env.from,
    to: input.to,
    subject,
    html,
    headers: {
      "List-Unsubscribe": `<${unsubUrl}>`,
    },
  });

  if (error) {
    console.warn("[email] alert send failed:", error.message);
    return { ok: false, reason: error.message };
  }
  return { ok: true };
}

export async function sendMagicLinkEmail(input: {
  to: string;
  magicLink: string;
  locale: Locale;
}): Promise<SendResult> {
  const env = getResendEnv();
  const resend = getResend();
  if (!env || !resend) {
    return { ok: false, reason: "email_not_configured" };
  }

  const isEs = input.locale === "es";
  const subject = isEs
    ? "Tu enlace para entrar a uscasestatus.com"
    : "Your sign-in link for uscasestatus.com";

  const html = isEs
    ? `<p>Usa este enlace para entrar a tu panel (válido unos minutos):</p>
       <p><a href="${input.magicLink}">Entrar</a></p>
       <p>Si no pediste esto, ignora el correo.</p>`
    : `<p>Use this link to sign in to your dashboard (expires in a few minutes):</p>
       <p><a href="${input.magicLink}">Sign in</a></p>
       <p>If you didn’t request this, ignore this email.</p>`;

  const { error } = await resend.emails.send({
    from: env.from,
    to: input.to,
    subject,
    html,
  });

  if (error) {
    return { ok: false, reason: error.message };
  }
  return { ok: true };
}
