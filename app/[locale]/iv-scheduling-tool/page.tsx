import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { IvSchedulingTool } from "@/components/iv-scheduling/iv-scheduling-tool";

import "../../iv-scheduling.css";

type Props = {
  params: Promise<{ locale: string }>;
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the NVC IV Scheduling Status Tool?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Department of State IV Scheduling Status Tool shows the documentarily complete month and year for which NVC is scheduling most immigrant visa interviews at a selected U.S. embassy or consulate.",
      },
    },
    {
      "@type": "Question",
      name: "How can I estimate my NVC interview wait time?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Compare your documentarily qualified month with the current NVC scheduling cutoff for your visa category and interview post. Historical movement can provide context, but it cannot guarantee an exact interview date.",
      },
    },
    {
      "@type": "Question",
      name: "What does DQ mean at NVC?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DQ means documentarily qualified or documentarily complete, when NVC has received and reviewed the required fees and documents for the immigrant visa case.",
      },
    },
    {
      "@type": "Question",
      name: "Does the Visa Bulletin affect NVC interview scheduling?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Family-sponsored and employment-based preference visa cases also depend on visa availability under the applicable Visa Bulletin category. Immediate Relative visas are not subject to those preference-category numerical limits.",
      },
    },
    {
      "@type": "Question",
      name: "How often does NVC update IV scheduling status?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The U.S. Department of State says the IV Scheduling Status Tool is updated monthly.",
      },
    },
  ],
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "ivScheduling" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function IvSchedulingToolPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ivScheduling");

  return (
    <div className="shell content-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <IvSchedulingTool
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={t("lede")}
      />
    </div>
  );
}
