// Carga el catálogo como la web (publishable key + RLS) y resume lo que llega.
// Uso: npx tsx --env-file=.env.local scripts/comprobar-catalogo.mts
import { createClient } from "@supabase/supabase-js";
import { buildCatalog, type ListingRow, type SizeRow } from "../src/lib/catalog/build";
import { DEFAULT_FORMULA } from "../src/lib/recommender/quality";

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
async function all<T>(table: string, cols: string, order: string) {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from(table).select(cols).order(order).range(from, from + 999);
    if (error) throw new Error(`${table}: ${error.message}`);
    out.push(...(data as T[]));
    if (data.length < 1000) return out;
  }
}
const t0 = Date.now();
const rows = await all<ListingRow>("variant_listing", "variant_id,slug,variant_name,model_id,model_name,brand_name,brand_slug,category_slug,is_electric,frame_material,weight_g,model_year,best_final_price_cents,in_stock_offers,main_image_url,official_url,specs", "variant_id");
const sizes = await all<SizeRow>("variant_sizes", "variant_id,size_label,sort_order,rider_height_min_cm,rider_height_max_cm,rider_height_source,stack_mm,reach_mm", "id");
const f = await db.from("score_formulas").select("version,weights").order("version", { ascending: false }).limit(1).maybeSingle();
const bikes = buildCatalog(rows, sizes, f.data ? { version: f.data.version, weights: f.data.weights } : DEFAULT_FORMULA);
console.log({ bicis: bikes.length, tallas: sizes.length, formula: f.data?.version ?? "por defecto", ms: Date.now() - t0, tipoId: typeof bikes[0].id, kb: Math.round(JSON.stringify(bikes).length / 1024) });
