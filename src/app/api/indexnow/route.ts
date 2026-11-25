// Aviso diario a IndexNow (ver src/lib/indexnow.ts). Lo llama Vercel Cron una vez al día (vercel.json).
// Avisa de las fichas nuevas, con datos cambiados o con precio cambiado en las últimas VENTANA_H horas,
// de la página de su marca y de las páginas de entrada principales.
//
// Protegido con CRON_SECRET (variable de Vercel): Vercel Cron manda «Authorization: Bearer <CRON_SECRET>».
// Sin la variable no hace nada, para que nadie pueda lanzar avisos en nuestro nombre. Solo en producción.
import { connection } from "next/server";

import { getCatalog } from "@/lib/catalog/load";
import { INDEXNOW_ENDPOINT, indexNowPayloads } from "@/lib/indexnow";
import { supabase } from "@/lib/supabase/server";

/** Horas hacia atrás: un poco más de un día, por si el cron se retrasa */
const VENTANA_H = 26;
const PRINCIPALES = ["/", "/bicis", "/marcas", "/comparador"];

export async function GET(request: Request) {
  // Siempre en cada petición: sin esto, Next podría generar la respuesta al compilar (sin la variable)
  await connection();
  const secreto = process.env.CRON_SECRET;
  if (!secreto) return Response.json({ error: "Falta CRON_SECRET en Vercel" }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secreto}`) return new Response(null, { status: 401 });
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    return Response.json({ omitido: "solo se avisa desde producción" });
  }

  const desde = new Date(Date.now() - VENTANA_H * 3600_000).toISOString();
  const [slugsCambiados, bicis] = await Promise.all([cambiadas(desde), getCatalog({ sizes: false })]);

  // Solo fichas publicadas (una bici retirada daría 404) y la página de su marca
  const publicadas = new Map(bicis.map((b) => [b.slug, b.brandSlug]));
  const rutas = new Set<string>();
  for (const slug of slugsCambiados) {
    const marca = publicadas.get(slug);
    if (!marca) continue;
    rutas.add(`/bici/${slug}`);
    rutas.add(`/marcas/${marca}`);
  }
  if (rutas.size === 0) return Response.json({ avisadas: 0 });
  PRINCIPALES.forEach((r) => rutas.add(r));

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://roodada.com";
  const respuestas: number[] = [];
  for (const cuerpo of indexNowPayloads(site, rutas)) {
    const r = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(cuerpo),
    });
    respuestas.push(r.status);
  }
  // 200 y 202 son correctos (202: clave pendiente de comprobar). Queda en los logs de Vercel
  console.log(`indexnow: ${rutas.size} direcciones · respuestas ${respuestas.join(", ")}`);
  return Response.json({ avisadas: rutas.size, respuestas });
}

/** Slugs de bicis nuevas o cambiadas, o con una oferta nueva o con precio cambiado, desde «desde» */
async function cambiadas(desde: string): Promise<Set<string>> {
  const db = supabase();
  const slugs = new Set<string>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from("variants")
      .select("slug")
      .or(`created_at.gt.${desde},updated_at.gt.${desde}`)
      .order("id")
      .range(from, from + 999);
    if (error) throw new Error(`variants: ${error.message}`);
    data.forEach((v) => v.slug && slugs.add(v.slug));
    if (data.length < 1000) break;
  }
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from("offers")
      .select("variants(slug)")
      .or(`created_at.gt.${desde},price_changed_at.gt.${desde}`)
      .order("id")
      .range(from, from + 999);
    if (error) throw new Error(`offers: ${error.message}`);
    for (const o of data as { variants: { slug: string | null } | { slug: string | null }[] | null }[]) {
      const v = Array.isArray(o.variants) ? o.variants[0] : o.variants;
      if (v?.slug) slugs.add(v.slug);
    }
    if (data.length < 1000) break;
  }
  return slugs;
}
