import type { MetadataRoute } from "next";

import { MODO_PRUEBA } from "@/lib/site";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  if (MODO_PRUEBA) return { rules: { userAgent: "*", disallow: "/" } };
  const disallow = ["/ir/", "/api/", "/guia/resultados", "/comparativa"];
  // Buscadores e IA que buscan y CITAN con enlace (traen visitas). Decisión de Iván, 26-11-2026: los
  // bots de ENTRENAMIENTO se bloquean (abajo): rastrean miles de fichas, cuestan CPU y base de datos y no
  // traen visitas. Ya entrarían con «*», pero así queda escrito
  const buscadores = [
    "OAI-SearchBot", "ChatGPT-User", // ChatGPT (búsqueda y lo que pide el usuario)
    "Claude-SearchBot", "Claude-User", // Claude
    "PerplexityBot", "Perplexity-User", // Perplexity
    "Bingbot", // Bing y Copilot; ChatGPT también busca en Bing
    "Applebot", // Siri y Spotlight
  ];
  // Entrenamiento de modelos (26-11-2026) y servicios que extraen datos para revenderlos: no traen visitas.
  // Google-Extended y Applebot-Extended no rastrean: solo deciden si lo leído se usa para entrenar
  const bloqueados = [
    "GPTBot", "ClaudeBot", "anthropic-ai", "CCBot", "Google-Extended", "Applebot-Extended",
    "meta-externalagent", "Meta-ExternalAgent", "FacebookBot", "Amazonbot", "cohere-ai", "cohere-training-data-crawler",
    "Bytespider", "Diffbot", "omgili", "omgilibot", "ImagesiftBot", "img2dataset", "DataForSeoBot",
  ];
  // Pausa entre páginas para quien la respeta (Bing, Yandex…; Google no): son 4.500 fichas
  const crawlDelay = 2;
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow, crawlDelay },
      ...buscadores.map((userAgent) => ({ userAgent, allow: "/", disallow, crawlDelay })),
      ...bloqueados.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
