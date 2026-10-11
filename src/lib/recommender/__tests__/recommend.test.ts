// Perfiles tipo contra una muestra real del catálogo (fixtures/catalogo.json, scripts/analysis/fixture.mts).
import { describe, expect, it } from "vitest";

import { buildCatalog, type ListingRow, type SizeRow } from "../../catalog/build";
import { recommend } from "..";
import type { Answers } from "../questions";
import { USES } from "../questions";
import { DEFAULT_FORMULA } from "../quality";
import { MAX_PER_MODEL } from "../weights";
import fixture from "./fixtures/catalogo.json";

const bikes = buildCatalog(fixture.listing as ListingRow[], fixture.sizes as SizeRow[], DEFAULT_FORMULA);

const profiles: Record<string, Answers> = {
  "principiante gravel 1,70 m, 1.800 €": { uso: "gravel", electrica: "no", presupuesto: 1800, altura: 170, nivel: "empiezo", prioridades: [] },
  "ciudad eléctrica 1,65 m, 3.500 €": { uso: "ciudad", electrica: "si", presupuesto: 3500, altura: 165, nivel: "habitual", prioridades: ["ciudad", "autonomia"] },
  "montaña técnica 1,85 m, 6.000 €, compite": { uso: "montana-tecnica", electrica: "igual", presupuesto: 6000, altura: 185, nivel: "compito", prioridades: ["ligereza"] },
  "carretera cómoda 1,78 m, 4.000 €": { uso: "carretera-comoda", electrica: "no", presupuesto: 4000, altura: 178, nivel: "habitual", prioridades: ["comodidad", "componentes"] },
  "niña de 1,25 m, 600 €": { uso: "infantil", electrica: "no", presupuesto: 600, altura: 125, nivel: "empiezo", prioridades: ["ahorro"] },
};

describe("catálogo", () => {
  it("todas las bicis tienen nota calidad-precio entre 0 y 10", () => {
    for (const b of bikes) {
      expect(b.quality.total).toBeGreaterThanOrEqual(0);
      expect(b.quality.total).toBeLessThanOrEqual(10);
    }
  });
});

describe.each(Object.entries(profiles))("perfil: %s", (_name, answers) => {
  const { results, matched, funnel } = recommend(bikes, answers);

  it("encuentra bicis", () => {
    expect(results.length).toBeGreaterThan(0);
    expect(funnel.altura).toBe(matched);
  });

  it("respeta los filtros duros", () => {
    const use = USES[answers.uso];
    for (const r of results) {
      expect(r.bike.category).toBe(use.category);
      expect(use.disciplines as readonly string[]).toContain(r.bike.specs.discipline);
      expect(r.bike.priceCents).toBeLessThanOrEqual(answers.presupuesto * 110);
      if (answers.electrica !== "igual") expect(r.bike.electric).toBe(answers.electrica === "si");
      expect(r.sizeFit).toBeTruthy();
    }
  });

  it("ordena por puntuación y no repite más de 2 variantes por modelo", () => {
    const scores = results.map((r) => r.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
    const perModel = new Map<number, number>();
    for (const r of results) perModel.set(r.bike.modelId, (perModel.get(r.bike.modelId) ?? 0) + 1);
    expect(Math.max(...perModel.values())).toBeLessThanOrEqual(MAX_PER_MODEL);
  });

  it("explica cada resultado empezando por la talla", () => {
    for (const r of results) {
      expect(r.reasons.length).toBeGreaterThanOrEqual(1);
      expect(r.reasons.length).toBeLessThanOrEqual(3);
      expect(r.reasons[0]).toMatch(/[Tt]alla/);
      expect(r.score).toBeGreaterThan(0);
      expect(r.score).toBeLessThanOrEqual(100);
    }
  });

  it("avisa cuando se pasa del presupuesto", () => {
    for (const r of results.filter((r) => r.overBudget)) expect(r.warnings[0]).toMatch(/por encima/);
  });
});

describe("datos ausentes", () => {
  const answers = profiles["montaña técnica 1,85 m, 6.000 €, compite"];
  const { results } = recommend(bikes, answers, 500);

  it("una bici sin peso no queda por debajo de una idéntica con peso medio", () => {
    const withWeight = results.find((r) => r.bike.weightG !== null);
    expect(withWeight).toBeDefined();
    const base = withWeight!.bike;
    const clone = (weightG: number | null, weightPct: number | null) => ({
      ...base,
      id: base.id + 1e6,
      modelId: base.modelId + 1e6,
      weightG,
      pct: { ...base.pct, weight: weightPct },
    });
    const pair = recommend([clone(null, null), clone(base.weightG, 0.5)], answers).results;
    expect(pair).toHaveLength(2);
    expect(pair[0].score).toBe(pair[1].score);
    const missing = pair.find((r) => r.bike.weightG === null)!;
    expect(missing.parts.ligereza).toBeNull();
    expect(missing.warnings).toContain("La marca no publica el peso.");
  });
});
