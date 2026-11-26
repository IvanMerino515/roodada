import "server-only";
import { cacheLife, cacheTag } from "next/cache";

import { DEFAULT_FORMULA, type QualityFormula } from "../recommender/quality";
import { selectAll, supabase } from "../supabase/server";
import {
  buildBike, buildCatalog, cohortDistributions, cohortRow, foldSpecs, SPEC_COLUMNS,
  type Distributions, type ListingRow, type SizeRow, type WeightEstimateRow,
} from "./build";
import type { Bike } from "./types";
import { foreignPrice } from "../priceOrigin";

const LISTING_COLUMNS =
  "variant_id,slug,variant_name,model_id,model_name,brand_name,brand_slug,category_slug,is_electric," +
  "frame_material,weight_g,model_year,best_final_price_cents,in_stock_offers,main_image_url,official_url," +
  SPEC_COLUMNS;
const SIZE_COLUMNS =
  "variant_id,size_label,sort_order,rider_height_min_cm,rider_height_max_cm,rider_height_source,stack_mm,reach_mm,standover_mm:geometry->standover_mm";

const ESTIMATE_COLUMNS = "id,weight_estimated_g,weight_estimate_label";

const toListingRow = (r: Record<string, unknown>) => ({ ...r, specs: foldSpecs(r) }) as unknown as ListingRow;

// Durante la compilación muchas fichas piden a la vez y Supabase a veces responde con un error
// pasajero: se reintenta un par de veces con pausa antes de rendirse
async function retry<T extends { error: { message: string } | null }>(load: () => PromiseLike<T>): Promise<T> {
  let r = await load();
  // Mismas pausas que selectAll: 1,5 s, 3 s, 6 s y 12 s (Supabase corta consultas cuando va cargado)
  for (let attempt = 1; attempt <= 4 && r.error; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1500 * 2 ** (attempt - 1)));
    r = await load();
  }
  if (r.error) throw new Error(r.error.message);
  return r;
}

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

/**
 * Precio principal = el de la web oficial de la marca (decisión del 26-11-2026: «al menos de momento»).
 * La vista variant_listing coge la oferta más barata de cualquier tienda; para las pocas bicis que además
 * tienen oferta de otra tienda (Hibike…), se recalcula con solo las de la marca. Si una bici no tiene
 * oferta de la marca, se queda con lo de la vista. Son dos consultas pequeñas.
 */
async function brandPriceOverrides(variantIds?: number[]): Promise<Map<number, { best: number | null; inStock: number }>> {
  const db = supabase();
  // Por páginas de 1.000 (el tope de Supabase) y con los ids en tandas de 200 (una dirección muy larga falla):
  // hoy son pocas, pero crecerán con cada tienda nueva y un fallo aquí tumbaría el catálogo entero
  const others: { variant_id: number }[] = [];
  for (const ids of variantIds ? tandas(variantIds) : [undefined]) {
    for (let from = 0; ; from += 1000) {
      let q = db.from("offers").select("variant_id,stores!inner(kind)").eq("is_active", true).neq("stores.kind", "marca_directa");
      if (ids) q = q.in("variant_id", ids);
      const r = await retry(() => q.order("id").range(from, from + 999));
      others.push(...((r.data ?? []) as { variant_id: number }[]));
      if ((r.data ?? []).length < 1000) break;
    }
  }
  const ids = [...new Set(others.map((o) => o.variant_id))];
  const out = new Map<number, { best: number | null; inStock: number }>();
  if (!ids.length) return out;
  const brandRows: { variant_id: number; final_price_cents: number | null; in_stock: boolean }[] = [];
  for (const t of tandas(ids)) {
    const r = await retry(() =>
      db.from("offers").select("variant_id,final_price_cents,in_stock,stores!inner(kind)").eq("is_active", true).eq("stores.kind", "marca_directa").in("variant_id", t),
    );
    brandRows.push(...((r.data ?? []) as { variant_id: number; final_price_cents: number | null; in_stock: boolean }[]));
  }
  for (const o of brandRows) {
    const cur = out.get(o.variant_id) ?? { best: null, inStock: 0 };
    if (o.in_stock) {
      cur.inStock += 1;
      if (o.final_price_cents !== null && (cur.best === null || o.final_price_cents < cur.best)) cur.best = o.final_price_cents;
    }
    out.set(o.variant_id, cur);
  }
  return out;
}

