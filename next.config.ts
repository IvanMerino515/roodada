import type { NextConfig } from "next";

import { FOTOS, remotePatterns } from "./src/lib/fotosPermitidas";
import { MODO_PRUEBA } from "./src/lib/site";

// Sin indexar en las previews de Vercel (y en local con ROODADA_MODO_PRUEBA=1); producción, siempre. Ver src/lib/site.ts
const modoPrueba = MODO_PRUEBA;

// Seguridad (auditoría del 25-11-2026, M1). La CSP va primero en modo Report-Only: no bloquea nada,
// solo avisa (consola del navegador y /api/csp en los logs de Vercel). Tras una semana sin avisos de
// recursos propios, cambiar la cabecera a «Content-Security-Policy» para que se aplique.
// 'unsafe-inline' en scripts: Next mete scripts en línea y quitarlo exige nonces, que harían dinámicas
// todas las páginas. Si se añade un servicio externo (píxel, vídeo…), añadir aquí su dominio.
const google = ["https://www.googletagmanager.com", "https://*.google-analytics.com", "https://*.analytics.google.com"];
const vercel = ["https://vercel.live", "https://va.vercel-scripts.com"]; // barra de las previews y analítica en pruebas
// Afiliación: Skimlinks (solo con consentimiento) y la verificación de AvantLink (temporal, en la portada)
const afiliacion = ["https://s.skimresources.com", "https://*.skimresources.com", "https://sl-sentry.skimlinks.com", "https://classic.avantlink.com"];
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${[google[0], ...vercel, ...afiliacion].join(" ")}`,
  "style-src 'self' 'unsafe-inline'",
  // Las fotos .avif y .svg se cargan sin optimizar, directamente desde la web de la marca
  `img-src 'self' data: blob: ${FOTOS.map((f) => `https://${f.host}`).join(" ")} ${[...google, ...afiliacion].join(" ")}`,
  "font-src 'self'",
  "media-src 'self'",
  `connect-src 'self' ${[...google, ...vercel, ...afiliacion].join(" ")}`,
  "frame-src https://vercel.live",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "report-uri /api/csp",
].join("; ");

const seguridad = [
  { key: "Content-Security-Policy-Report-Only", value: csp },
  // Nadie puede meter Roodada en un iframe (suplantación, clics engañosos)
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // A las tiendas solo les llega «roodada.com», nunca la dirección con las respuestas de la guía
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  // VPS (26-11-2026): servidor autónomo en .next/standalone (scripts/vps/deploy.sh). Un solo proceso que
  // guarda en memoria el catálogo y las páginas: 256 MB en vez de 50 para que quepan las fichas visitadas
  output: "standalone",
  cacheMaxMemorySize: 256 * 1024 * 1024,
  // Compilación suave con Supabase (26-11-2026): 2 procesos en vez de uno por núcleo, menos páginas a la vez
  // y reintento si una página falla. Cada proceso carga el catálogo: con 7 a la vez Supabase cortaba consultas
  experimental: {
    cpus: 2,
    staticGenerationMaxConcurrency: 4,
    staticGenerationRetryCount: 2,
  },
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: seguridad },
      ...(modoPrueba ? [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }] : []),
    ];
  },
  // En producción, cualquier dirección *.vercel.app (roodada-d4fa, roodada-dhth…) se manda a roodada.com
  // (M3): evita copias indexables. Solo en la compilación de producción: las previews siguen funcionando
  async redirects() {
    if (process.env.VERCEL_ENV !== "production") return [];
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "(?<sub>.+)\\.vercel\\.app" }],
        destination: "https://roodada.com/:path*",
        permanent: true,
      },
    ];
  },
  partialPrefetching: true,
  images: {
    // Solo las webs de las marcas y, en dominios compartidos, solo su ruta (src/lib/fotosPermitidas.ts)
    remotePatterns,
    qualities: [75],
    // Solo WebP (26-11-2026): Cloudflare gratis guarda una versión por dirección y no distingue por el
    // navegador (Vary: Accept), así que con AVIF un navegador antiguo podría recibir un formato que no lee
    formats: ["image/webp"],
    // Las fotos de catálogo cambian poco: 31 días reduce las transformaciones en Vercel
    minimumCacheTTL: 2678400,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
