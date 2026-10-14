import { describe, expect, it } from "vitest";

import type { Size } from "../../catalog/types";
import { percentile, sortedValues } from "../percentile";
import { answersToSearch, parseAnswers, usesFor, type Answers } from "../questions";
import { qualityScore } from "../quality";
import { fitSize, standoverClearance } from "../sizing";
import { groupsetTier } from "../tiers";

const size = (label: string, order: number, min: number, max: number, src: Size["heightSource"] = "oficial"): Size => ({
  label, order, heightMin: min, heightMax: max, heightSource: src, stackMm: 580 + order * 20, reachMm: 380 + order * 10, standoverMm: 740 + order * 20,
});

describe("percentile", () => {
  const s = sortedValues([10, 20, 30, 40, 50]);
  it("va de 0 (mínimo) a 1 (máximo)", () => {
    expect(percentile(s, 10)).toBe(0);
    expect(percentile(s, 50)).toBe(1);
    expect(percentile(s, 30)).toBe(0.5);
  });
  it("devuelve null sin dato", () => expect(percentile(s, null)).toBeNull());
});

describe("fitSize", () => {
  const sizes = [size("S", 0, 155, 167), size("M", 1, 168, 178), size("L", 2, 176, 186, "estimado"), size("XL", 3, 192, 200)];
  it("talla oficial cuando la altura cae en un solo rango", () => {
    expect(fitSize(sizes, 165)).toMatchObject({ fit: "oficial", size: { label: "S" } });
  });
  it("talla estimada cuando el rango es estimado", () => {
    expect(fitSize(sizes, 184)).toMatchObject({ fit: "estimada", size: { label: "L" } });
  });
  it("entre tallas cuando dos rangos se solapan, la más centrada primero", () => {
    expect(fitSize(sizes, 177)).toMatchObject({ fit: "entre", size: { label: "M" }, alternative: { label: "L" } });
  });
  it("entre tallas en un hueco entre dos tallas, la más cercana primero", () => {
    expect(fitSize(sizes, 189)).toMatchObject({ fit: "entre", size: { label: "L" }, alternative: { label: "XL" } });
    // Hueco ancho, como en las tablas de BH (157 → 169): sigue siendo entre tallas, no "sin talla"
    const bh = [size("XS", 0, 150, 157), size("SM", 1, 169, 172)];
    expect(fitSize(bh, 163)).toMatchObject({ fit: "entre", size: { label: "XS" }, alternative: { label: "SM" } });
    expect(fitSize(bh, 166)).toMatchObject({ fit: "entre", size: { label: "SM" }, alternative: { label: "XS" } });
  });
  it("fuera de la tabla, solo a menos de 3 cm", () => {
    expect(fitSize(sizes, 202)).toMatchObject({ fit: "entre", size: { label: "XL" } });
  });
  it("no encaja si está lejos de toda la tabla", () => {
    expect(fitSize(sizes, 140)).toBeNull();
    expect(fitSize(sizes, 210)).toBeNull();
  });
  it("con entrepierna, entre dos tallas se queda la que deja holgura sobre el tubo", () => {
    // 177 cm: entre M (standover 760) y L (780). Entrepierna 78 cm = 780 mm: la M deja 20 mm, la L 0
    expect(fitSize(sizes, 177, 78)).toMatchObject({ size: { label: "M" } });
    // Si la M (la más centrada) no deja holgura y la L sí, cambia a la L
    const tall = sizes.map((s) => (s.label === "M" ? { ...s, standoverMm: 800 } : s));
    expect(fitSize(tall, 177, 80)).toMatchObject({ fit: "entre", size: { label: "L" }, alternative: { label: "M" } });
  });
  it("holgura negativa si el tubo queda por encima de la entrepierna", () => {
    expect(standoverClearance(size("M", 1, 168, 178), 70)).toBe(700 - 760);
    expect(standoverClearance(size("M", 1, 168, 178))).toBeNull();
  });
  it("no encaja sin rangos publicados", () => {
    expect(fitSize([{ ...size("M", 0, 0, 0), heightMin: null, heightMax: null }], 175)).toBeNull();
  });
});

