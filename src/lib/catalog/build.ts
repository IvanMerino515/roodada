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
  best_final_price_cents: number | null;
  in_stock_offers: number;
  main_image_url: string;
  official_url: string;
  specs: Record<string, unknown> | null;
};

/** Peso estimado de `variants` (scripts/catalogo/modelo_peso.py en la base de datos) */
export type WeightEstimateRow = {
  id: number;
  weight_estimated_g: number | null;
  weight_estimate_label: string | null;
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
  standover_mm: unknown;
};

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : null);

const SYSTEMS = ["di2", "axs", "eps", "electronico_otro"] as const;
// specs.shifting = sistema (mecanico, di2, axs, eps, electronico_otro); specs.shifting_type = tipo (mecanico, electronico)
function mapShifting(s: Record<string, unknown>): Pick<Specs, "shifting" | "shiftingSystem"> {
  const sys = str(s.shifting);
  const type = str(s.shifting_type) ?? (sys === null ? null : sys === "mecanico" ? "mecanico" : "electronico");
  return {
    shifting: type === "mecanico" || type === "electronico" ? type : null,
    shiftingSystem: (SYSTEMS as readonly string[]).includes(sys ?? "") ? (sys as Specs["shiftingSystem"]) : null,
  };
}

/**
 * Campos de `specs` que lee mapSpecs. La carga pide solo estos (specs trae 45 campos y algunos, como
 * el motor, ocupan más de 1 KB por bici). Si mapSpecs lee un campo nuevo, añádelo aquí.
 */
export const SPEC_KEYS = [
  "discipline", "groupset", "groupset_brand", "shifting", "shifting_type", "speeds", "drivetrain", "brakes",
  "suspension", "suspension_front_mm", "suspension_rear_mm", "wheel_size", "tyre_width_mm", "max_tyre_width_mm",
  "tubeless_ready", "dropper_post", "battery_wh", "lights", "fenders", "rack", "kickstand",
] as const;
/** Del motor solo se usan marca y par */
export const MOTOR_KEYS = ["brand", "torque_nm"] as const;

/** Columnas de PostgREST para pedir esos campos sueltos: sp_discipline:specs->discipline, … */
export const SPEC_COLUMNS = [
  ...SPEC_KEYS.map((k) => `sp_${k}:specs->${k}`),
  ...MOTOR_KEYS.map((k) => `sp_motor_${k}:specs->motor->${k}`),
].join(",");

/** Vuelve a juntar los campos sueltos (sp_*) en el objeto specs que espera mapSpecs */
export function foldSpecs(row: Record<string, unknown>): Record<string, unknown> | null {
  const specs: Record<string, unknown> = {};
  const motor: Record<string, unknown> = {};
  for (const k of SPEC_KEYS) if (row[`sp_${k}`] != null) specs[k] = row[`sp_${k}`];
  for (const k of MOTOR_KEYS) if (row[`sp_motor_${k}`] != null) motor[k] = row[`sp_motor_${k}`];
  if (Object.keys(motor).length) specs.motor = motor;
  return Object.keys(specs).length ? specs : null;
}

