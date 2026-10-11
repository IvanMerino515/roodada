// recommend(): filtros duros → puntuación → orden → máximo MAX_PER_MODEL variantes por modelo → razones.
import type { Bike } from "../catalog/types";
import { explain, type Explanation } from "./explain";
import { filterCandidates, funnelCounts } from "./filters";
import type { Answers } from "./questions";
import { scoreCandidates, type Scored } from "./score";
import { MAX_PER_MODEL } from "./weights";

export type Recommendation = Scored & Explanation;

export type RecommendResult = {
  results: Recommendation[];
  /** Bicis que pasan los filtros, antes de limitar por modelo */
  matched: number;
  funnel: Record<string, number>;
};

export function recommend(bikes: Bike[], answers: Answers, limit = 24): RecommendResult {
  const scored = scoreCandidates(filterCandidates(bikes, answers), answers).sort(
    (x, y) => y.score - x.score || x.bike.priceCents - y.bike.priceCents,
  );

  const perModel = new Map<number, number>();
  const results: Recommendation[] = [];
  for (const r of scored) {
    const n = perModel.get(r.bike.modelId) ?? 0;
    if (n >= MAX_PER_MODEL) continue;
    perModel.set(r.bike.modelId, n + 1);
    results.push({ ...r, ...explain(r, answers) });
    if (results.length >= limit) break;
  }

  return { results, matched: scored.length, funnel: funnelCounts(bikes, answers) };
}

export { answersToSearch, parseAnswers } from "./questions";
