// Convierte las filas de Supabase en el catálogo de la web y calcula lo que depende de la
// cohorte (percentiles y nota calidad-precio). Función pura: se prueba sin base de datos.
import { percentile, sortedValues } from "../recommender/percentile";
import { qualityScore, type QualityFormula } from "../recommender/quality";
import { groupsetTier } from "../recommender/tiers";
import type { Bike, Category, Size, Specs } from "./types";

export type ListingRow = {
  variant_id: number;
  slug: string;
  variant_name: string;
  model_id: number;
  model_name: string;
  brand_name: string;
  brand_slug: string;
  category_slug: string;
  is_electric: boolean;
  frame_material: string | null;
  weight_g: number | null;
  model_year: number | null;
  best_final_price_cents: number;
  in_stock_offers: number;
  main_image_url: string;
  official_url: string;
  specs: Record<string, unknown> | null;
};

export type SizeRow = {
  variant_id: number;
  size_label: string;
  sort_order: number;
  rider_height_min_cm: number | null;
  rider_height_max_cm: number | null;
  rider_height_source: string | null;
  stack_mm: number | null;
  reach_mm: number | null;
};

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : null);

export function mapSpecs(raw: Record<string, unknown> | null): Specs {
  const s = raw ?? {};
  const motor = (s.motor ?? {}) as Record<string, unknown>;
  return {
    discipline: (str(s.discipline) ?? "urbana") as Specs["discipline"],
    groupset: str(s.groupset),
    groupsetBrand: str(s.groupset_brand),
    shifting: str(s.shifting) as Specs["shifting"],
    speeds: num(s.speeds),
    drivetrain: str(s.drivetrain),
    brakes: str(s.brakes),
    suspension: str(s.suspension) as Specs["suspension"],
    travelFrontMm: num(s.suspension_front_mm),
    travelRearMm: num(s.suspension_rear_mm),
    wheelSize: str(s.wheel_size),
    tyreWidthMm: num(s.tyre_width_mm),
    maxTyreWidthMm: num(s.max_tyre_width_mm),
    tubeless: s.tubeless_ready === true ? true : null,
    dropperPost: s.dropper_post === true,
    batteryWh: num(s.battery_wh),
    motorBrand: str(motor.brand),
    motorTorqueNm: num(motor.torque_nm),
    lights: s.lights === true,
    fenders: s.fenders === true,
    rack: s.rack === true,
    kickstand: s.kickstand === true,
  };
}

function mapSize(r: SizeRow): Size {
  return {
    label: r.size_label,
    order: r.sort_order,
    heightMin: r.rider_height_min_cm,
    heightMax: r.rider_height_max_cm,
    heightSource: r.rider_height_source === "oficial" || r.rider_height_source === "estimado" ? r.rider_height_source : null,
    stackMm: r.stack_mm,
    reachMm: r.reach_mm,
  };
}

// sort_order no es fiable (103 bicis de Canyon, Orbea y otras lo traen desordenado):
// se ordena por altura del ciclista, luego por stack y, como último recurso, por sort_order.
export function compareSizes(a: Size, b: Size) {
  if (a.heightMin !== null && b.heightMin !== null && a.heightMin !== b.heightMin) return a.heightMin - b.heightMin;
  if (a.stackMm !== null && b.stackMm !== null && a.stackMm !== b.stackMm) return a.stackMm - b.stackMm;
  return a.order - b.order;
}

export const cohortKey = (b: Pick<Bike, "category" | "electric">) => `${b.category}|${b.electric ? "e" : "m"}`;

export function buildCatalog(rows: ListingRow[], sizeRows: SizeRow[], formula: QualityFormula): Bike[] {
  const sizesByBike = new Map<number, Size[]>();
  for (const r of sizeRows) {
    const list = sizesByBike.get(r.variant_id) ?? [];
    list.push(mapSize(r));
    sizesByBike.set(r.variant_id, list);
  }

  const bikes = rows.map((r) => {
    const specs = mapSpecs(r.specs);
    return {
      id: r.variant_id,
      slug: r.slug,
      name: r.variant_name,
      modelId: r.model_id,
      modelName: r.model_name,
      brand: r.brand_name,
      brandSlug: r.brand_slug,
      category: r.category_slug as Category,
      electric: r.is_electric,
      frameMaterial: r.frame_material,
      weightG: r.weight_g,
      modelYear: r.model_year,
      priceCents: r.best_final_price_cents,
      inStock: r.in_stock_offers > 0,
      imageUrl: r.main_image_url,
      officialUrl: r.official_url,
      specs,
      sizes: (sizesByBike.get(r.variant_id) ?? []).sort(compareSizes),
      tier: groupsetTier(specs.groupset),
    };
  });

  // Distribuciones por cohorte para los percentiles
  const cohorts = new Map<string, typeof bikes>();
  for (const b of bikes) {
    const k = cohortKey(b);
    const list = cohorts.get(k);
    if (list) list.push(b);
    else cohorts.set(k, [b]);
  }
  const dist = new Map<string, { price: number[]; weight: number[]; tyre: number[]; battery: number[] }>();
  for (const [k, list] of cohorts) {
    dist.set(k, {
      price: sortedValues(list.map((b) => b.priceCents)),
      weight: sortedValues(list.map((b) => b.weightG)),
      tyre: sortedValues(list.map((b) => b.specs.tyreWidthMm)),
      battery: sortedValues(list.map((b) => b.specs.batteryWh)),
    });
  }

  return bikes.map((b) => {
    const d = dist.get(cohortKey(b))!;
    const pct = {
      price: percentile(d.price, b.priceCents) ?? 0.5,
      weight: percentile(d.weight, b.weightG),
      tyre: percentile(d.tyre, b.specs.tyreWidthMm),
      battery: percentile(d.battery, b.specs.batteryWh),
    };
    const quality = qualityScore(
      {
        tier: b.tier,
        shifting: b.specs.shifting,
        brakes: b.specs.brakes,
        frameMaterial: b.frameMaterial,
        pricePct: pct.price,
        weightPct: pct.weight,
        batteryPct: b.electric ? pct.battery : undefined,
      },
      formula,
    );
    return { ...b, pct, quality };
  });
}
