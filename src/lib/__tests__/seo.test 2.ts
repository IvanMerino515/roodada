// Lo que se le dice a Google: títulos con marca y datos estructurados que no prometen lo que no hay
import { beforeAll, describe, expect, it } from "vitest";

import fixture from "../recommender/__tests__/fixtures/catalogo.json";
import { buildCatalog, type ListingRow, type SizeRow } from "../catalog/build";
import { DEFAULT_FORMULA } from "../recommender/quality";
import { abs, bikeTitle, breadcrumbJsonLd, jsonLdHtml, productJsonLd } from "../seo";

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://roodada.com/";
});

const bike = buildCatalog(fixture.listing as ListingRow[], fixture.sizes as SizeRow[], DEFAULT_FORMULA)[0];

describe("seo", () => {
  it("direcciones completas con el dominio, sin barra doble", () => {
    expect(abs("/bici/x")).toBe("https://roodada.com/bici/x");
    expect(abs("https://cdn.marca.com/foto.jpg")).toBe("https://cdn.marca.com/foto.jpg");
  });

  it("el título lleva la marca", () => {
    expect(bikeTitle({ brand: "Trek", name: "Boone 5", modelYear: 2026 })).toBe("Trek Boone 5 (2026): precio, talla y geometría");
    expect(bikeTitle({ brand: "Trek", name: "Boone 5", modelYear: null })).toBe("Trek Boone 5: precio, talla y geometría");
  });

  it("producto con oferta solo si hay precio en euros y no es «desde»", () => {
    const ok = productJsonLd({ ...bike, priceState: "ok" }, [], { priceCents: 199900, inStock: true, store: "Web oficial" });
    expect(ok.offers).toMatchObject({ price: "1999.00", priceCurrency: "EUR", availability: "https://schema.org/InStock" });
    expect(productJsonLd({ ...bike, priceState: "desde" }, [], { priceCents: 199900, inStock: true, store: "x" }).offers).toBeUndefined();
    expect(productJsonLd({ ...bike, priceState: "sin_euros" }, [], { priceCents: null, inStock: true, store: "x" }).offers).toBeUndefined();
  });

  it("el peso estimado no se publica como peso del producto", () => {
    expect(productJsonLd({ ...bike, weightG: null }, [], null).weight).toBeUndefined();
    expect(productJsonLd({ ...bike, weightG: 8540 }, [], null).weight).toMatchObject({ value: 8.5, unitCode: "KGM" });
  });

  it("migas de pan numeradas con direcciones completas", () => {
    const b = breadcrumbJsonLd([{ name: "Comparador", path: "/comparador" }]);
    expect(b.itemListElement[0]).toMatchObject({ position: 1, item: "https://roodada.com/comparador" });
  });

  it("ningún texto puede cerrar la etiqueta del script", () => {
    expect(jsonLdHtml({ name: "</script><script>alert(1)</script>" })).not.toContain("</script>");
  });
});
