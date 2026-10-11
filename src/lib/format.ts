// Formato y etiquetas en español para los valores de la base.
import type { Category, Discipline } from "./catalog/types";

export const eur = (cents: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(cents / 100);

export const kg = (g: number | null) =>
  g === null ? null : `${(g / 1000).toLocaleString("es-ES", { maximumFractionDigits: 1 })} kg`;

export const decimal = (n: number) => n.toLocaleString("es-ES", { maximumFractionDigits: 1 });

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
  cargo: "Cargo", infantil: "Infantil",
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
