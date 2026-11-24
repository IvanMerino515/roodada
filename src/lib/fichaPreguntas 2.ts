// Preguntas frecuentes de una ficha, con la respuesta sacada de sus datos (también van como FAQPage).
// Función pura: se prueba sin servidor.
import type { Bike } from "./catalog/types";
import { CATEGORY_LABEL, DISCIPLINE_LABEL, eur } from "./format";
import type { Pregunta } from "./landings";
import { fitSize } from "./recommender/sizing";

const kg = (g: number) => `${(g / 1000).toLocaleString("es-ES", { maximumFractionDigits: 1 })} kg`;
const cm = (n: number) => `${(n / 100).toLocaleString("es-ES", { minimumFractionDigits: 2 })} m`;

export function preguntasFicha(bike: Bike, alternativas: Bike[]): Pregunta[] {
  const nombre = `${bike.brand} ${bike.name}`;
  const tipo = (bike.specs.discipline === "infantil" ? CATEGORY_LABEL[bike.category] : DISCIPLINE_LABEL[bike.specs.discipline]).toLowerCase();
  const out: Pregunta[] = [];

  // Talla para alturas habituales, con la tabla oficial de la marca
  const alturas = bike.category === "bici-infantil" ? [110, 120, 130, 140] : [160, 170, 180, 190];
  const tallas = alturas
    .map((h) => [h, fitSize(bike.sizes, h)] as const)
    .filter(([, f]) => f !== null)
    .map(([h, f]) => `${cm(h)}: ${f!.fit === "entre" && f!.alternative ? `${f!.size.label} o ${f!.alternative.label}` : f!.size.label}`);
  if (tallas.length >= 2) {
    const estimada = bike.sizes.some((s) => s.heightSource === "estimado");
    out.push({
      q: `¿Qué talla de ${nombre} necesito?`,
      a: `Según tu altura: ${tallas.join("; ")}.${estimada ? " Algunas tallas no traen altura oficial y la estimamos con su geometría." : ""} Con tu entrepierna lo afinamos en la guía.`,
    });
  }

  if (bike.weightG) {
    out.push({ q: `¿Cuánto pesa la ${nombre}?`, a: `${kg(bike.weightG)}, según ${bike.brand}.` });
  } else if (bike.weightEstimate) {
    out.push({
      q: `¿Cuánto pesa la ${nombre}?`,
      a: `${bike.brand} no publica el peso. Lo estimamos en ${bike.weightEstimate.label} a partir de bicis parecidas.`,
    });
  }

  if (bike.priceState === "ok" && bike.category !== "bici-infantil") {
    const barata = Math.round((1 - bike.pct.price) * 100);
    out.push({
      q: `¿Es cara la ${nombre} para ser una bici de ${tipo}?`,
      a: `Cuesta ${eur(bike.priceCents)}: más barata que el ${barata} % de las bicis de ${CATEGORY_LABEL[bike.category].toLowerCase()}${bike.electric ? " eléctricas" : ""} del catálogo. Su nota calidad-precio es ${bike.quality.total.toLocaleString("es-ES")}/10.`,
    });
  }

  if (alternativas.length) {
    out.push({
      q: `¿Qué alternativas hay a la ${nombre}?`,
      a: `Por un precio parecido: ${alternativas.map((b) => `${b.brand} ${b.name} (${eur(b.priceCents)})`).join(", ")}.`,
    });
  }
  return out;
}
