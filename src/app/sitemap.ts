import type { MetadataRoute } from "next";

import { getCatalog, getSlugs } from "@/lib/catalog/load";
import { aLaVenta, allLandings, MIN_BICIS } from "@/lib/landings";

const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, bikes] = await Promise.all([getSlugs(), getCatalog({ sizes: false })]);
  // Marcas con página indexable (las de menos de MIN_BICIS bicis no se indexan)
  const porMarca = new Map<string, number>();
  for (const b of aLaVenta(bikes)) porMarca.set(b.brandSlug, (porMarca.get(b.brandSlug) ?? 0) + 1);
  const marcas = [...porMarca.entries()].filter(([, n]) => n >= MIN_BICIS).map(([s]) => s);
  return [
    { url: `${site}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${site}/guia`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${site}/comparador`, changeFrequency: "daily", priority: 0.8 },
    { url: `${site}/talla-bicicleta`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site}/bicis`, changeFrequency: "weekly", priority: 0.8 },
    ...allLandings(bikes).map((l) => ({ url: `${site}/bicis/${l.ruta.join("/")}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    { url: `${site}/marcas`, changeFrequency: "weekly", priority: 0.7 },
    ...marcas.map((m) => ({ url: `${site}/marcas/${m}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...slugs.map((slug) => ({ url: `${site}/bici/${slug}`, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
