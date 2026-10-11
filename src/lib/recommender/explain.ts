// "Por qué te la recomendamos": 2–3 razones con datos concretos + avisos de lo que falta.
import type { Answers } from "./questions";
import type { Scored } from "./score";
import { effectivePriorities } from "./score";
import { TIER_LABELS } from "./tiers";

export type Explanation = { reasons: string[]; warnings: string[] };

const eur = (cents: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(cents / 100);
const metres = (cm: number) => (cm / 100).toLocaleString("es-ES", { minimumFractionDigits: 2 }) + " m";
const kg = (g: number) => (g / 1000).toLocaleString("es-ES", { maximumFractionDigits: 1 }) + " kg";

export function explain(r: Scored, a: Answers): Explanation {
  const { bike, sizeFit } = r;
  const s = bike.specs;
  const reasons: string[] = [];
  const warnings: string[] = [];

  // 1. La talla, siempre primero
  if (sizeFit.fit === "entre") {
    const alt = sizeFit.alternative ? ` y ${sizeFit.alternative.label}` : "";
    reasons.push(`Entre las tallas ${sizeFit.size.label}${alt} para ${metres(a.altura)}`);
    warnings.push("Estás entre dos tallas: pruébala o consulta la geometría antes de comprar.");
  } else {
    const src = sizeFit.fit === "oficial" ? "según la tabla de la marca" : "talla estimada";
    reasons.push(`Talla ${sizeFit.size.label} para ${metres(a.altura)} (${src})`);
    if (sizeFit.fit === "estimada") warnings.push("La marca no publica tabla de tallas: la talla es una estimación.");
  }

  // 2. Lo que la persona ha pedido, de mayor a menor peso
  const candidates: { weight: number; text: string }[] = [];
  for (const [key, w] of effectivePriorities(a)) {
    const v = r.parts[key];
    if (v === null || v === undefined) {
      if (key === "ligereza") warnings.push("La marca no publica el peso.");
      if (key === "comodidad" || key === "rendimiento") warnings.push("Sin geometría publicada para valorar la postura.");
      if (key === "autonomia" && bike.electric) warnings.push("La marca no publica la capacidad de la batería.");
      continue;
    }
    if (v < 0.6) continue; // solo se presume de lo que destaca
    const text = priorityText(key, r, a);
    if (text) candidates.push({ weight: w * v, text });
  }
  candidates.sort((x, y) => y.weight - x.weight);
  reasons.push(...candidates.slice(0, 2).map((c) => c.text));

  // 3. Calidad-precio si aún hay hueco y es buena
  if (reasons.length < 3 && bike.quality.total >= 6.5) {
    reasons.push(`Calidad-precio ${bike.quality.total.toLocaleString("es-ES")}/10`);
  }

  if (r.overBudget) {
    warnings.unshift(`${eur(bike.priceCents - a.presupuesto * 100)} por encima de tu presupuesto.`);
  }
  if (s.groupset === null && (a.prioridades as string[]).includes("componentes")) {
    warnings.push("Sin grupo de transmisión publicado.");
  }
  return { reasons: reasons.slice(0, 3), warnings };
}

function priorityText(key: string, r: Scored, a: Answers): string | null {
  const { bike } = r;
  const s = bike.specs;
  switch (key) {
    case "comodidad":
      return "Postura de las más erguidas entre tus opciones";
    case "rendimiento":
      return "Postura deportiva, de las más agresivas entre tus opciones";
    case "ligereza":
      return bike.weightG ? `${kg(bike.weightG)}, de las más ligeras de su tipo` : null;
    case "componentes":
      return s.groupset && bike.tier
        ? `${s.groupset}${s.shifting === "electronico" ? " electrónico" : ""}: gama ${TIER_LABELS[bike.tier]}`
        : null;
    case "ahorro":
      return `Te deja ${eur(a.presupuesto * 100 - bike.priceCents)} de margen`;
    case "versatilidad": {
      const bits = [
        s.tyreWidthMm ? `cubiertas de ${s.tyreWidthMm} mm` : null,
        s.maxTyreWidthMm ? `admite hasta ${s.maxTyreWidthMm} mm` : null,
        s.tubeless ? "tubeless" : null,
      ].filter(Boolean);
      return bits.length ? capitalize(bits.join(", ")) : null;
    }
    case "autonomia":
      return s.batteryWh ? `Batería de ${s.batteryWh} Wh` : null;
    case "ciudad": {
      const kit = [s.lights && "luces", s.fenders && "guardabarros", s.rack && "portabultos", s.kickstand && "caballete"].filter(
        Boolean,
      ) as string[];
      return kit.length ? `Viene con ${listJoin(kit)}` : null;
    }
  }
  return null;
}

const capitalize = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const listJoin = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} y ${xs.at(-1)}` : xs[0]);
