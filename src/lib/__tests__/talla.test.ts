// La calculadora agrupa los 262 nombres de talla en sistemas comparables y no inventa tallas
import { describe, expect, it } from "vitest";

import fixture from "../recommender/__tests__/fixtures/catalogo.json";
import { buildCatalog, type ListingRow, type SizeRow } from "../catalog/build";
import { DEFAULT_FORMULA } from "../recommender/quality";
import { calcularTalla, normalizarTalla } from "../talla";

describe("normalizarTalla", () => {
  it("letras", () => {
    expect(normalizarTalla("MD")).toEqual({ sistema: "letras", label: "M" });
    expect(normalizarTalla("2XL")).toEqual({ sistema: "letras", label: "XXL" });
    expect(normalizarTalla("ML")).toEqual({ sistema: "letras", label: "M/L" });
  });
  it("centímetros, también en milímetros", () => {
    expect(normalizarTalla("56")).toEqual({ sistema: "cm", label: "56 cm" });
    expect(normalizarTalla("56 cm")).toEqual({ sistema: "cm", label: "56 cm" });
    expect(normalizarTalla("560")).toEqual({ sistema: "cm", label: "56 cm" });
  });
  it("pulgadas y talla única", () => {
    expect(normalizarTalla('20"')).toEqual({ sistema: "pulgadas", label: "20″" });
    expect(normalizarTalla("Rueda de 20″")).toEqual({ sistema: "pulgadas", label: "20″" });
    expect(normalizarTalla("OS").label).toBe("Única");
    expect(normalizarTalla("S4")).toEqual({ sistema: "otra", label: "S4" });
  });
});

describe("calcularTalla", () => {
  const bikes = buildCatalog(fixture.listing as ListingRow[], fixture.sizes as SizeRow[], DEFAULT_FORMULA);
  it("los porcentajes de cada sistema suman en torno a 100 y las marcas salen de las bicis", () => {
    const r = calcularTalla(bikes, 175);
    const suma = r.letras.reduce((a, x) => a + x.pct, 0);
    if (r.letras.length) expect(suma).toBeGreaterThanOrEqual(97);
    expect(r.marcas.reduce((a, m) => a + m.n, 0)).toBe(r.total);
  });
  it("una altura imposible no da talla", () => {
    expect(calcularTalla(bikes, 60).total).toBe(0);
  });
});
