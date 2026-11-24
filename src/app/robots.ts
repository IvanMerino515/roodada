import type { MetadataRoute } from "next";

import { MODO_PRUEBA } from "@/lib/site";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  if (MODO_PRUEBA) return { rules: { userAgent: "*", disallow: "/" } };
  const disallow = ["/ir/", "/api/", "/guia/resultados", "/comparativa"];
  // Buscadores de IA con nombre propio: ya entrarían con «*», pero así queda claro que pueden leer y
  // citar Roodada (ChatGPT, Perplexity, Claude, Gemini y Copilot vía Bing)
  const ia = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "Perplexity-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "Google-Extended", "Bingbot"];
  return {
    rules: [{ userAgent: "*", allow: "/", disallow }, ...ia.map((userAgent) => ({ userAgent, allow: "/", disallow }))],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