describe("groupsetTier", () => {
  it("ordena las gamas", () => {
    expect(groupsetTier("Shimano Claris")).toBe(1);
    expect(groupsetTier("Shimano 105")).toBe(3);
    expect(groupsetTier("SRAM Red")).toBe(5);
  });
  it("sin línea concreta es dato ausente", () => {
    expect(groupsetTier("Shimano")).toBeNull();
    expect(groupsetTier(null)).toBeNull();
  });
});

describe("qualityScore", () => {
  const base = { tier: 3, shifting: "mecanico", brakes: "disco_hidraulico", frameMaterial: "aluminio", pricePct: 0.5, weightPct: 0.5 };
  it("da una nota de 0 a 10", () => {
    const q = qualityScore(base);
    expect(q.total).toBeGreaterThanOrEqual(0);
    expect(q.total).toBeLessThanOrEqual(10);
    expect(q.coverage).toBe(1);
  });
  it("un dato ausente puntúa neutro y baja la cobertura, no penaliza", () => {
    const sin = qualityScore({ ...base, weightPct: null });
    const medio = qualityScore({ ...base, weightPct: 0.5 });
    expect(sin.total).toBe(medio.total);
    expect(sin.coverage).toBeLessThan(1);
  });
  it("mejor gama al mismo precio, mejor nota", () => {
    expect(qualityScore({ ...base, tier: 4 }).total).toBeGreaterThan(qualityScore(base).total);
  });
  it("más barata con lo mismo, mejor nota", () => {
    expect(qualityScore({ ...base, pricePct: 0.1 }).total).toBeGreaterThan(qualityScore(base).total);
  });
});

describe("respuestas en la URL", () => {
  const a: Answers = { uso: "gravel", electrica: "no", presupuesto: 1500, altura: 172, nivel: "avanzado", prioridades: ["comodidad", "versatilidad"], entrepierna: 81 };
  it("ida y vuelta", () => {
    const params = Object.fromEntries(new URLSearchParams(answersToSearch(a)));
    expect(parseAnswers(params)).toEqual(a);
  });
  it("rechaza respuestas inválidas", () => {
    expect(parseAnswers({ ...Object.fromEntries(new URLSearchParams(answersToSearch(a))), altura: "20" })).toBeNull();
    expect(parseAnswers({ uso: "volar" })).toBeNull();
  });
  it("la entrepierna es opcional", () => {
    const sin: Answers = { ...a, entrepierna: undefined };
    expect(parseAnswers(Object.fromEntries(new URLSearchParams(answersToSearch(sin))))).toMatchObject({ ...sin, entrepierna: undefined });
  });
  it("novato y curioso ven usos amplios; avanzado y experto, los detallados", () => {
    expect(usesFor("novato")).toContain("carretera");
    expect(usesFor("novato")).not.toContain("carretera-rapida");
    expect(usesFor("experto")).toContain("montana-tecnica");
    expect(usesFor("experto")).not.toContain("montana");
  });
  it("como mucho dos prioridades", () => {
    const params = Object.fromEntries(new URLSearchParams(answersToSearch(a)));
    expect(parseAnswers({ ...params, prioridades: "comodidad,ligereza,ahorro" })).toBeNull();
  });
});

describe("compareSizes", () => {
  it("ordena por altura aunque sort_order venga desordenado (caso Canyon)", async () => {
    const { compareSizes } = await import("../../catalog/build");
    const sizes = [size("L", 0, 184, 190), size("2XS", 3, 160, 166), size("M", 6, 178, 184)];
    expect([...sizes].sort(compareSizes).map((s) => s.label)).toEqual(["2XS", "M", "L"]);
  });
});
