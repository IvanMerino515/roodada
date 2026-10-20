// De la recomendación del catálogo (src/lib/recommender) a lo que necesita el chat. Solo datos publicados.
import type { Recommendation } from "../recommender";
import type { ChatPick } from "./types";

export function toPick(r: Recommendation): ChatPick {
  const { bike, sizeFit } = r;
  const s = bike.specs;
  return {
    slug: bike.slug,
    brand: bike.brand,
    name: bike.name,
    imageUrl: bike.imageUrl,
    priceCents: bike.priceCents,
    score: r.score,
    overBudget: r.overBudget,
    size: { label: sizeFit.size.label, fit: sizeFit.fit, alternative: sizeFit.alternative?.label ?? null },
    uprightPct: r.uprightPct,
    electric: bike.electric,
    frameMaterial: bike.frameMaterial,
    weightG: bike.weightG,
    weightPct: bike.pct.weight,
    tier: bike.tier,
    groupset: s.groupset,
    shifting: s.shifting,
    speeds: s.speeds,
    brakes: s.brakes,
    suspension: s.suspension,
    travelFrontMm: s.travelFrontMm,
    travelRearMm: s.travelRearMm,
    tyreWidthMm: s.tyreWidthMm,
    tubeless: s.tubeless,
    dropperPost: s.dropperPost,
    batteryWh: s.batteryWh,
    motorTorqueNm: s.motorTorqueNm,
    kit: { lights: s.lights, fenders: s.fenders, rack: s.rack, kickstand: s.kickstand },
    quality: bike.category === "bici-infantil" ? null : bike.quality.total,
    pros: r.pros,
    cons: r.cons,
  };
}
