// Autonomía de las eléctricas (26-11-2026, decisión de Edgar): la de la marca si la publica; si no, una estimación
// con la batería (Wh) y lo que declaran las marcas que sí la dan, por tipo de bici. Como el peso estimado: siempre
// se dice que es estimada y en qué se basa.
//
// Calibración (26-11-2026): 146 eléctricas con autonomía oficial («hasta X km») en la base: km por cada 100 Wh.
// Rehacer cuando haya más marcas con dato (consulta en repo de datos, CONTINUAR.md B20). Con menos de 10 bicis
// en un tipo, no se estima.
import type { Bike, Category } from "./types";

type Calibracion = { p25: number; p50: number; p75: number; n: number; marcas: string };

export const CALIBRACION_AUTONOMIA: Partial<Record<Category, Calibracion>> = {
  "bici-urbana": { p25: 21.5, p50: 23.7, p75: 24.2, n: 60, marcas: "BH, Brompton, Moustache, Riverside, Rockrider y Sava" },
  // ⚠️ Pocas marcas para la cantidad de eMTB que hay (702): NOTA para revisar con fuentes externas (CONTINUAR.md B20)
  "bici-mtb": { p25: 16.0, p50: 16.2, p75: 24.1, n: 43, marcas: "BH, Moustache, Rockrider y Sava" },
  "bici-gravel": { p25: 23.5, p50: 24.0, p75: 27.4, n: 22, marcas: "BH, Moustache, Sava y Van Rysel" },
  "bici-carretera": { p25: 23.8, p50: 24.2, p75: 31.2, n: 20, marcas: "BH, Moustache y Van Rysel" },
};

export type Autonomia =
  | { tipo: "oficial"; km: number; texto: string | null }
  | { tipo: "estimada"; km: number; min: number; max: number; wh: number; cal: Calibracion }
  | null;

const redondea = (km: number) => Math.round(km / 5) * 5;

export function autonomia(b: Pick<Bike, "electric" | "category" | "specs">): Autonomia {
  if (!b.electric) return null;
  if (b.specs.rangeKm) return { tipo: "oficial", km: b.specs.rangeKm, texto: b.specs.rangeText };
  const wh = b.specs.batteryWh;
  const cal = CALIBRACION_AUTONOMIA[b.category];
  if (!wh || !cal || cal.n < 10) return null;
  return { tipo: "estimada", km: redondea((wh * cal.p50) / 100), min: redondea((wh * cal.p25) / 100), max: redondea((wh * cal.p75) / 100), wh, cal };
}

const TIPO: Partial<Record<Category, string>> = {
  "bici-urbana": "urbanas y de paseo",
  "bici-mtb": "de montaña",
  "bici-gravel": "de gravel",
  "bici-carretera": "de carretera",
};

/** Texto del ⓘ de la batería: lo primero, la autonomía */
export function autonomiaTexto(b: Pick<Bike, "electric" | "category" | "specs" | "brand">): string | null {
  const a = autonomia(b);
  const cond =
    "La autonomía real depende mucho del modo de asistencia, el desnivel, el peso, el viento y la temperatura: en los modos más fuertes puede ser la mitad o menos.";
  if (!a) {
    if (!b.electric) return null;
    if (!b.specs.batteryWh)
      return `${b.brand} no publica la capacidad de la batería de esta bici (en Wh), así que tampoco podemos estimar su autonomía. Consúltala en la web de la marca.`;
    return `${b.brand} no publica la autonomía de esta bici y no tenemos datos suficientes para estimarla.`;
  }
  if (a.tipo === "oficial")
    return `Autonomía: hasta ${a.km} km, según ${b.brand}${a.texto ? ` («${a.texto}»)` : ""}. Es la cifra que da la marca, normalmente en el modo de menos asistencia. ${cond}`;
  return (
    `Autonomía estimada: entre ${a.min} y ${a.max} km en el modo de menos asistencia; lo más habitual en bicis como esta, unos ${a.km} km. ` +
    `${b.brand} no publica la autonomía de esta bici: la calculamos con su batería (${a.wh} Wh) y lo que declaran las marcas que sí la dan ` +
    `en bicis ${TIPO[b.category] ?? "de su tipo"} (${a.cal.n} bicis de ${a.cal.marcas}). Es un dato no oficial y orientativo. ${cond}`
  );
}
