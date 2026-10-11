import type { MetadataRoute } from "next";

import { getCatalog } from "@/lib/catalog/load";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const bikes = await getCatalog();
  return [
    { url: `${site}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${site}/guia`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${site}/comparador`, changeFrequency: "daily", priority: 0.8 },
    ...bikes.map((b) => ({ url: `${site}/bici/${b.slug}`, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
