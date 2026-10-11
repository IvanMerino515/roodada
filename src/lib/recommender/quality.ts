// Nota calidad-precio 0–10, con los pesos de score_formulas en Supabase (v1: componentes 0,30 ·
// precio 0,25 · cuadro 0,20 · peso 0,15 · posventa 0,10). Cada parcial va de 0 a 1 y se compara
// con su cohorte (misma categoría y eléctrica o no). Un dato ausente vale 0,5 (neutro) y baja la
// cobertura; "posventa" aún no tiene datos en la base, así que no entra y los demás se reparten su peso.
// En las eléctricas buena parte del precio es motor y batería: "componentes" promedia la gama del
// grupo con el percentil de batería de su cohorte.
import type { QualityScore } from "../catalog/types";

export type QualityWeights = Record<string, number>;
export type QualityFormula = { version: number; weights: QualityWeights };

export const DEFAULT_FORMULA: QualityFormula = {
  version: 1,
  weights: { componentes: 0.3, precio: 0.25, cuadro: 0.2, peso: 0.15, posventa: 0.1 },
};

const NEUTRAL = 0.5;

/** Partes de la fórmula que la base todavía no puede medir para ninguna bici */
const NOT_MEASURED = new Set(["posventa"]);

const FRAME_SCORE: Record<string, number> = { carbono: 1, titanio: 1, aluminio: 0.5, acero: 0.4 };

export type QualityInput = {
  tier: number | null;
  shifting: string | null;
  brakes: string | null;
  frameMaterial: string | null;
  pricePct: number; // 0 = la más barata de su cohorte
  weightPct: number | null; // 0 = la más ligera de su cohorte
  batteryPct?: number | null; // solo eléctricas; 1 = la batería más grande de su cohorte
};

export function componentsScore(tier: number | null, shifting: string | null, brakes: string | null) {
  if (tier === null) return null;
  let s = (tier - 1) / 4;
  if (shifting === "electronico") s += 0.1;
  if (brakes === "disco_hidraulico") s += 0.05;
  return Math.min(1, s);
}

function electricComponents(groupset: number | null, batteryPct: number | null | undefined) {
  if (batteryPct === undefined || batteryPct === null) return groupset;
  return groupset === null ? batteryPct : (groupset + batteryPct) / 2;
}

export function qualityScore(input: QualityInput, formula: QualityFormula = DEFAULT_FORMULA): QualityScore {
  const partials: Record<string, number | null> = {
    componentes: electricComponents(componentsScore(input.tier, input.shifting, input.brakes), input.batteryPct),
    precio: 1 - input.pricePct,
    cuadro: input.frameMaterial ? (FRAME_SCORE[input.frameMaterial] ?? null) : null,
    peso: input.weightPct === null ? null : 1 - input.weightPct,
  };

  let sum = 0;
  let weightUsed = 0;
  let weightWithData = 0;
  for (const [key, w] of Object.entries(formula.weights)) {
    if (NOT_MEASURED.has(key) || !(key in partials)) continue;
    const value = partials[key];
    sum += w * (value ?? NEUTRAL);
    weightUsed += w;
    if (value !== null) weightWithData += w;
  }

  return {
    total: weightUsed ? Math.round((sum / weightUsed) * 100) / 10 : 5,
    partials,
    coverage: weightUsed ? weightWithData / weightUsed : 0,
    formulaVersion: formula.version,
  };
}
