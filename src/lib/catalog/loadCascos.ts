import "server-only";
import { cacheLife, cacheTag } from "next/cache";

import { selectAll } from "../supabase/server";

// Listado de cascos: mismo origen que el de bicis (variant_listing, solo versiones publicadas) más su estado
// de seguridad (safety_display). Nunca se mezcla con getCatalog(): los cascos no entran en el recomendador
// ni en el comparador de bicis. null = la fuente no da el dato; nunca se inventa.

const CATEGORIA = "accesorio-cascos";
const LISTING_COLUMNS =
  "variant_id,slug,variant_name,model_id,model_name,brand_name,brand_slug,category_slug,model_year," +
  "best_final_price_cents,in_stock_offers,main_image_url,official_url,specs";
const SAFETY_COLUMNS =
  "variant_id,style,vt_stars,vt_star_score,vt_test_year,wg11_bric_score,certifications,technologies," +
  "evidence_status,evidence_source_code,transparency_note";

export type HelmetListingRow = {
  variant_id: number;
  slug: string;
  variant_name: string;
  model_id: number;
  model_name: string;
  brand_name: string;
  brand_slug: string;
  category_slug: string;
  model_year: number | null;
  best_final_price_cents: number | null;
  in_stock_offers: number;
  main_image_url: string | null;
  official_url: string | null;
  specs: Record<string, unknown> | null;
};

export type HelmetSafetyRow = {
  variant_id: number;
  style: string | null;
  vt_stars: number | null;
  vt_star_score: number | null;
  vt_test_year: number | null;
  wg11_bric_score: number | null;
  certifications: string[] | null;
  technologies: string[] | null;
  evidence_status: string | null;
  evidence_source_code: string | null;
  transparency_note: string | null;
};

export type HelmetStyle = "Road" | "Mountain" | "Urban" | "E-bike" | "Commuter" | "BMX" | "Other";

export type Helmet = {
  id: number;
  slug: string;
  name: string;
  modelId: number;
  modelName: string;
  brand: string;
  brandSlug: string;
  modelYear: number | null;
  /** 0 si no hay oferta con precio (igual que en las bicis) */
  priceCents: number;
  inStock: boolean;
  imageUrl: string | null;
  officialUrl: string | null;
  style: HelmetStyle | null;
  hasLight: boolean | null;
  safety: {
    /** Fuente que manda según la jerarquía de safety_display (VT_STAR > OTHER_LAB > WG11 > CERT_ONLY); null = sin datos */
    sourceCode: string | null;
    status: string | null;
    note: string | null;
    vtStars: number | null;
    vtStarScore: number | null;
    vtTestYear: number | null;
    wg11BricScore: number | null;
    certifications: string[];
    technologies: string[];
  };
};

const ESTILOS = new Set<HelmetStyle>(["Road", "Mountain", "Urban", "E-bike", "Commuter", "BMX", "Other"]);

/** Une listado y seguridad. Función pura: se prueba sin base de datos. Solo entran filas de cascos. */
export function buildHelmets(rows: HelmetListingRow[], safetyRows: HelmetSafetyRow[]): Helmet[] {
  const safetyById = new Map(safetyRows.map((s) => [s.variant_id, s]));
  return rows
    .filter((r) => r.category_slug === CATEGORIA)
    .map((r) => {
      const s = safetyById.get(r.variant_id);
      const specs = r.specs ?? {};
      const style = (s?.style ?? specs.style) as HelmetStyle | undefined;
      return {
        id: r.variant_id,
        slug: r.slug,
        name: r.variant_name,
        modelId: r.model_id,
        modelName: r.model_name,
        brand: r.brand_name,
        brandSlug: r.brand_slug,
        modelYear: r.model_year,
        priceCents: r.best_final_price_cents ?? 0,
        inStock: r.in_stock_offers > 0 && r.best_final_price_cents !== null,
        imageUrl: r.main_image_url,
        officialUrl: r.official_url,
        style: style && ESTILOS.has(style) ? style : null,
        hasLight: typeof specs.has_light === "boolean" ? specs.has_light : null,
        safety: {
          sourceCode: s?.evidence_source_code ?? null,
          status: s?.evidence_status ?? null,
          note: s?.transparency_note ?? null,
          vtStars: s?.vt_stars ?? null,
          vtStarScore: s?.vt_star_score ?? null,
          vtTestYear: s?.vt_test_year ?? null,
          wg11BricScore: s?.wg11_bric_score ?? null,
          certifications: s?.certifications ?? [],
          technologies: s?.technologies ?? [],
        },
      };
    });
}

/** Cascos publicados con su estado de seguridad, en caché. Hoy devuelve [] (ningún casco publicado). */
export async function getCascos(): Promise<Helmet[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalogo", "cascos");
  const rows = await selectAll<HelmetListingRow>("variant_listing", LISTING_COLUMNS, "variant_id", 1000, {
    category_slug: CATEGORIA,
  });
  if (rows.length === 0) return [];
  const safety = await selectAll<HelmetSafetyRow>("safety_display", SAFETY_COLUMNS, "variant_id", 1000, {
    is_published: true,
  });
  return buildHelmets(rows, safety);
}