export function mapSpecs(raw: Record<string, unknown> | null): Specs {
  const s = raw ?? {};
  const motor = (s.motor ?? {}) as Record<string, unknown>;
  return {
    discipline: (str(s.discipline) ?? "urbana") as Specs["discipline"],
    groupset: str(s.groupset),
    groupsetBrand: str(s.groupset_brand),
    ...mapShifting(s),
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
    standoverMm: num(r.standover_mm),
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

/** Lo mínimo de cada bici para las distribuciones por cohorte (categoría + eléctrica) */
export type CohortRow = Pick<Bike, "category" | "electric" | "priceCents" | "weightG"> & {
  tyreWidthMm: number | null;
  batteryWh: number | null;
};
/** Valores ordenados por cohorte: con ellos se sacan los percentiles y la nota calidad-precio */
export type Distributions = Record<string, { price: number[]; weight: number[]; tyre: number[]; battery: number[] }>;

export function cohortDistributions(rows: CohortRow[]): Distributions {
  const cohorts = new Map<string, CohortRow[]>();
  for (const b of rows) {
    const k = cohortKey(b);
    const list = cohorts.get(k);
    if (list) list.push(b);
    else cohorts.set(k, [b]);
  }
  const dist: Distributions = {};
  for (const [k, list] of cohorts) {
    dist[k] = {
      price: sortedValues(list.map((b) => b.priceCents)),
      weight: sortedValues(list.map((b) => b.weightG)),
      tyre: sortedValues(list.map((b) => b.tyreWidthMm)),
      battery: sortedValues(list.map((b) => b.batteryWh)),
    };
  }
  return dist;
}

/** Una fila del listado (con o sin specs) reducida a lo que piden las distribuciones */
export function cohortRow(r: ListingRow): CohortRow {
  const specs = mapSpecs(r.specs);
  return {
    category: r.category_slug as Category,
    electric: r.is_electric,
    priceCents: r.best_final_price_cents ?? 0,
    weightG: r.weight_g,
    tyreWidthMm: specs.tyreWidthMm,
    batteryWh: specs.batteryWh,
  };
}

type BaseBike = Omit<Bike, "pct" | "quality">;

function baseBike(r: ListingRow, sizes: Size[], estimate: Bike["weightEstimate"] | undefined): BaseBike {
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
    // Solo si falta el oficial: la estimación nunca sustituye a un dato de la marca
    weightEstimate: r.weight_g === null ? (estimate ?? null) : null,
    modelYear: r.model_year,
    priceCents: r.best_final_price_cents ?? 0,
    // Sin precio publicado no se puede recomendar por presupuesto: cuenta como no disponible
    inStock: r.in_stock_offers > 0 && r.best_final_price_cents !== null,
    imageUrl: r.main_image_url,
    officialUrl: r.official_url,
    specs,
    sizes: [...sizes].sort(compareSizes),
    tier: groupsetTier(specs.groupset),
  };
}

function finishBike(b: BaseBike, dist: Distributions, formula: QualityFormula): Bike {
  const d = dist[cohortKey(b)] ?? { price: [], weight: [], tyre: [], battery: [] };
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
}

function estimateMap(estimateRows: WeightEstimateRow[]) {
  const estimates = new Map<number, { grams: number; label: string }>();
  for (const e of estimateRows) {
    if (e.weight_estimated_g !== null && e.weight_estimate_label) {
      estimates.set(e.id, { grams: e.weight_estimated_g, label: e.weight_estimate_label });
    }
  }
  return estimates;
}

export function buildCatalog(
  rows: ListingRow[],
  sizeRows: SizeRow[],
  formula: QualityFormula,
  estimateRows: WeightEstimateRow[] = [],
): Bike[] {
  const estimates = estimateMap(estimateRows);
  const sizesByBike = new Map<number, Size[]>();
  for (const r of sizeRows) {
    const list = sizesByBike.get(r.variant_id) ?? [];
    list.push(mapSize(r));
    sizesByBike.set(r.variant_id, list);
  }
  const dist = cohortDistributions(rows.map(cohortRow));
  return rows.map((r) => finishBike(baseBike(r, sizesByBike.get(r.variant_id) ?? [], estimates.get(r.variant_id)), dist, formula));
}

/**
 * Una sola bici, calculada igual que dentro del catálogo entero: las distribuciones de su cohorte
 * vienen ya hechas (getCohortStats), así la ficha no necesita descargar las 4.200 bicis.
 */
export function buildBike(
  row: ListingRow,
  sizeRows: SizeRow[],
  formula: QualityFormula,
  dist: Distributions,
  estimateRows: WeightEstimateRow[] = [],
): Bike {
  return finishBike(baseBike(row, sizeRows.map(mapSize), estimateMap(estimateRows).get(row.variant_id)), dist, formula);
}
