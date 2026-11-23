// El registro de actividad nunca guarda presupuesto ni altura exactos y rechaza lo que no es suyo
import { describe, expect, it } from "vitest";

import { alturaTramo, eventoSchema, presupuestoTramo, rutaLimpia } from "../eventos";

describe("tramos", () => {
  it("presupuesto", () => {
    expect(presupuestoTramo(800)).toBe("<1000");
    expect(presupuestoTramo(1000)).toBe("1000-1999");
    expect(presupuestoTramo(2500)).toBe("2000-2999");
    expect(presupuestoTramo(4999)).toBe("3000-4999");
    expect(presupuestoTramo(12000)).toBe("8000+");
    expect(presupuestoTramo(undefined)).toBeNull();
  });
  it("altura en tramos de 5 cm", () => {
    expect(alturaTramo(170)).toBe("170-174");
    expect(alturaTramo(174)).toBe("170-174");
    expect(alturaTramo(181)).toBe("180-184");
    expect(alturaTramo(null)).toBeNull();
  });
  it("la ruta pierde las respuestas de la dirección", () => {
    expect(rutaLimpia("/guia/resultados?altura=170&presupuesto=1800")).toBe("/guia/resultados");
  });
});

describe("validación de lo que llega", () => {
  it("acepta un evento de la lista", () => {
    expect(eventoSchema.safeParse({ n: "ficha_vista", p: "/bici/x", v: "abc", d: { bici: 1 } }).success).toBe(true);
  });
  it("rechaza eventos inventados y datos demasiado grandes", () => {
    expect(eventoSchema.safeParse({ n: "borrar_todo" }).success).toBe(false);
    expect(eventoSchema.safeParse({ n: "ficha_vista", d: { x: "a".repeat(5000) } }).success).toBe(false);
  });
});
