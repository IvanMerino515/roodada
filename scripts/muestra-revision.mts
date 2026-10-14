// Muestra para revisar specs a mano (fase 0): 5 bicis por marca, siempre las mismas (orden fijo por slug),
// con los datos que más pesan en la recomendación y columnas para anotar. Solo lectura.
// Uso: npx tsx --env-file=.env.local scripts/muestra-revision.mts  →  docs/data/revision-specs.csv
import { writeFileSync } from "node:fs";
import { Client } from "pg";

const POR_MARCA = 5;
const c = new Client({ connectionString: process.env.ANALYSIS_DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query("set session characteristics as transaction read only");
const { rows } = await c.query(`
  with l as (
    select *, row_number() over (partition by brand_name order by md5(slug)) n from variant_listing where in_stock_offers > 0
  )
  select l.brand_name, l.model_name, l.variant_name, l.slug, l.best_final_price_cents, l.category_slug, l.is_electric,
         l.frame_material, l.weight_g, l.official_url, l.specs,
         (select string_agg(s.size_label || ' ' || coalesce(s.rider_height_min_cm::text, '?') || '-' || coalesce(s.rider_height_max_cm::text, '?'), ' · ' order by s.rider_height_min_cm nulls last)
            from variant_sizes s where s.variant_id = l.variant_id) tallas,
         (select string_agg(distinct s.rider_height_source, '/') from variant_sizes s where s.variant_id = l.variant_id) fuente
  from l where n <= ${POR_MARCA} order by brand_name, n`);
await c.end();

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[";\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
};
const head = [
  "Marca", "Modelo", "Ficha en Roodada", "Web oficial", "Precio (€)", "Tipo", "Uso", "Eléctrica", "Batería (Wh)",
  "Grupo", "Frenos", "Cuadro", "Suspensión (del./tras. mm)", "Rueda", "Peso (kg)", "Tallas (altura cm)", "Fuente de las alturas",
  "¿Correcto? (sí/no)", "Qué está mal",
];
const lines = rows.map((r) => {
  const s = r.specs ?? {};
  return [
    r.brand_name, r.variant_name?.startsWith(r.model_name) ? r.variant_name : `${r.model_name} ${r.variant_name ?? ""}`.trim(), `/bici/${r.slug}`, r.official_url,
    r.best_final_price_cents ? Math.round(r.best_final_price_cents / 100) : "", r.category_slug, s.discipline,
    r.is_electric ? "sí" : "no", s.battery_wh, s.groupset, s.brakes, r.frame_material,
    `${s.suspension_front_mm ?? "?"}/${s.suspension_rear_mm ?? "?"}`, s.wheel_size,
    r.weight_g ? (r.weight_g / 1000).toFixed(1).replace(".", ",") : "", r.tallas, r.fuente, "", "",
  ].map(cell).join(";");
});
// Punto y coma y BOM: así Excel y Numbers en español lo abren con columnas y acentos bien
writeFileSync("docs/data/revision-specs.csv", "﻿" + [head.join(";"), ...lines].join("\n") + "\n");
console.log(`${rows.length} bicis en docs/data/revision-specs.csv`);
