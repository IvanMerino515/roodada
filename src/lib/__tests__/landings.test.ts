// Páginas de entrada y preguntas de la ficha: solo se publica lo que tiene bicis suficientes, y las
// respuestas salen de los datos sin inventar nada
import { describe, expect, it } from "vitest";

import fixture from "../recommender/__tests__/fixtures/catalogo.json";
import { buildCatalog, type ListingRow, type SizeRow } from "../catalog/build";
import { preguntasFicha } from "../fichaPreguntas";
import { aLaVenta, allLandings, findLanding, introLanding, MIN_BICIS, preguntasLanding, resumen } from "../landings";
import { DEFAULT_FORMULA } from "../recommender/quality";

const bikes = buildCatalog(fixture.listing as ListingRow[], fixture.sizes as SizeRow[], DEFAULT_FORMULA);

describe("páginas de tipo", () => {
  it("solo existen las que tienen al menos MIN_BICIS bicis a la venta", () => {
    const sale = aLaVenta(bikes);
    for (const l of allLandings(bikes)) expect(sale.filter(l.filtro).length).toBeGreaterThanOrEqual(MIN_BICIS);
  });

  it("las direcciones son únicas y se encuentran por su ruta", () => {
    const rutas = allLandings(bikes).map((l) => l.ruta.join("/"));
    expect(new Set(rutas).size).toBe(rutas.length);
    for (const r of rutas) expect(findLanding(bikes, r.split("/"))?.ruta.join("/")).toBe(r);
    expect(findLanding(bikes, ["no-existe"])).toBeUndefined();
  });

  it("el resumen cuadra con las bicis y no repite modelo entre las mejores", () => {
    const l = allLandings(bikes)[0];
    const r = resumen(bikes.filter(l.filtro));
    expect(r.total).toBe(aLaVenta(bikes).filter(l.filtro).length);
    expect(r.min).toBeLessThanOrEqual(r.mediana);
    expect(r.mediana).toBeLessThanOrEqual(r.max);
    expect(new Set(r.mejores.map((b) => b.modelId)).size).toBe(r.mejores.length);
    expect(introLanding(l.nombre, r)[0]).toContain(l.nombre);
    expect(preguntasLanding(l.nombre, r).length).toBeGreaterThanOrEqual(3);
  });
});

describe("preguntas de la ficha", () => {
  const bike = aLaVenta(bikes).find((b) => b.sizes.length >= 2)!;

  it("el peso oficial se da como oficial y el estimado como estimado", () => {
    const oficial = preguntasFicha({ ...bike, weightG: 9100, weightEstimate: null }, []).find((p) => p.q.includes("pesa"));
    expect(oficial?.a).toContain(`según ${bike.brand}`);
    const est = preguntasFicha({ ...bike, weightG: null, weightEstimate: { grams: 9100, label: "≈ 9,1 kg ±0,7" } }, []).find((p) => p.q.includes("pesa"));
    expect(est?.a).toContain("no publica el peso");
    expect(preguntasFicha({ ...bike, weightG: null, weightEstimate: null }, []).find((p) => p.q.includes("pesa"))).toBeUndefined();
  });

  it("las alternativas solo aparecen si las hay", () => {
    expect(preguntasFicha(bike, []).some((p) => p.q.includes("alternativas"))).toBe(false);
    const alt = aLaVenta(bikes).find((b) => b.id !== bike.id)!;
    expect(preguntasFicha(bike, [alt]).find((p) => p.q.includes("alternativas"))?.a).toContain(alt.name);
  });
});

describe("páginas de precio y de marca y tipo", () => {
  it("una página de precio tiene menos bicis que su madre y no sale en el menú", async () => {
    const { buildMenu } = await import("../landings");
    const sale = aLaVenta(bikes);
    const all = allLandings(bikes);
    for (const l of all.filter((x) => x.clase === "precio")) {
      const madre = all.find((m) => m.ruta.join("/") === l.ruta.slice(0, -1).join("/"))!;
      expect(sale.filter(l.filtro).length).toBeLessThan(sale.filter(madre.filtro).length);
      expect(sale.filter(l.filtro).every((b) => b.priceCents <= (l.precio ?? 0) * 100)).toBe(true);
    }
    const menu = buildMenu(bikes);
    const rutasMenu = menu.tipos.flatMap((t) => [t.path, ...t.subs.map((s) => s.path)]);
    expect(rutasMenu.some((r) => r.includes("menos-de-"))).toBe(false);
  });

  it("una página de marca y tipo nunca tiene todas las bicis de la marca", async () => {
    const { marcaTipoLandings } = await import("../landings");
    const sale = aLaVenta(bikes);
    for (const l of marcaTipoLandings(bikes)) {
      expect(l.n).toBeGreaterThanOrEqual(MIN_BICIS);
      expect(l.n).toBeLessThan(sale.filter((b) => b.brandSlug === l.slug).length);
    }
  });
});
