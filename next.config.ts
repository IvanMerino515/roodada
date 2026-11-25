import type { NextConfig } from "next";

import { FOTOS, remotePatterns } from "./src/lib/fotosPermitidas";

// Modo prueba (testers, antes del lanzamiento): con ROODADA_MODO_PRUEBA=1 en Vercel, ningún buscador
// indexa nada. Se quita la variable el día del lanzamiento y se vuelve a publicar.
const modoPrueba = process.env.ROODADA_MODO_PRUEBA === "1";

// Seguridad (auditoría del 25-11-2026, M1). La CSP va primero en modo Report-Only: no bloquea nada,
// solo avisa (consola del navegador y /api/csp en los logs de Vercel). Tras una semana sin avisos de
// recursos propios, cambiar la cabecera a «Content-Security-Policy» para que se aplique.
// 'unsafe-inline' en scripts: Next mete scripts en línea y quitarlo exige nonces, que harían dinámicas
// todas las páginas. Si se añade un servicio externo (píxel, vídeo…), añadir aquí su dominio.
const google = ["https://www.googletagmanager.com", "https://*.google-analytics.com", "https://*.analytics.google.com"];
const vercel = ["https://vercel.live", "https://va.vercel-scripts.com"]; // barra de las previews y analítica en pruebas
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${[google[0], ...vercel].join(" ")}`,
  "style-src 'self' 'unsafe-inline'",
  // Las fotos .avif y .svg se cargan sin optimizar, directamente desde la web de la marca
  `img-src 'self' data: blob: ${FOTOS.map((f) => `https://${f.host}`).join(" ")} ${google.join(" ")}`,
  "font-src 'self'",
  "media-src 'self'",
  `connect-src 'self' ${[...google, ...vercel].join(" ")}`,
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
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: seguridad },
      ...(modoPrueba ? [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }] : []),
    ];
  },
  // La dirección de Vercel de producción también sirve la web: se manda a roodada.com (M3). Las previews
  // tienen otras direcciones y siguen funcionando
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "roodada-d4fa.vercel.app" }],
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
    formats: ["image/avif", "image/webp"],
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