/** Lista en tandas de 200 (para filtros «in» que van en la dirección de la petición) */
const tandas = <T,>(list: T[], n = 200): T[][] => Array.from({ length: Math.ceil(list.length / n) }, (_, i) => list.slice(i * n, i * n + n));

/** Aplica el precio de la marca a las filas de la vista (ver brandPriceOverrides) */
function withBrandPrice(rows: Record<string, unknown>[], over: Map<number, { best: number | null; inStock: number }>) {
  if (!over.size) return rows;
  return rows.map((r) => {
    const o = over.get(r.variant_id as number);
    return o ? { ...r, best_final_price_cents: o.best, in_stock_offers: o.inStock } : r;
  });
}

/**
 * Catálogo completo (≈4.200 bicis) en caché: el recomendador y el comparador trabajan sobre él.
 * Sin tallas (`sizes: false`) pesa la mitad: el comparador no las usa. Las tallas solo hacen falta
 * para recomendar (guía, contador, "Por qué es para ti").
 */
export async function getCatalog({ sizes = true }: { sizes?: boolean } = {}): Promise<Bike[]> {
  "use cache";
  cacheLife("days");
  cacheTag("catalogo");
  const [raw, sizeRows, formula, estimates, over] = await Promise.all([
    selectAll<Record<string, unknown>>("variant_listing", LISTING_COLUMNS, "variant_id"),
    sizes ? selectAll<SizeRow>("variant_sizes", SIZE_COLUMNS, "id") : Promise.resolve([]),
    getFormula(),
    // Solo las bicis con estimación (unas 1.000 de 4.700 filas)
    selectAll<WeightEstimateRow>("variants", ESTIMATE_COLUMNS, "id", { notNull: "weight_estimated_g" }),
    brandPriceOverrides(),
  ]);
  return buildCatalog(withBrandPrice(raw, over).map(toListingRow), sizeRows, formula, estimates);
}

/**
 * Precio anterior (el tachado que enseña la web oficial) de las ofertas activas y en stock que lo tienen, por variante.
 * Solo cuenta si esa oferta es la más barata de la bici (su precio final = el precio de la bici) y no lleva gastos
 * añadidos: así el descuento se calcula sobre el mismo precio que se enseña. Devuelve { variantId: [precio, anterior] }.
 */
export async function getPreviousPrices(): Promise<Record<number, [number, number]>> {
  "use cache";
  cacheLife("days");
  cacheTag("catalogo");
  const out: Record<number, [number, number]> = {};
  for (let from = 0; ; from += 1000) {
    const { data } = await retry(() =>
      supabase()
        .from("offers")
        .select("variant_id,price_cents,final_price_cents,regular_price_cents")
        .eq("is_active", true)
        .eq("in_stock", true)
        .not("regular_price_cents", "is", null)
        .order("id")
        .range(from, from + 999),
    );
    for (const o of data ?? []) {
      if (o.final_price_cents === o.price_cents && o.regular_price_cents > o.final_price_cents) {
        const prev = out[o.variant_id];
        if (!prev || o.final_price_cents < prev[0]) out[o.variant_id] = [o.final_price_cents, o.regular_price_cents];
      }
    }
    if (!data || data.length < 1000) break;
  }
  return out;
}

/** Fórmula de la nota calidad-precio, en caché aparte para que la ficha no cargue el catálogo */
export async function getFormula(): Promise<QualityFormula> {
  "use cache";
  cacheLife("days");
  cacheTag("catalogo");
  return loadFormula();
}

