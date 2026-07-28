import type { Locale } from "@/i18n/routing";
import type { Severity, StatusCode } from "@/lib/taxonomy/types";

export type NextStepsContent = {
  items: string[];
  citationLabel: string | null;
  citationHref: string | null;
};

type NextStepsDef = {
  en: string[];
  es: string[];
  citationHref?: string;
};

const USCSI_CASE_TOOLS = "https://www.uscis.gov/tools/case-status-online";
const USCSI_RFE = "https://www.uscis.gov/forms/filing-guidance/request-for-evidence-and-notice-of-intent-to-deny";

const BY_CODE: Partial<Record<StatusCode, NextStepsDef>> = {
  RFE_SENT: {
    en: [
      "Read the RFE notice carefully and note the response deadline.",
      "Gather every document listed — incomplete responses delay the case.",
      "Submit your response through the channel listed on the notice before the deadline.",
      "Keep a copy of everything you send.",
    ],
    es: [
      "Lea el aviso de RFE con cuidado y anote la fecha límite de respuesta.",
      "Reúna todos los documentos listados: una respuesta incompleta retrasa el caso.",
      "Envíe su respuesta por el canal indicado en el aviso antes de la fecha límite.",
      "Guarde una copia de todo lo que envíe.",
    ],
    citationHref: USCSI_RFE,
  },
  NOID_SENT: {
    en: [
      "Treat the NOID deadline as hard — missing it can end the case.",
      "Address every ground listed in the notice with evidence or legal argument.",
      "Consider consulting a licensed immigration attorney before you respond.",
      "Keep proof of timely delivery of your response.",
    ],
    es: [
      "Trate la fecha límite del NOID como firme: no cumplirla puede cerrar el caso.",
      "Responda a cada motivo del aviso con evidencia o argumento legal.",
      "Considere consultar a un abogado de inmigración con licencia antes de responder.",
      "Guarde prueba de entrega a tiempo de su respuesta.",
    ],
    citationHref: USCSI_RFE,
  },
  INTERVIEW_SCHEDULED: {
    en: [
      "Confirm the date, time, and address on the appointment notice.",
      "Bring the documents listed on the notice (and originals when asked).",
      "Arrive early with a valid photo ID.",
      "Reschedule only through the instructions on the notice if you cannot attend.",
    ],
    es: [
      "Confirme la fecha, hora y dirección en el aviso de cita.",
      "Lleve los documentos listados en el aviso (y originales si se piden).",
      "Llegue temprano con una identificación con foto válida.",
      "Reprograme solo según las instrucciones del aviso si no puede asistir.",
    ],
    citationHref: USCSI_CASE_TOOLS,
  },
  NOTICE_UNDELIVERABLE: {
    en: [
      "Update your mailing address with USCIS immediately.",
      "Check your online USCIS account for digital copies of notices.",
      "Contact the USCIS Contact Center if you still cannot access a notice.",
      "Ask about redelivery or a new notice for anything time-sensitive.",
    ],
    es: [
      "Actualice su dirección postal con USCIS de inmediato.",
      "Revise su cuenta en línea de USCIS por copias digitales de avisos.",
      "Contacte al Centro de Contacto de USCIS si aún no puede acceder a un aviso.",
      "Pregunte por reenvío o un nuevo aviso si hay plazos urgentes.",
    ],
    citationHref: USCSI_CASE_TOOLS,
  },
  CASE_TRANSFERRED: {
    en: [
      "No action is usually required when a case moves between offices.",
      "Watch for a new receipt or transfer notice by mail or online.",
      "Processing times may change with the new office — use the form’s published range as context.",
      "Keep tracking status updates; do not refile unless USCIS tells you to.",
    ],
    es: [
      "Normalmente no se requiere acción cuando un caso cambia de oficina.",
      "Esté atento a un nuevo recibo o aviso de transferencia por correo o en línea.",
      "Los tiempos pueden cambiar con la nueva oficina: use el rango publicado del formulario como contexto.",
      "Siga el estado; no vuelva a presentar a menos que USCIS lo indique.",
    ],
  },
  APPROVED: {
    en: [
      "Watch for your approval notice (I-797) by mail or in your USCIS account.",
      "If a card or document is being produced, wait for the production/mailing update.",
      "Do not travel on benefits that are not yet in hand unless you confirm eligibility.",
      "Save the approval notice with your immigration records.",
    ],
    es: [
      "Esté atento al aviso de aprobación (I-797) por correo o en su cuenta de USCIS.",
      "Si se produce una tarjeta o documento, espere la actualización de producción/envío.",
      "No viaje con beneficios que aún no tenga a menos que confirme elegibilidad.",
      "Guarde el aviso de aprobación con sus registros de inmigración.",
    ],
  },
  DENIED: {
    en: [
      "Read the denial notice for the reasons and any appeal or motion deadlines.",
      "Note whether a motion to reopen/reconsider or an appeal is available.",
      "Talk to a licensed immigration attorney or accredited representative about options.",
      "Do not assume a new filing is the only path — deadlines matter.",
    ],
    es: [
      "Lea el aviso de denegación: motivos y plazos de apelación o moción.",
      "Verifique si hay moción de reapertura/reconsideración o apelación.",
      "Consulte a un abogado de inmigración con licencia o representante acreditado.",
      "No asuma que una nueva presentación es el único camino: los plazos importan.",
    ],
  },
  CARD_MAILED: {
    en: [
      "Watch for delivery and track the card if USCIS provided a tracking number.",
      "Update your address with USCIS if you recently moved.",
      "Report a missing card through USCIS if it does not arrive in a reasonable time.",
      "Keep the approval notice until the card arrives.",
    ],
    es: [
      "Esté atento a la entrega y rastree la tarjeta si USCIS dio un número de seguimiento.",
      "Actualice su dirección con USCIS si se mudó recientemente.",
      "Reporte una tarjeta faltante a USCIS si no llega en un tiempo razonable.",
      "Conserve el aviso de aprobación hasta que llegue la tarjeta.",
    ],
    citationHref: USCSI_CASE_TOOLS,
  },
  OATH_SCHEDULED: {
    en: [
      "Confirm the oath ceremony date, time, and location on the notice.",
      "Bring the documents listed — usually your green card and appointment notice.",
      "Do not travel internationally before naturalization without checking your status.",
      "Arrive early; follow the dress and document instructions on the notice.",
    ],
    es: [
      "Confirme la fecha, hora y lugar de la ceremonia de juramento en el aviso.",
      "Lleve los documentos listados — normalmente su green card y el aviso de cita.",
      "No viaje al extranjero antes de la naturalización sin verificar su estatus.",
      "Llegue temprano; siga las instrucciones del aviso sobre vestimenta y documentos.",
    ],
    citationHref: USCSI_CASE_TOOLS,
  },
};

