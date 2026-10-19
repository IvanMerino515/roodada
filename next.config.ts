import type { NextConfig } from "next";

// Las fotos se sirven desde la web de cada marca (ninguna bloquea el hotlink, comprobado
// el 2026-10-11 con scripts/analysis/fotos.mts). Next las optimiza y las guarda en caché.
const imageHosts = [
  "bhbikes.b-cdn.net",
  "resources.specialized.com",
  "media.trekbikes.com",
  "contents.mediadecathlon.com",
  "merida-cdn.m-c-g.net",
  "www.orbea.com",
  "embed.widencdn.net",
  "dma.canyon.com",
  "www.canyon.com",
  "www.bianchi.com",
  "www.cannondale.com",
  "static.scott-sports.com", // <-- añadido por edgar
  "file.cube.eu", // <-- añadido por edgar
];

// Modo prueba (testers, antes del lanzamiento): con ROODADA_MODO_PRUEBA=1 en Vercel, ningún buscador
// indexa nada. Se quita la variable el día del lanzamiento y se vuelve a publicar.
const modoPrueba = process.env.ROODADA_MODO_PRUEBA === "1";

const nextConfig: NextConfig = {
  cacheComponents: true,
  async headers() {
    return modoPrueba ? [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }] : [];
  },
  partialPrefetching: true,
  images: {
    remotePatterns: imageHosts.map((hostname) => ({ protocol: "https" as const, hostname })),
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
