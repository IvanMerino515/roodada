import "server-only";
import { cacheLife, cacheTag } from "next/cache";

import { DEFAULT_FORMULA, type QualityFormula } from "../recommender/quality";
import { selectAll, supabase } from "../supabase/server";
import { buildCatalog, type ListingRow, type SizeRow } from "./build";
import type { Bike } from "./types";

const LISTING_COLUMNS =
  "variant_id,slug,variant_name,model_id,model_name,brand_name,brand_slug,category_slug,is_electric," +
  "frame_material,weight_g,model_year,best_final_price_cents,in_stock_offers,main_image_url,official_url,specs";
const SIZE_COLUMNS =
  "variant_id,size_label,sort_order,rider_height_min_cm,rider_height_max_cm,rider_height_source,stack_mm,reach_mm,standover_mm:geometry->standover_mm";

async function loadFormula(): Promise<QualityFormula> {
  const { data, error } = await supabase()
    .from("score_formulas")
    .select("version,weights")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return DEFAULT_FORMULA;
  return { version: data.version, weights: data.weights as Record<string, number> };
}

/** Catálogo completo (≈1.600 bicis) en caché: el recomendador y el comparador trabajan sobre él. */
export async function getCatalog(): Promise<Bike[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalogo");
  const [rows, sizes, formula] = await Promise.all([
    selectAll<ListingRow>("variant_listing", LISTING_COLUMNS, "variant_id"),
    selectAll<SizeRow>("variant_sizes", SIZE_COLUMNS, "id"),
    loadFormula(),
  ]);
  return buildCatalog(rows, sizes, formula);
}

export async function getBike(slug: string): Promise<Bike | undefined> {
  return (await getCatalog()).find((b) => b.slug === slug);
}

export type BikeDetail = {
  photos: { url: string; alt: string | null }[];
  geometryImage: string | null;
  geometry: { label: string; values: Record<string, number | string | null> }[];
  components: { role: string; description: string }[];
  offer: { id: number; url: string; priceCents: number; inStock: boolean; store: string; checkedAt: string } | null;
};

/** Geometría, componentes, fotos y oferta de una bici (solo para la ficha y la comparativa). */
export async function getBikeDetail(id: number): Promise<BikeDetail> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalogo", `bici-${id}`);
  const db = supabase();
  const load = () =>
    Promise.all([
      db.from("media").select("source_url,kind,sort_order,alt_es").eq("variant_id", id).order("sort_order"),
      db.from("variant_sizes").select("size_label,sort_order,geometry,components").eq("variant_id", id).order("sort_order"),
      db.from("variant_components").select("role,description").eq("variant_id", id),
      db.from("offers").select("id,url,final_price_cents,in_stock,is_active,last_checked_at,stores(name)").eq("variant_id", id).eq("is_active", true),
    ]);
  // El build pide las 1.600 fichas a la vez y Supabase a veces responde "Internal server error":
  // se reintenta un par de veces con pausa antes de dar el error (que pararía el build)
  let results = await load();
  for (let attempt = 1; attempt <= 2 && results.some((r) => r.error); attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    results = await load();
  }
  const [media, sizes, components, offers] = results;
  for (const r of results) if (r.error) throw new Error(r.error.message);

  const photos = (media.data ?? []).filter((m) => m.kind === "foto").map((m) => ({ url: m.source_url as string, alt: m.alt_es as string | null }));
  const best = [...(offers.data ?? [])].sort((a, b) => a.final_price_cents - b.final_price_cents)[0];
  const store = best?.stores as { name: string } | { name: string }[] | null | undefined;
  return {
    photos,
    geometryImage: (media.data ?? []).find((m) => m.kind === "geometria")?.source_url ?? null,
    geometry: (sizes.data ?? []).map((s) => ({
      label: s.size_label as string,
      values: { ...((s.geometry ?? {}) as Record<string, number | string | null>), ...((s.components ?? {}) as Record<string, number | null>) },
    })),
    components: (components.data ?? []).filter((c) => c.description) as { role: string; description: string }[],
    offer: best
      ? {
          id: best.id,
          url: best.url,
          priceCents: best.final_price_cents,
          inStock: best.in_stock,
          store: (Array.isArray(store) ? store[0]?.name : store?.name) ?? "Web oficial",
          checkedAt: best.last_checked_at,
        }
      : null,
  };
}