const DEFAULT: NextStepsDef = {
  en: [
    "Keep your receipt number and notices in a safe place.",
    "Check for updates here or on the official USCIS site.",
    "Respond only if USCIS asks you for something in writing.",
  ],
  es: [
    "Guarde su número de recibo y avisos en un lugar seguro.",
    "Revise actualizaciones aquí o en el sitio oficial de USCIS.",
    "Responda solo si USCIS le pide algo por escrito.",
  ],
};

export function getNextSteps(
  code: StatusCode,
  locale: Locale,
  citationLabel: string,
): NextStepsContent {
  const def = BY_CODE[code] ?? DEFAULT;
  const items = locale === "es" ? def.es : def.en;
  return {
    items,
    citationLabel: def.citationHref ? citationLabel : null,
    citationHref: def.citationHref ?? null,
  };
}

/** Map taxonomy severity → callout visual treatment (§9.3). */
export function nextStepsTone(
  severity: Severity,
): "approved" | "pending" | "neutral" | "brand" {
  switch (severity) {
    case "positive":
      return "approved";
    case "attention":
    case "action_required":
      return "pending";
    case "negative":
      return "neutral";
    default:
      return "brand";
  }
}

export function nextStepsBordered(severity: Severity): boolean {
  return severity === "action_required";
}
