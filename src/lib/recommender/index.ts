// recommend(): filtros duros → puntuación → orden → una versión por modelo → de 3 a 5 → pros y contras.
import type { Bike } from "../catalog/types";
import { explainAll, type Explanation } from "./explain";
import { filterCandidates, funnelCounts } from "./filters";
import type { Answers } from "./questions";
import { scoreCandidates, type Scored } from "./score";
import { MAX_PER_MODEL, RESULTS } from "./weights";

export type Recommendation = Scored & Explanation;

export type RecommendResult = {
  results: Recommendation[];
  /** Bicis que pasan los filtros, antes de limitar por modelo */
  matched: number;
  funnel: Record<string, number>;
};

/** `limit` por encima de RESULTS.max desactiva el recorte (lo usan las pruebas para ver todas). */
export function recommend(bikes: Bike[], answers: Answers, limit: number = RESULTS.max): RecommendResult {
  const scored = scoreCandidates(filterCandidates(bikes, answers), answers).sort(
    (x, y) => y.score - x.score || x.bike.priceCents - y.bike.priceCents,
  );

  const perModel = new Map<number, number>();
  const picked: Scored[] = [];
  for (const r of scored) {
    const n = perModel.get(r.bike.modelId) ?? 0;
    if (n >= MAX_PER_MODEL) continue;
    perModel.set(r.bike.modelId, n + 1);
    picked.push(r);
    if (picked.length >= limit) break;
  }
  // Más allá de la 3.ª, solo las que de verdad compiten con la primera
  const group =
    limit <= RESULTS.max ? picked.filter((r, i) => i < RESULTS.min || r.score >= picked[0].score - RESULTS.maxGap) : picked;

  return { results: explainAll(group, answers), matched: scored.length, funnel: funnelCounts(bikes, answers) };
}

export { answersToSearch, parseAnswers } from "./questions";
