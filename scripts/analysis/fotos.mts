// Dominios de las fotos y prueba de carga desde fuera (con y sin Referer). Solo lectura.
import { Client } from "pg";
const c = new Client({ connectionString: process.env.ANALYSIS_DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query("set session characteristics as transaction read only");
const { rows: hosts } = await c.query(`select substring(source_url from '^https?://([^/]+)') host, count(*) n from media group by 1 order by 2 desc`);
console.table(hosts);
const { rows: sample } = await c.query(`select distinct on (brand_slug) brand_slug, main_image_url from variant_listing order by brand_slug, variant_id`);
for (const r of sample) {
  const probe = async (headers: Record<string, string>) => {
    try {
      const res = await fetch(r.main_image_url, { headers, redirect: "follow", signal: AbortSignal.timeout(10000) });
      return `${res.status} ${res.headers.get("content-type")} ${res.headers.get("content-length") ?? "?"}B`;
    } catch (e) { return `error ${(e as Error).message}`; }
  };
  console.log(r.brand_slug.padEnd(12), "| sin referer:", await probe({}), "| referer ajeno:", await probe({ Referer: "https://roodada.vercel.app/" }));
}
await c.end();
