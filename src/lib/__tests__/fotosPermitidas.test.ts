import { describe, expect, it } from "vitest";

import { FOTOS, fotoPermitida, remotePatterns } from "../fotosPermitidas";

describe("fotos permitidas", () => {
  it("permite cualquier ruta en la web propia de una marca", () => {
    expect(fotoPermitida("https://media.trekbikes.com/image/upload/w_1200/Madone.jpg")).toBe(true);
  });

  it("en dominios compartidos, solo la ruta de nuestras marcas", () => {
    expect(fotoPermitida("https://cdn.shopify.com/s/files/1/0665/9155/5735/files/kona.jpg")).toBe(true);
    expect(fotoPermitida("https://cdn.shopify.com/s/files/1/0000/0000/0001/files/otra.jpg")).toBe(false);
    // Que empiece igual no basta: la ruta tiene que ser una carpeta completa
    expect(fotoPermitida("https://cdn.shopify.com/s/files/1/0665/9155/57350/files/x.jpg")).toBe(false);
    expect(fotoPermitida("https://storage.googleapis.com/otro-bucket/a.jpg")).toBe(false);
  });

  it("rechaza webs desconocidas, http y direcciones rotas", () => {
    expect(fotoPermitida("https://example.com/a.jpg")).toBe(false);
    expect(fotoPermitida("http://media.trekbikes.com/a.jpg")).toBe(false);
    expect(fotoPermitida("no es una url")).toBe(false);
  });

  it("los patrones de Next llevan ruta en todos los dominios compartidos", () => {
    for (const f of FOTOS.filter((f) => f.rutas)) {
      expect(remotePatterns.filter((p) => p.hostname === f.host).every((p) => "pathname" in p)).toBe(true);
    }
    expect(new Set(FOTOS.map((f) => f.host)).size).toBe(FOTOS.length);
  });
});
