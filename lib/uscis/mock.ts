import type { UscisCasePayload } from "@/lib/uscis/types";

/**
 * Deterministic fixtures for local development when USCIS credentials are
 * missing. Last digit of the receipt selects a scenario so the UI can be
 * exercised end-to-end without calling USCIS.
 */
const SCENARIOS: UscisCasePayload[] = [
  {
    receiptNumber: "IOE0000000000",
    formType: "I-765",
    submittedDate: "01-15-2026 09:00:00",
    modifiedDate: "01-15-2026 09:00:00",
    statusText: {
      en: "Case Was Received",
      es: "Caso Fue Recibido",
    },
    statusDescription: {
      en: "We received your Form I-765, Application for Employment Authorization, and mailed you a receipt notice.",
      es: "Recibimos su Formulario I-765, Solicitud de Autorización de Empleo, y le enviamos un aviso de recibo.",
    },
    history: [],
  },
  {
    receiptNumber: "IOE0000000001",
    formType: "I-485",
    submittedDate: "03-01-2025 10:00:00",
    modifiedDate: "06-12-2025 14:20:00",
    statusText: {
      en: "Fingerprint Fee Was Received",
      es: "Se Recibió La Tarifa De Huellas Digitales",
    },
    statusDescription: {
      en: "We received your biometrics fee for Form I-485. We will mail an appointment notice when your biometrics appointment is scheduled.",
      es: "Recibimos la tarifa de datos biométricos para el Formulario I-485. Le enviaremos un aviso cuando se programe su cita.",
    },
    history: [],
  },
  {
    receiptNumber: "IOE0000000002",
    formType: "I-130",
    submittedDate: "11-02-2024 11:00:00",
    modifiedDate: "04-18-2026 08:45:00",
    statusText: {
      en: "Case Is Being Actively Reviewed By USCIS",
      es: "USCIS Está Revisando Activamente El Caso",
    },
    statusDescription: {
      en: "Your Form I-130, Petition for Alien Relative, is being actively reviewed by USCIS. We will notify you by mail if we need anything else.",
      es: "Su Formulario I-130, Petición de Familiar Extranjero, está siendo revisado activamente por USCIS. Le notificaremos por correo si necesitamos algo más.",
    },
    history: [],
  },
  {
    receiptNumber: "IOE0000000003",
    formType: "I-485",
    submittedDate: "08-20-2024 09:30:00",
    modifiedDate: "02-03-2026 16:10:00",
    statusText: {
      en: "Request for Additional Evidence Was Sent",
      es: "Se Envió Una Solicitud De Evidencia Adicional",
    },
    statusDescription: {
      en: "We mailed a request for additional evidence for your Form I-485. Please respond by the deadline on the notice.",
      es: "Enviamos una solicitud de evidencia adicional para su Formulario I-485. Responda antes de la fecha límite en el aviso.",
    },
    history: [],
  },
  {
    receiptNumber: "IOE0000000004",
    formType: "N-400",
    submittedDate: "05-10-2025 13:00:00",
    modifiedDate: "01-22-2026 10:05:00",
    statusText: {
      en: "Interview Was Scheduled",
      es: "Se Programó La Entrevista",
    },
    statusDescription: {
      en: "We scheduled an interview for your Form N-400, Application for Naturalization. Please bring the documents listed on your appointment notice.",
      es: "Programamos una entrevista para su Formulario N-400, Solicitud de Naturalización. Traiga los documentos listados en su aviso de cita.",
    },
    history: [],
  },
  {
    receiptNumber: "IOE0000000005",
    formType: "I-765",
    submittedDate: "09-01-2025 08:00:00",
    modifiedDate: "03-28-2026 11:40:00",
    statusText: {
      en: "New Card Is Being Produced",
      es: "Se Está Produciendo Una Nueva Tarjeta",
    },
    statusDescription: {
      en: "We are producing your Employment Authorization Document. You should receive it by mail soon.",
      es: "Estamos produciendo su Documento de Autorización de Empleo. Debería recibirlo por correo pronto.",
    },
    history: [],
  },
  {
    receiptNumber: "IOE0000000006",
    formType: "I-130",
    submittedDate: "02-14-2024 15:00:00",
    modifiedDate: "07-01-2026 09:15:00",
    statusText: {
      en: "Case Was Approved",
      es: "Caso Fue Aprobado",
    },
    statusDescription: {
      en: "We approved your Form I-130, Petition for Alien Relative. We mailed you an approval notice.",
      es: "Aprobamos su Formulario I-130, Petición de Familiar Extranjero. Le enviamos un aviso de aprobación.",
    },
    history: [],
  },
  {
    receiptNumber: "IOE0000000007",
    formType: "I-485",
    submittedDate: "06-01-2024 12:00:00",
    modifiedDate: "05-20-2026 17:00:00",
    statusText: {
      en: "Case Was Denied",
      es: "Caso Fue Denegado",
    },
    statusDescription: {
      en: "We denied your Form I-485, Application to Register Permanent Residence or Adjust Status. Please read the denial notice carefully for your options.",
      es: "Denegamos su Formulario I-485, Solicitud para Registrar Residencia Permanente o Ajustar Estatus. Lea el aviso de denegación con cuidado para conocer sus opciones.",
    },
    history: [],
  },
  {
    receiptNumber: "IOE0000000008",
    formType: "I-765",
    submittedDate: "12-01-2025 10:00:00",
    modifiedDate: "04-02-2026 13:25:00",
    statusText: {
      en: "Card Was Mailed To Me",
      es: "Se Me Envió La Tarjeta Por Correo",
    },
    statusDescription: {
      en: "We mailed your card. Track delivery with the tracking number on your case history if available, or wait for USPS delivery.",
      es: "Enviamos su tarjeta por correo. Rastreela con el número de seguimiento en el historial de su caso si está disponible, o espere la entrega de USPS.",
    },
    history: [],
  },
  {
    receiptNumber: "IOE0000000009",
    formType: "I-539",
    submittedDate: "10-10-2025 09:45:00",
    modifiedDate: "02-28-2026 08:00:00",
    statusText: {
      en: "Case Was Transferred And A New Office Has Jurisdiction",
      es: "El Caso Fue Transferido Y Una Nueva Oficina Tiene Jurisdicción",
    },
    statusDescription: {
      en: "We transferred your Form I-539 to another office. Processing continues there; you do not need to refile.",
      es: "Transferimos su Formulario I-539 a otra oficina. El procesamiento continúa allí; no necesita volver a presentar la solicitud.",
    },
    history: [],
  },
];

export function getMockUscisCase(receipt: string): UscisCasePayload {
  const digit = Number(receipt.slice(-1));
  const scenario = SCENARIOS[Number.isFinite(digit) ? digit : 0] ?? SCENARIOS[0];

  return {
    ...scenario,
    receiptNumber: receipt,
  };
}