/**
 * Distribuciones por cohorte (precio, peso, cubierta y batería de todas las bicis), lo único del
 * catálogo que necesita una ficha suelta para su nota calidad-precio. Son 6 columnas por bici en
 * vez de todo el catálogo con tallas.
 */
export async function getCohortStats(): Promise<Distributions> {
  "use cache";
  cacheLife("days");
  cacheTag("catalogo");
  const rows = await selectAll<Record<string, unknown>>(
    "variant_listing",
    "variant_id,category_slug,is_electric,best_final_price_cents,weight_g,sp_tyre_width_mm:specs->tyre_width_mm,sp_battery_wh:specs->battery_wh",
    "variant_id",
  );
  return cohortDistributions(rows.map((r) => cohortRow(toListingRow(r))));
}

/** Las bicis de estos slugs, cada una calculada igual que en el catálogo pero sin descargarlo entero */
async function loadBikes(slugs: string[]): Promise<Bike[]> {
  const db = supabase();
  const [listing, dist, formula] = await Promise.all([
    retry(() => db.from("variant_listing").select(LISTING_COLUMNS).in("slug", slugs)),
    getCohortStats(),
    getFormula(),
  ]);
  const raw = (listing.data ?? []) as unknown as Record<string, unknown>[];
  if (!raw.length) return [];
  const over = await brandPriceOverrides(raw.map((r) => r.variant_id as number));
  const rows = withBrandPrice(raw, over).map(toListingRow);
  const ids = rows.map((r) => r.variant_id);
  const [sizes, estimates] = await Promise.all([
    retry(() => db.from("variant_sizes").select(SIZE_COLUMNS).in("variant_id", ids)),
    retry(() => db.from("variants").select(ESTIMATE_COLUMNS).in("id", ids)),
  ]);
  const sizeRows = (sizes.data ?? []) as unknown as SizeRow[];
  const estimateRows = (estimates.data ?? []) as WeightEstimateRow[];
  const bikes = rows.map((r) => buildBike(r, sizeRows.filter((s) => s.variant_id === r.variant_id), formula, dist, estimateRows));
  // En el orden pedido
  return slugs.map((s) => bikes.find((b) => b.slug === s)).filter((b): b is Bike => !!b);
}

/** Una bici por su slug (ficha, salida a la tienda). Ya no carga el catálogo entero. */
export async function getBike(slug: string): Promise<Bike | undefined> {
  "use cache";
  cacheLife("days");
  cacheTag("catalogo");
  return (await loadBikes([slug]))[0];
}

/**
 * Alternativas a una bici para su ficha: mismo tipo, misma condición de eléctrica, a la venta y con
 * un precio parecido (±25 %). Una por modelo, las mejores por calidad-precio. Sin descargar el catálogo.
 */
export async function getAlternatives(bike: Pick<Bike, "id" | "modelId" | "category" | "electric" | "priceCents" | "specs">, cuantas = 4): Promise<Bike[]> {
  "use cache";
  cacheLife("days");
  cacheTag("catalogo", `bici-${bike.id}`);
  if (!bike.priceCents) return [];
  const db = supabase();
  const [listing, dist, formula] = await Promise.all([
    retry(() =>
      db
        .from("variant_listing")
        .select(LISTING_COLUMNS)
        .eq("category_slug", bike.category)
        .eq("is_electric", bike.electric)
        .gt("in_stock_offers", 0)
        .gte("best_final_price_cents", Math.round(bike.priceCents * 0.75))
        .lte("best_final_price_cents", Math.round(bike.priceCents * 1.25))
        .neq("model_id", bike.modelId)
        .limit(80),
    ),
    getCohortStats(),
    getFormula(),
  ]);
  const rows = ((listing.data ?? []) as unknown as Record<string, unknown>[]).map(toListingRow);
  const ids = rows.map((r) => r.variant_id);
  const estimates = ids.length ? ((await retry(() => db.from("variants").select(ESTIMATE_COLUMNS).in("id", ids))).data ?? []) : [];
  const built = rows.map((r) => buildBike(r, [], formula, dist, estimates as WeightEstimateRow[])).filter((b) => b.inStock);
  // Primero las del mismo subtipo (trail con trail); si no llegan, del mismo tipo
  const same = (b: Bike) => (b.specs.discipline === bike.specs.discipline ? 0 : 1);
  const seen = new Set<number>();
  return built
    .sort((a, b) => same(a) - same(b) || b.quality.total - a.quality.total)
    .filter((b) => (seen.has(b.modelId) ? false : (seen.add(b.modelId), true)))
    .slice(0, cuantas);
}

