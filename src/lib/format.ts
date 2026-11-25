// Formato y etiquetas en español para los valores de la base.
import type { Category, Discipline } from "./catalog/types";

export const eur = (cents: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0, useGrouping: "always" }).format(cents / 100);

/** Texto cuando no hay precio en euros que enseñar (tienda en $ o £, o la web no lo mostraba) */
export const NO_PRICE = "Precio no disponible en €";

/** El precio tal como se enseña en toda la web: «2.999 €», «Desde 2.999 €», «Precio est. 2.999 €», «Precio no disponible en €» o «Sin stock». */
export function priceLabel(b: { priceCents: number; priceState?: "ok" | "desde" | "estimado" | "sin_euros" | "agotada" }) {
  if (b.priceState === "sin_euros") return NO_PRICE;
  if (b.priceState === "agotada") return "Sin stock";
  if (b.priceState === "estimado") return `Precio est. ${eur(b.priceCents)}`;
  return b.priceState === "desde" ? `Desde ${eur(b.priceCents)}` : eur(b.priceCents);
}

/** Número entero con separador de miles siempre: «4.142» (en español, por defecto, 4 cifras van sin punto) */
export const int = (n: number) => n.toLocaleString("es-ES", { useGrouping: "always" });

export const kg = (g: number | null) =>
  g === null ? null : `${(g / 1000).toLocaleString("es-ES", { useGrouping: "always", maximumFractionDigits: 1 })} kg`;

/** "14 de octubre": la fecha en que se comprobó un precio (en hora de Madrid, que es donde se lee). */
export const day = (iso: string) =>
  new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", timeZone: "Europe/Madrid" }).format(new Date(iso));

export const decimal = (n: number) => n.toLocaleString("es-ES", { useGrouping: "always", maximumFractionDigits: 1 });

export const CATEGORY_LABEL: Record<Category, string> = {
  "bici-carretera": "Carretera",
  "bici-gravel": "Gravel",
  "bici-mtb": "Montaña",
  "bici-urbana": "Urbana y paseo",
  "bici-infantil": "Infantil",
};

export const DISCIPLINE_LABEL: Record<Discipline, string> = {
  competicion: "Competición", aero: "Aero", endurance: "Endurance", triatlon: "Triatlón",
  ciclocross: "Ciclocross", gravel: "Gravel", xc: "XC", trail: "Trail", enduro: "Enduro",
  descenso: "Descenso", dirt: "Dirt", fat: "Fat bike", urbana: "Urbana", trekking: "Trekking",
  cargo: "Cargo", plegable: "Plegable", infantil: "Infantil",
};

const LABELS: Record<string, string> = {
  disco_hidraulico: "Disco hidráulico", disco_mecanico: "Disco mecánico", disco: "Disco",
  llanta: "Llanta", hidromecanico: "Disco hidromecánico", contrapedal: "Contrapedal",
  rigida: "Rígida", delantera: "Delantera", doble: "Doble suspensión",
  mecanico: "Mecánico", electronico: "Electrónico",
  buje_interno: "Buje interno", una_velocidad: "Una velocidad",
  mixta: "Mixta", segun_talla: "Según talla",
  carbono: "Carbono", aluminio: "Aluminio", acero: "Acero", titanio: "Titanio",
  central: "Central", buje_trasero: "Buje trasero",
};

export const label = (v: string | null | undefined) => (v ? (LABELS[v] ?? v) : null);

export const MISSING = "No publicado";
