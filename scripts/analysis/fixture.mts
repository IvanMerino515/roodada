// Muestra fija del catálogo real (1 de cada 3 bicis) para los tests del recomendador.
// Uso: npx tsx --env-file=.env.local scripts/analysis/fixture.mts
import { writeFileSync } from "node:fs";
import { Client } from "pg";
const KEEP = ["discipline","groupset","groupset_brand","shifting","speeds","drivetrain","brakes","suspension",
  "suspension_front_mm","suspension_rear_mm","wheel_size","tyre_width_mm","max_tyre_width_mm","tubeless_ready",
  "dropper_post","battery_wh","motor","lights","fenders","rack","kickstand"];
const c = new Client({ connectionString: process.env.ANALYSIS_DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query("set session characteristics as transaction read only");
const { rows: listing } = await c.query(`
  select variant_id::int, slug, variant_name, model_id::int, model_name, brand_name, brand_slug, category_slug, is_electric,
         frame_material, weight_g, model_year, best_final_price_cents, in_stock_offers::int, main_image_url, official_url, specs
  from variant_listing where variant_id % 3 = 0 order by variant_id`);
for (const r of listing) r.specs = Object.fromEntries(Object.entries(r.specs ?? {}).filter(([k]) => KEEP.includes(k)));
const { rows: sizes } = await c.query(`
  select variant_id::int, size_label, sort_order, rider_height_min_cm, rider_height_max_cm, rider_height_source, stack_mm, reach_mm,
    (geometry->>'standover_mm')::float as standover_mm
  from variant_sizes where variant_id % 3 = 0 order by id`);
writeFileSync("src/lib/recommender/__tests__/fixtures/catalogo.json", JSON.stringify({ generated: new Date().toISOString().slice(0, 10), listing, sizes }));
console.log(listing.length, "bicis,", sizes.length, "tallas");
await c.end();
