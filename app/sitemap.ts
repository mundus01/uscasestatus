import type { MetadataRoute } from "next";

import { publicEnv } from "@/lib/env";
import { listExplanations } from "@/lib/explanations";
import { forms, formToPathSlug } from "@/lib/forms";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = publicEnv.siteUrl.replace(/\/$/, "");
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages: { en: `${base}/`, es: `${base}/es` } },
    },
    {
      url: `${base}/es`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages: { en: `${base}/`, es: `${base}/es` } },
    },
  ];

  const hubs = ["/status", "/processing-times", "/insights"] as const;
  for (const path of hubs) {
    entries.push({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: { en: `${base}${path}`, es: `${base}/es${path}` },
      },
    });
  }

  for (const form of forms) {
    const formSlug = formToPathSlug(form.code);
    const formPaths = [
      `/forms/${form.trackerSlug}`,
      `/processing-times/${formSlug}`,
    ];
    for (const path of formPaths) {
      entries.push({
        url: `${base}${path}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: {
          languages: { en: `${base}${path}`, es: `${base}/es${path}` },
        },
      });
    }

    for (const explanation of listExplanations()) {
      const path = `/status/${formSlug}/${explanation.slug}`;
      entries.push({
        url: `${base}${path}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: {
          languages: { en: `${base}${path}`, es: `${base}/es${path}` },
        },
      });
    }
  }

  return entries;
}
