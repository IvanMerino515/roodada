// Comprueba que todas las fotos de la base se pueden mostrar: dice qué webs o rutas faltan en
// src/lib/fotosPermitidas.ts (las que falten no se verán en la web). Ejecutar después de añadir una marca.
// Uso: npx tsx --env-file=.env.local scripts/comprobar-fotos.mts
import { createClient } from "@supabase/supabase-js";

import { FOTOS, fotoPermitida } from "../src/lib/fotosPermitidas";

const db = createClient(
  (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)!,
  (process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
  { auth: { persistSession: false } },
);

const urls: string[] = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await db.from("media").select("source_url").order("id").range(from, from + 999);
  if (error) throw new Error(`media: ${error.message}`);
  urls.push(...data.map((m) => m.source_url as string).filter(Boolean));
  if (data.length < 1000) break;
}

// Agrupa las que faltan: por web si falta entera; si la web está con rutas, por las dos primeras carpetas
const faltan = new Map<string, { n: number; ejemplo: string }>();
for (const url of urls) {
  if (fotoPermitida(url)) continue;
  let clave = url;
  try {
    const u = new URL(url);
    const conRutas = FOTOS.some((f) => f.host === u.hostname && f.rutas);
    clave = conRutas ? u.hostname + u.pathname.split("/").slice(0, 3).join("/") : u.hostname;
  } catch {}
  const f = faltan.get(clave) ?? { n: 0, ejemplo: url };
  f.n++;
  faltan.set(clave, f);
}

console.log(`${urls.length} fotos en la base · ${urls.length - [...faltan.values()].reduce((s, f) => s + f.n, 0)} se pueden mostrar`);
if (faltan.size === 0) {
  console.log("Todas las fotos están permitidas.");
} else {
  console.log("\nFaltan en src/lib/fotosPermitidas.ts (web + ruta · fotos · ejemplo):");
  for (const [clave, f] of [...faltan].sort((a, b) => b[1].n - a[1].n)) console.log(`- ${clave} · ${f.n} · ${f.ejemplo}`);
  console.log("\nSi es la web propia de una marca, añade { host }. Si es un dominio compartido (Shopify, Google…), añade solo su ruta en `rutas`.");
}
