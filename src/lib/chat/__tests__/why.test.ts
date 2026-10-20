import { describe, expect, it } from "vitest";

import type { ChatPick, Slots } from "../types";
import { whyForYou } from "../why";

const pick = (over: Partial<ChatPick>): ChatPick => ({
  slug: "x", brand: "Marca", name: "Bici", imageUrl: "", priceCents: 140000, score: 70, overBudget: false,
  size: { label: "M", fit: "oficial", alternative: null }, uprightPct: 0.5, electric: false, frameMaterial: "aluminio",
  weightG: 9800, weightPct: 0.5, tier: 3, groupset: "Shimano 105", shifting: "mecanico", speeds: 12, brakes: "disco_hidraulico",
  suspension: null, travelFrontMm: null, travelRearMm: null, tyreWidthMm: 40, tubeless: null, dropperPost: false,
  batteryWh: null, motorTorqueNm: null, kit: { lights: false, fenders: false, rack: false, kickstand: false }, quality: 6,
  pros: ["Talla M", "La más ligera de tus opciones (9,8 kg)"], cons: [], ...over,
});
const slots: Slots = { nivel: "avanzado", uso: "gravel", presupuesto: 1500, altura: 176, material: "carbono", cambio: "mecanico", peso: { kg: 9, text: "menos de 9 kg" } };

describe("por qué te encaja", () => {
  it("une lo que contó con los datos de la bici, a favor y en contra", () => {
    const w = whyForYou(pick({}), slots, 0, [pick({}), pick({ slug: "y", priceCents: 120000 })]);
    expect(w.headline).toBe("La que más encaja contigo");
    expect(w.reasons.join(" ")).toMatch(/te quedan 100\s€ de tus 1500\s€/);
    expect(w.reasons.join(" ")).toMatch(/talla M, según la tabla oficial de Marca/);
    expect(w.reasons.join(" ")).toMatch(/Cambio mecánico \(Shimano 105\), como pedías/);
    expect(w.watch.join(" ")).toMatch(/aluminio, no de carbono/);
    expect(w.watch.join(" ")).toMatch(/más de los 9 kg/);
  });
  it("no inventa: lo que la ficha no dice, se dice que falta", () => {
    const w = whyForYou(pick({ weightG: null }), { ...slots, nivel: "pro", necesidades: ["potenciómetro y tija telescópica"] }, 1, [pick({ slug: "a", priceCents: 100000 }), pick({ weightG: null })]);
    expect(w.watch.join(" ")).toMatch(/no publica el peso/);
    expect(w.watch.join(" ")).toMatch(/potenciómetro/);
  });
  it("las demás se presentan por lo que destacan", () => {
    const cheap = pick({ slug: "c", priceCents: 90000 });
    expect(whyForYou(cheap, slots, 1, [pick({}), cheap]).headline).toBe("La opción para gastar menos");
  });
});
