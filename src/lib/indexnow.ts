// IndexNow: aviso a Bing (y a Yandex, Seznam, Naver…) de las páginas nuevas o cambiadas, para que las
// rastreen enseguida en vez de esperar a pasar por el sitemap. Lo lanza cada día Vercel Cron
// (vercel.json → /api/indexnow). Bing alimenta también a Copilot y a parte de ChatGPT.
//
// La clave es pública por diseño: el fichero public/<CLAVE>.txt demuestra que roodada.com es nuestra.
// Si se cambia, cambiar también el nombre y el contenido de ese fichero.
export const INDEXNOW_KEY = "d7d1b80f7208527f0020e42c99e791ea";
export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
/** Máximo de direcciones por envío que admite IndexNow */
export const INDEXNOW_MAX = 10_000;

/** Cuerpos de los envíos: direcciones absolutas, sin repetir, en tandas de INDEXNOW_MAX */
export function indexNowPayloads(site: string, rutas: Iterable<string>) {
  const base = site.replace(/\/$/, "");
  const host = new URL(base).host;
  const urls = [...new Set([...rutas].map((r) => `${base}${r.startsWith("/") ? r : `/${r}`}`))];
  const tandas: { host: string; key: string; keyLocation: string; urlList: string[] }[] = [];
  for (let i = 0; i < urls.length; i += INDEXNOW_MAX) {
    tandas.push({ host, key: INDEXNOW_KEY, keyLocation: `${base}/${INDEXNOW_KEY}.txt`, urlList: urls.slice(i, i + INDEXNOW_MAX) });
  }
  return tandas;
}
