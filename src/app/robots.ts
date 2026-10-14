import type { MetadataRoute } from "next";

import { MODO_PRUEBA } from "@/lib/site";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  if (MODO_PRUEBA) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/ir/", "/api/", "/guia/resultados", "/comparativa"] },
    sitemap: `${site}/sitemap.xml`,
  };
}
