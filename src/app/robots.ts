import type { MetadataRoute } from "next";

import { MODO_PRUEBA } from "@/lib/site";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  if (MODO_PRUEBA) return { rules: { userAgent: "*", disallow: "/" } };
  const disallow = ["/ir/", "/api/", "/guia/resultados", "/comparativa"];
  // Buscadores e IA con nombre propio (decisión de Iván, 24-11-2026: queremos que nos citen y nos
  // conozcan): los que buscan y enlazan y también los de entrenamiento de las empresas conocidas.
  // Ya entrarían con «*», pero así queda escrito
  const ia = [
    "OAI-SearchBot", "ChatGPT-User", "GPTBot", // OpenAI
    "Claude-SearchBot", "Claude-User", "ClaudeBot", // Anthropic
    "PerplexityBot", "Perplexity-User", // Perplexity
    "Google-Extended", // Gemini (las respuestas con IA del buscador dependen de Googlebot)
    "Bingbot", // Bing y Copilot; ChatGPT también busca en Bing
    "Applebot", "Applebot-Extended", // Siri y Apple Intelligence
  ];
  // Servicios que extraen datos para revenderlos o que no respetan las normas: no traen visitas
  const extractores = ["Bytespider", "Diffbot", "omgili", "omgilibot", "ImagesiftBot", "img2dataset", "DataForSeoBot"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      ...ia.map((userAgent) => ({ userAgent, allow: "/", disallow })),
      ...extractores.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
