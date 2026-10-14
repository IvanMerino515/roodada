// Perfiles tipo contra una muestra real del catálogo (fixtures/catalogo.json, scripts/analysis/fixture.mts).
import { describe, expect, it } from "vitest";

import { buildCatalog, type ListingRow, type SizeRow } from "../../catalog/build";
import { recommend } from "..";
import type { Answers } from "../questions";
import { USES } from "../questions";
import { DEFAULT_FORMULA } from "../quality";
import { MAX_PER_MODEL, RESULTS } from "../weights";
import fixture from "./fixtures/catalogo.json";

const bikes = buildCatalog(fixture.listing as ListingRow[], fixture.sizes as SizeRow[], DEFAULT_FORMULA);

const profiles: Record<string, Answers> = {
  "principiante gravel 1,70 m, 1.800 €": { uso: "gravel", electrica: "no", presupuesto: 1800, altura: 170, nivel: "novato", prioridades: [] },
  "ciudad eléctrica 1,65 m, 3.500 €": { uso: "ciudad", electrica: "si", presupuesto: 3500, altura: 165, nivel: "avanzado", prioridades: ["ciudad", "autonomia"] },
  "montaña técnica 1,85 m, 6.000 €, experto": { uso: "montana-tecnica", electrica: "igual", presupuesto: 6000, altura: 185, nivel: "experto", prioridades: ["ligereza"] },
  "carretera cómoda 1,78 m, 4.000 €": { uso: "carretera-comoda", electrica: "no", presupuesto: 4000, altura: 178, nivel: "avanzado", prioridades: ["comodidad", "componentes"], entrepierna: 82 },
  "niña de 1,25 m, 600 €": { uso: "infantil", electrica: "no", presupuesto: 600, altura: 125, nivel: "curioso", prioridades: [] },
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
      if (answers.electrica !== "igual" && answers.uso !== "infantil") expect(r.bike.electric).toBe(answers.electrica === "si");
      expect(r.sizeFit).toBeTruthy();
    }
  });

  it("da entre 3 y 5 bicis (o todas si encajan menos)", () => {
    expect(results.length).toBeLessThanOrEqual(RESULTS.max);
    expect(results.length).toBeGreaterThanOrEqual(Math.min(RESULTS.min, matched));
  });

  it("ordena por puntuación y no repite modelo", () => {
    const scores = results.map((r) => r.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
    const perModel = new Map<number, number>();
    for (const r of results) perModel.set(r.bike.modelId, (perModel.get(r.bike.modelId) ?? 0) + 1);
    expect(Math.max(...perModel.values())).toBeLessThanOrEqual(MAX_PER_MODEL);
  });

  it("explica cada resultado: pros empezando por la talla, contras y explicación larga", () => {
    for (const r of results) {
      expect(r.pros.length).toBeGreaterThanOrEqual(1);
      expect(r.pros.length).toBeLessThanOrEqual(4);
      expect(r.pros[0]).toMatch(/[Tt]alla/);
      expect(r.cons.length).toBeLessThanOrEqual(4);
      expect(r.story.length).toBeGreaterThanOrEqual(3);
      expect(r.story.join(" ")).not.toMatch(/undefined|null|NaN/);
      expect(r.score).toBeGreaterThan(0);
      expect(r.score).toBeLessThanOrEqual(100);
    }
  });

  it("avisa cuando se pasa del presupuesto", () => {
    for (const r of results.filter((r) => r.overBudget)) expect(r.cons[0]).toMatch(/por encima/);
  });

  it("ningún pro relativo se repite en dos bicis", () => {
    const relative = results.flatMap((r) => r.pros.filter((p) => /de tus opciones/.test(p)).map((p) => p.split(" (")[0].split(":")[0]));
    expect(new Set(relative).size).toBe(relative.length);
  });
});

describe("datos ausentes", () => {
  const answers = profiles["montaña técnica 1,85 m, 6.000 €, experto"];
  const { results } = recommend(bikes, answers, 500);

  it("una bici sin peso no queda por debajo de una idéntica con peso medio", () => {
    const withWeight = results.find((r) => r.bike.weightG !== null);
    expect(withWeight).toBeDefined();
    const base = withWeight!.bike;
    const clone = (weightG: number | null, weightPct: number | null, n: number) => ({
      ...base,
      id: base.id + 1e6 + n,
      modelId: base.modelId + 1e6 + n,
      weightG,
      pct: { ...base.pct, weight: weightPct },
    });
    const pair = recommend([clone(null, null, 1), clone(base.weightG, 0.5, 2)], answers).results;
    expect(pair).toHaveLength(2);
    expect(pair[0].score).toBe(pair[1].score);
    const missing = pair.find((r) => r.bike.weightG === null)!;
    expect(missing.parts.ligereza).toBeNull();
    expect(missing.cons).toContain("La marca no publica el peso");
  });
});

describe("tipo de Roodador", () => {
  const base: Answers = { uso: "gravel", electrica: "no", presupuesto: 2500, altura: 175, nivel: "novato", prioridades: [] };
  it("el novato prima la comodidad; el experto, componentes y postura deportiva", async () => {
    const { effectivePriorities } = await import("../score");
    expect([...effectivePriorities(base).keys()]).toContain("comodidad");
    const expert = effectivePriorities({ ...base, nivel: "experto" });
    expect(expert.has("componentes")).toBe(true);
    expect(expert.has("rendimiento")).toBe(true);
  });
  it("cambia el orden de los resultados", () => {
    const novato = recommend(bikes, base).results.map((r) => r.bike.id);
    const experto = recommend(bikes, { ...base, nivel: "experto" }).results.map((r) => r.bike.id);
    expect(novato).not.toEqual(experto);
  });
});
