// Modelo de datos de la web. Es una versión compacta de variant_listing + variant_sizes
// (ver docs/data/ANALISIS.md). null = la marca no publica el dato; nunca se inventa.

export type Category = "bici-carretera" | "bici-gravel" | "bici-mtb" | "bici-urbana" | "bici-infantil";

export type Discipline =
  | "competicion" | "aero" | "endurance" | "triatlon" | "ciclocross" | "gravel"
  | "xc" | "trail" | "enduro" | "descenso" | "dirt" | "fat"
  | "urbana" | "trekking" | "cargo" | "infantil";

export type Specs = {
  discipline: Discipline;
  groupset: string | null;
  groupsetBrand: string | null;
  shifting: "mecanico" | "electronico" | null;
  speeds: number | null;
  drivetrain: string | null;
  brakes: string | null;
  suspension: "rigida" | "delantera" | "doble" | null;
  travelFrontMm: number | null;
  travelRearMm: number | null;
  wheelSize: string | null;
  tyreWidthMm: number | null;
  maxTyreWidthMm: number | null;
  tubeless: boolean | null; // en origen solo se marca cuando es true
  dropperPost: boolean;
  batteryWh: number | null;
  motorBrand: string | null;
  motorTorqueNm: number | null;
  lights: boolean;
  fenders: boolean;
  rack: boolean;
  kickstand: boolean;
};

export type Size = {
  label: string;
  order: number;
  heightMin: number | null;
  heightMax: number | null;
  heightSource: "oficial" | "estimado" | null;
  stackMm: number | null;
  reachMm: number | null;
};

export type Bike = {
  id: number;
  slug: string;
  name: string;
  modelId: number;
  modelName: string;
  brand: string;
  brandSlug: string;
  category: Category;
  electric: boolean;
  frameMaterial: string | null;
  weightG: number | null;
  modelYear: number | null;
  priceCents: number;
  inStock: boolean;
  imageUrl: string;
  officialUrl: string;
  specs: Specs;
  sizes: Size[];
  /** Gama del grupo 1–5 (tiers.ts); null si no se puede deducir */
  tier: number | null;
  /** Percentiles dentro de su cohorte (categoría + eléctrica), 0 = mínimo, 1 = máximo */
  pct: { price: number; weight: number | null; tyre: number | null; battery: number | null };
  /** Nota calidad-precio 0–10 (quality.ts) */
  quality: QualityScore;
};

export type QualityScore = {
  total: number;
  partials: Record<string, number | null>;
  /** Parte del peso de la fórmula cubierta con datos reales (0–1) */
  coverage: number;
  formulaVersion: number;
};