/** Varias bicis por slug, en ese orden (comparativa) */
export async function getBikes(slugs: string[]): Promise<Bike[]> {
  "use cache";
  cacheLife("days");
  cacheTag("catalogo");
  return slugs.length ? loadBikes(slugs) : [];
}

/** Solo los slugs (sitemap y fichas que se generan al compilar) */
export async function getSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("days");
  cacheTag("catalogo");
  const rows = await selectAll<{ slug: string }>("variant_listing", "slug,variant_id", "variant_id");
  return rows.map((r) => r.slug);
}

export type BikeDetail = {
  photos: { url: string; alt: string | null }[];
  geometryImage: string | null;
  geometry: { label: string; values: Record<string, number | string | null> }[];
  components: { role: string; description: string }[];
  offer: {
    id: number;
    url: string;
    /** Enlace de afiliado de la red (Awin, Belboon…); null mientras la oferta no tenga programa */
    affiliateUrl: string | null;
    /** null: la oferta no tiene precio en € (tienda en $ o £, o la web no lo mostraba) */
    priceCents: number | null;
    inStock: boolean;
    store: string;
    storeSlug: string | null;
    checkedAt: string;
  } | null;
  /** Precio en otra moneda tal cual lo da la tienda («3.449 $»), si no hay precio en € */
  foreignPrice: string | null;
  /** Otras tiendas que no son la web de la marca (Hibike…), una entrada por tienda */
  otherOffers: OtherOffer[];
};

/** Una tienda que no es la web oficial: su mejor precio, las tallas que tiene y la oferta a la que lleva el botón */
export type OtherOffer = {
  /** Oferta a la que lleva «Ver en …» (/ir/[slug]?o=id): la más barata en stock */
  offerId: number;
  storeSlug: string;
  storeName: string;
  /** Precio final (con envío) más barato, en stock si hay alguna en stock */
  priceCents: number | null;
  shippingCents: number;
  inStock: boolean;
  /** Tallas en stock en el orden de la base; null si la tienda no dice qué tallas tiene */
  sizes: string[] | null;
  checkedAt: string;
  url: string;
  affiliateUrl: string | null;
};

