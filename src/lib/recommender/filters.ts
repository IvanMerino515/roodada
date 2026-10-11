// Filtros duros: uso, eléctrica, presupuesto (+ tolerancia), stock y que exista talla.
import type { Bike } from "../catalog/types";
import { BUDGET, USES, type Answers } from "./questions";
import { fitSize, type SizeFit } from "./sizing";

export type Candidate = { bike: Bike; sizeFit: SizeFit; overBudget: boolean };

export function matchesUse(bike: Bike, uso: Answers["uso"]) {
  const use = USES[uso];
  return bike.category === use.category && (use.disciplines as readonly string[]).includes(bike.specs.discipline);
}

export function matchesElectric(bike: Bike, electrica: Answers["electrica"]) {
  return electrica === "igual" || bike.electric === (electrica === "si");
}

export const budgetLimit = (presupuesto: number) => presupuesto * (1 + BUDGET.tolerance);

export function filterCandidates(bikes: Bike[], a: Answers): Candidate[] {
  const limitCents = budgetLimit(a.presupuesto) * 100;
  const out: Candidate[] = [];
  for (const bike of bikes) {
    if (!bike.inStock || !matchesUse(bike, a.uso) || !matchesElectric(bike, a.electrica)) continue;
    if (bike.priceCents > limitCents) continue;
    const sizeFit = fitSize(bike.sizes, a.altura);
    if (!sizeFit) continue;
    out.push({ bike, sizeFit, overBudget: bike.priceCents > a.presupuesto * 100 });
  }
  return out;
}

/** Cuántas bicis quedan tras cada paso de la guía: para el contador en vivo y para no devolver listas vacías */
export function funnelCounts(bikes: Bike[], a: Partial<Answers>) {
  let list = bikes.filter((b) => b.inStock);
  const counts: Record<string, number> = { total: list.length };
  if (a.uso) {
    list = list.filter((b) => matchesUse(b, a.uso!));
    counts.uso = list.length;
  }
  if (a.electrica) {
    list = list.filter((b) => matchesElectric(b, a.electrica!));
    counts.electrica = list.length;
  }
  if (a.presupuesto) {
    list = list.filter((b) => b.priceCents <= budgetLimit(a.presupuesto!) * 100);
    counts.presupuesto = list.length;
  }
  if (a.altura) {
    list = list.filter((b) => fitSize(b.sizes, a.altura!) !== null);
    counts.altura = list.length;
  }
  return counts;
}
