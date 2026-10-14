// Puntuación 0–100 de cada candidata (docs/data/ANALISIS.md §7).
import type { Answers, PriorityKey } from "./questions";
import { componentsScore } from "./quality";
import { percentile, sortedValues } from "./percentile";
import type { Candidate } from "./filters";
import { standoverClearance, uprightRatio } from "./sizing";
import {
  LEVEL_PRIORITIES, NEUTRAL, OVER_BUDGET_FACTOR, PRIORITY_WEIGHT, SIZE_FIT_SCORE, WEIGHTS,
} from "./weights";

/** "rendimiento" no se elige: es la prioridad implícita de quien compite (lo contrario de comodidad) */
export type ScoreKey = PriorityKey | "rendimiento";

export type Scored = Candidate & {
  score: number;
  /** 0–1 por prioridad; null = sin dato (contó como neutro) */
  parts: Partial<Record<ScoreKey, number | null>>;
  /** Parte del peso de las prioridades con datos reales */
  coverage: number;
  confidence: "alta" | "media" | "baja";
  uprightPct: number | null;
  /** Holgura sobre el tubo con la entrepierna dada (mm); null sin entrepierna o sin standover */
  clearanceMm: number | null;
};

export function effectivePriorities(a: Answers): Map<ScoreKey, number> {
  const level = LEVEL_PRIORITIES[a.nivel];
  const chosen: ScoreKey[] = a.prioridades.length ? a.prioridades : level.base;
  const out = new Map<ScoreKey, number>(chosen.map((k) => [k, PRIORITY_WEIGHT.elegida]));
  for (const k of level.implicitas) {
    // el experto que además pide comodidad: se respeta lo que ha elegido
    if (k === "rendimiento" && out.has("comodidad")) continue;
    if (!out.has(k)) out.set(k, PRIORITY_WEIGHT.implicita);
  }
  return out;
}

const avg = (xs: (number | null)[]) => {
  const v = xs.filter((x): x is number => x !== null);
  return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null;
};

export function scoreCandidates(candidates: Candidate[], a: Answers): Scored[] {
  const priorities = effectivePriorities(a);
  // Comodidad y paso de rueda se comparan con las bicis que compiten por esta respuesta
  const ratios = sortedValues(candidates.map((c) => uprightRatio(c.sizeFit.size)));
  const maxTyres = sortedValues(candidates.map((c) => c.bike.specs.maxTyreWidthMm));

  return candidates.map((c) => {
    const { bike } = c;
    const uprightPct = percentile(ratios, uprightRatio(c.sizeFit.size));
    const parts: Partial<Record<ScoreKey, number | null>> = {};
    for (const key of priorities.keys()) {
      parts[key] = partScore(key, c, a, uprightPct, maxTyres);
    }

    let sum = 0;
    let total = 0;
    let withData = 0;
    for (const [key, w] of priorities) {
      const v = parts[key] ?? null;
      sum += w * (v ?? NEUTRAL);
      total += w;
      if (v !== null) withData += w;
    }
    const prioridades = total ? sum / total : NEUTRAL;
    const coverage = total ? withData / total : 1;

    // Si no pasa por encima del tubo, la talla vale la mitad
    const clearanceMm = standoverClearance(c.sizeFit.size, a.entrepierna);
    const sizeScore = SIZE_FIT_SCORE[c.sizeFit.fit] * (clearanceMm !== null && clearanceMm < 0 ? 0.5 : 1);
    const raw =
      WEIGHTS.talla * sizeScore +
      WEIGHTS.valor * (bike.quality.total / 10) +
      WEIGHTS.prioridades * prioridades;
    const score = Math.round(100 * raw * (c.overBudget ? OVER_BUDGET_FACTOR : 1));

    const confidence =
      coverage >= 0.8 && c.sizeFit.fit === "oficial" ? "alta" : coverage < 0.5 ? "baja" : "media";
    return { ...c, score, parts, coverage, confidence, uprightPct, clearanceMm };
  });
}

function partScore(
  key: ScoreKey,
  { bike }: Candidate,
  a: Answers,
  uprightPct: number | null,
  maxTyres: number[],
): number | null {
  const s = bike.specs;
  switch (key) {
    case "comodidad":
      return uprightPct;
    case "rendimiento":
      return uprightPct === null ? null : 1 - uprightPct;
    case "ligereza":
      return bike.pct.weight === null ? null : 1 - bike.pct.weight;
    case "componentes":
      return componentsScore(bike.tier, s.shifting, s.brakes);
    case "ahorro":
      return Math.max(0, Math.min(1, 1 - bike.priceCents / (a.presupuesto * 100)));
    case "versatilidad":
      return avg([bike.pct.tyre, s.tubeless ? 1 : null, percentile(maxTyres, s.maxTyreWidthMm)]);
    case "autonomia":
      return bike.electric ? bike.pct.battery : null;
    case "ciudad":
      return [s.lights, s.fenders, s.rack, s.kickstand].filter(Boolean).length / 4;
  }
}