/** Geometría, componentes, fotos y oferta de una bici (solo para la ficha y la comparativa). */
export async function getBikeDetail(id: number): Promise<BikeDetail> {
  "use cache";
  cacheLife("days");
  cacheTag("catalogo", `bici-${id}`);
  const db = supabase();
  const load = () =>
    Promise.all([
      db.from("media").select("source_url,kind,sort_order,alt_es").eq("variant_id", id).order("sort_order"),
      db.from("variant_sizes").select("size_label,sort_order,geometry,components").eq("variant_id", id).order("sort_order"),
      db.from("variant_components").select("role,description").eq("variant_id", id),
      db
        .from("offers")
        .select("id,url,affiliate_url,final_price_cents,shipping_cents,in_stock,is_active,last_checked_at,stores(name,slug,kind),variant_sizes(size_label,sort_order)")
        .eq("variant_id", id)
        .eq("is_active", true),
      db.from("variants").select("data_notes").eq("id", id).maybeSingle(),
    ]);
  // El build pide las 1.600 fichas a la vez y Supabase a veces responde "Internal server error":
  // se reintenta un par de veces con pausa antes de dar el error (que pararía el build)
  let results = await load();
  for (let attempt = 1; attempt <= 2 && results.some((r) => r.error); attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    results = await load();
  }
  const [media, sizes, components, offers, variant] = results;
  for (const r of results) if (r.error) throw new Error(r.error.message);

  const photos = (media.data ?? []).filter((m) => m.kind === "foto").map((m) => ({ url: m.source_url as string, alt: m.alt_es as string | null }));
  // La mejor oferta: primero en stock, luego con precio en €, luego la más barata
  const all = (offers.data ?? []) as unknown as OfferRow[];
  // Precio principal: la web oficial de la marca. Si no hay oferta de la marca, la mejor de cualquier tienda
  const brandOffers = all.filter((o) => one(o.stores)?.kind === "marca_directa");
  const best = byRank(brandOffers.length ? brandOffers : all)[0];
  const st = one(best?.stores);
  const otherOffers = groupOtherOffers(all.filter((o) => o !== best && one(o.stores) && one(o.stores)?.kind !== "marca_directa"));
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
          affiliateUrl: (best.affiliate_url as string | null) || null,
          priceCents: best.final_price_cents,
          inStock: best.in_stock,
          store: st?.name ?? "Web oficial",
          storeSlug: st?.slug ?? null,
          checkedAt: best.last_checked_at,
        }
      : null,
    foreignPrice: foreignPrice((variant.data as { data_notes: string | null } | null)?.data_notes ?? null),
    otherOffers,
  };
}

type StoreRef = { name: string; slug: string; kind: string };
type SizeRef = { size_label: string; sort_order: number };

/** PostgREST devuelve la relación como objeto o como lista según el esquema: se toma el primero */
const one = <T,>(v: T | T[] | null | undefined): T | undefined => (Array.isArray(v) ? v[0] : (v ?? undefined));

// La mejor oferta: primero en stock, luego con precio en €, luego la más barata
const rank = (o: { in_stock: boolean; final_price_cents: number | null }) => [o.in_stock ? 0 : 1, o.final_price_cents === null ? 1 : 0, o.final_price_cents ?? 0];
const byRank = <T extends { in_stock: boolean; final_price_cents: number | null }>(list: T[]) =>
  [...list].sort((a, b) => {
    const [x, y] = [rank(a), rank(b)];
    return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
  });

type OfferRow = {
  stores: StoreRef | StoreRef[] | null;
  id: number;
  url: string;
  affiliate_url: string | null;
  final_price_cents: number | null;
  shipping_cents: number;
  in_stock: boolean;
  last_checked_at: string;
  variant_sizes: SizeRef | SizeRef[] | null;
};

/** Agrupa por tienda las ofertas que no son de la marca: una oferta por talla (o una sin talla) → una fila por tienda */
function groupOtherOffers(list: OfferRow[]): OtherOffer[] {
  const groups = new Map<string, OfferRow[]>();
  for (const o of list) {
    const slug = one(o.stores)?.slug;
    if (!slug) continue;
    groups.set(slug, [...(groups.get(slug) ?? []), o]);
  }
  return [...groups.values()]
    .map((g) => {
      const top = byRank(g)[0];
      const store = one(top.stores)!;
      const sized = g.map((o) => ({ o, size: one(o.variant_sizes) }));
      // Si alguna oferta no dice talla, la tienda no indica qué tallas tiene
      const sizes = sized.every((x) => x.size)
        ? [...new Set(sized.filter((x) => x.o.in_stock).sort((a, b) => a.size!.sort_order - b.size!.sort_order).map((x) => x.size!.size_label))]
        : null;
      return {
        offerId: top.id,
        storeSlug: store.slug,
        storeName: store.name,
        priceCents: top.final_price_cents,
        shippingCents: top.shipping_cents,
        inStock: g.some((o) => o.in_stock),
        sizes,
        checkedAt: g.map((o) => o.last_checked_at).sort().at(-1)!,
        url: top.url,
        affiliateUrl: top.affiliate_url || null,
      };
    })
    .sort((a, b) => (a.priceCents ?? Infinity) - (b.priceCents ?? Infinity));
}
