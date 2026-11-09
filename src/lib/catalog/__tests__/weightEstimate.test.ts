// El peso estimado solo se usa cuando la marca no publica el oficial, y siempre se avisa.
import { describe, expect, it } from "vitest";

import { DEFAULT_FORMULA } from "../../recommender/quality";
import fixture from "../../recommender/__tests__/fixtures/catalogo.json";
import { SPEC_ROWS } from "../../specRows";
import { buildCatalog, type ListingRow, type SizeRow } from "../build";

const listing = fixture.listing as ListingRow[];
const withWeight = listing.find((r) => r.weight_g !== null)!;
const withoutWeight = listing.find((r) => r.weight_g === null)!;
const estimates = [withWeight, withoutWeight].map((r) => ({
  id: r.variant_id,
  weight_estimated_g: 9100,
  weight_estimate_label: "≈ 9,1 kg ±0,7",
}));
const bikes = buildCatalog([withWeight, withoutWeight], fixture.sizes as SizeRow[], DEFAULT_FORMULA, estimates);
const peso = SPEC_ROWS.find((r) => r.label === "Peso")!;

describe("peso estimado", () => {
  it("no sustituye al peso oficial", () => {
    const b = bikes.find((x) => x.id === withWeight.variant_id)!;
    expect(b.weightEstimate).toBeNull();
    expect(peso.note!(b)).toBeNull();
  });

  it("se muestra con aviso cuando falta el oficial", () => {
    const b = bikes.find((x) => x.id === withoutWeight.variant_id)!;
    expect(peso.value(b)).toBe("≈ 9,1 kg ±0,7");
    expect(peso.note!(b)).toBe(`Peso estimado: ${b.brand} no publica el peso oficial de esta bici.`);
  });

  it("no compite por la más ligera ni cuenta en la nota", () => {
    const b = bikes.find((x) => x.id === withoutWeight.variant_id)!;
    expect(peso.numeric!(b)).toBeNull();
    expect(b.pct.weight).toBeNull();
  });
});
