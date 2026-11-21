// La ficha calcula su bici sola (buildBike) con las distribuciones ya hechas: tiene que salir
// exactamente igual que dentro del catálogo entero, nota calidad-precio y percentiles incluidos.
import { describe, expect, it } from "vitest";

import { DEFAULT_FORMULA } from "../../recommender/quality";
import fixture from "../../recommender/__tests__/fixtures/catalogo.json";
import { buildBike, buildCatalog, cohortDistributions, cohortRow, type ListingRow, type SizeRow } from "../build";

const listing = fixture.listing as ListingRow[];
const sizes = fixture.sizes as SizeRow[];
const catalog = buildCatalog(listing, sizes, DEFAULT_FORMULA);
const dist = cohortDistributions(listing.map(cohortRow));

describe("buildBike", () => {
  it("da la misma bici que el catálogo entero, para todas las del fixture", () => {
    for (const row of listing) {
      const alone = buildBike(row, sizes.filter((s) => s.variant_id === row.variant_id), DEFAULT_FORMULA, dist);
      expect(alone).toEqual(catalog.find((b) => b.id === row.variant_id));
    }
  });
});
