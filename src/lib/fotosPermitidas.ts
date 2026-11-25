// Webs desde las que se sirven las fotos de las bicis (fotos enlazadas desde cada marca; ninguna bloquea
// el hotlink, comprobado el 2026-10-11). Lo usan el optimizador de imágenes (next.config.ts), la CSP
// (img-src, porque las .avif y .svg se cargan sin optimizar) y scripts/comprobar-fotos.mts.
//
// Seguridad (auditoría del 25-11-2026, M2): en los dominios COMPARTIDOS por muchas empresas (Shopify,
// Google Cloud, Storyblok…) se permite solo la ruta de nuestras marcas. Si no, cualquiera con una
// tienda Shopify podría servir sus imágenes desde roodada.com/_next/image y agotar la cuota del plan.
//
// Al añadir una marca: ejecutar `npx tsx --env-file=.env.local scripts/comprobar-fotos.mts`, que dice qué
// web o ruta falta aquí. Si es un dominio compartido, añadir solo la ruta de la marca en `rutas`.

export type WebFotos = { host: string; rutas?: string[] };

export const FOTOS: WebFotos[] = [
  // Webs propias de cada marca: se permite cualquier ruta
  { host: "bhbikes.b-cdn.net" },
  { host: "resources.specialized.com" },
  { host: "media.trekbikes.com" },
  { host: "contents.mediadecathlon.com" },
  { host: "merida-cdn.m-c-g.net" },
  { host: "www.orbea.com" },
  { host: "dma.canyon.com" },
  { host: "www.canyon.com" },
  { host: "www.bianchi.com" },
  { host: "www.cannondale.com" },
  { host: "static.scott-sports.com" },
  { host: "file.cube.eu" },
  { host: "www.cervelo.com" },
  { host: "es.bmc-switzerland.com" },
  { host: "www.santacruzbicycles.com" },
  { host: "images2.giant-bicycles.com" },
  { host: "berriabikes.com" },
  { host: "conorbikes.com" },
  { host: "cdn.mondraker.com" },
  { host: "www.ktm-bikes.at" },
  { host: "images.cyclingfactory.be" },
  { host: "wilier-cdn.thron.com" },
  { host: "api.wilier.com" },
  { host: "www.commencal.com" },
  { host: "cdn.rosebikes.de" },
  { host: "storage.rosebikes.com" },
  { host: "www.bike-discount.de" },
  { host: "www.lookcycle.com" },
  { host: "www.yt-industries.com" },
  { host: "kdnsbikes.com" },
  { host: "www.stevensbikes.de" },
  { host: "www.elvesbikes.co.uk" },
  { host: "resource.pon.bike" }, // Gazelle
  // Dominios compartidos: solo la ruta de cada marca
  {
    host: "cdn.shopify.com",
    rutas: [
      "/s/files/1/0665/9155/5735", // Kona
      "/s/files/1/0747/5861/9183", // Lapierre
      "/s/files/1/0965/1126/3068", // Haibike
      "/s/files/1/0982/3636/7126", // Ghost
      "/s/files/1/0568/3668/5907", // Sava
      "/s/files/1/0550/7858/4542", // Pivot
      "/s/files/1/0722/4360/9902", // 3T
      "/s/files/1/0828/8980/2039", // Colnago
      "/s/files/1/0690/0383/7664", // Avenger
      "/s/files/1/0995/9846/7411", // Lazer
    ],
  },
  { host: "storage.googleapis.com", rutas: ["/argon18craft"] }, // Argon 18
  { host: "a.storyblok.com", rutas: ["/f/263970"] }, // Colnago
  { host: "cdn11.bigcommerce.com", rutas: ["/s-socd7uniqk", "/s-y6rxtt0m81"] },
  { host: "embed.widencdn.net", rutas: ["/img/dorelrl"] }, // Cannondale (Dorel)
  { host: "media.ffycdn.net", rutas: ["/eu/moustache-bikes"] }, // Moustache
];

/** Patrones para images.remotePatterns de Next: «/ruta/**» en los compartidos */
export const remotePatterns = FOTOS.flatMap(({ host, rutas }) =>
  rutas
    ? rutas.map((r) => ({ protocol: "https" as const, hostname: host, pathname: `${r}/**` }))
    : [{ protocol: "https" as const, hostname: host }],
);

/** ¿Se puede mostrar esta foto? (misma regla que remotePatterns) */
export function fotoPermitida(url: string): boolean {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  if (u.protocol !== "https:") return false;
  const web = FOTOS.find((f) => f.host === u.hostname);
  if (!web) return false;
  return !web.rutas || web.rutas.some((r) => u.pathname.startsWith(`${r}/`));
}
