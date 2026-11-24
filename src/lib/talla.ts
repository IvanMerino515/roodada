// Calculadora de talla (/talla-bicicleta): con la altura (y la entrepierna, si se sabe), qué talla
// toca en cada bici del catálogo según la tabla de su marca, agrupado por sistema de tallas.
// Funciones puras: se prueban sin servidor.
import type { Bike, Category } from "./catalog/types";
import { fitSize } from "./recommender/sizing";

export type Sistema = "letras" | "cm" | "pulgadas" | "otra";

const LETRAS: Record<string, string> = {
  XXS: "XXS", "2XS": "XXS", XS: "XS", S: "S", SM: "S", SMALL: "S", M: "M", MD: "M", MEDIUM: "M",
  L: "L", LG: "L", LA: "L", LARGE: "L", XL: "XL", XXL: "XXL", "2XL": "XXL",
  "S/M": "S/M", "M/L": "M/L", ML: "M/L", "L/XL": "L/XL", "XS/S": "XS/S",
};
/** Orden natural de las letras, para listarlas de pequeña a grande */
export const ORDEN_LETRAS = ["XXS", "XS", "XS/S", "S", "S/M", "M", "M/L", "L", "L/XL", "XL", "XXL"];

/** «MD» → M; «56», «56 cm» y «560» → 56 cm; «20"» → 20″; lo demás, tal cual */
export function normalizarTalla(label: string): { sistema: Sistema; label: string } {
  const t = label.trim().replace(/[″”"]/g, "″").replace(/\s+/g, " ");
  const up = t.toUpperCase();
  if (LETRAS[up]) return { sistema: "letras", label: LETRAS[up] };
  const cm = up.match(/^(\d{2,3})(?:[.,]\d)?\s*CM$/) ?? up.match(/^(\d{2,3})$/);
  if (cm) {
    let n = Number(cm[1]);
    if (n >= 400 && n <= 700) n = Math.round(n / 10); // en milímetros
    if (n >= 38 && n <= 66) return { sistema: "cm", label: `${n} cm` };
    if (n >= 10 && n <= 29) return { sistema: "pulgadas", label: `${n}″` };
  }
  // «20″», «Rueda de 20″»: pulgadas (de rueda en las infantiles)
  const pul = t.match(/(\d{2}(?:[.,]5)?)\s*″/);
  if (pul) return { sistema: "pulgadas", label: `${pul[1].replace(",", ".")}″` };
  if (/^(ÚNICA|UNICA|ONE SIZE|U|OS|TU)$/.test(up)) return { sistema: "otra", label: "Única" };
  return { sistema: "otra", label: t };
}

export type Reparto = { label: string; n: number; pct: number }[];
export type ResultadoTalla = {
  total: number;
  entreDos: number;
  letras: Reparto;
  cm: Reparto;
  pulgadas: Reparto;
  marcas: { marca: string; slug: string; label: string; n: number }[];
};

const reparto = (labels: string[], orden?: string[]): Reparto => {
  const m = new Map<string, number>();
  for (const l of labels) m.set(l, (m.get(l) ?? 0) + 1);
  const total = labels.length || 1;
  const out = [...m.entries()].map(([label, n]) => ({ label, n, pct: Math.round((n / total) * 100) }));
  return out.sort((a, b) => b.n - a.n || (orden ? orden.indexOf(a.label) - orden.indexOf(b.label) : 0));
};

/** Qué talla toca con esta altura en las bicis de un tipo (o en todas), según la tabla de cada marca */
export function calcularTalla(bikes: Bike[], altura: number, entrepierna?: number, categoria?: Category): ResultadoTalla {
  const lista = bikes.filter((b) => b.inStock && b.sizes.length && (!categoria || b.category === categoria));
  const fits = lista
    .map((b) => ({ b, fit: fitSize(b.sizes, altura, entrepierna) }))
    .filter((x): x is { b: Bike; fit: NonNullable<ReturnType<typeof fitSize>> } => x.fit !== null);
  const norm = fits.map(({ b, fit }) => ({ b, fit, t: normalizarTalla(fit.size.label) }));

  // Por marca: la talla que más se repite en sus bicis
  const porMarca = new Map<string, { marca: string; labels: string[] }>();
  for (const { b, t } of norm) {
    const cur = porMarca.get(b.brandSlug) ?? { marca: b.brand, labels: [] };
    cur.labels.push(t.label);
    porMarca.set(b.brandSlug, cur);
  }
  const marcas = [...porMarca.entries()]
    .map(([slug, v]) => ({ slug, marca: v.marca, label: reparto(v.labels)[0].label, n: v.labels.length }))
    .sort((a, b) => b.n - a.n);

  return {
    total: norm.length,
    entreDos: norm.filter((x) => x.fit.fit === "entre").length,
    letras: reparto(norm.filter((x) => x.t.sistema === "letras").map((x) => x.t.label), ORDEN_LETRAS),
    cm: reparto(norm.filter((x) => x.t.sistema === "cm").map((x) => x.t.label)),
    pulgadas: reparto(norm.filter((x) => x.t.sistema === "pulgadas").map((x) => x.t.label)),
    marcas,
  };
}

/** Tabla de referencia: para cada altura, la talla más habitual (letras y cm) en un tipo de bici */
export function tablaPorAltura(bikes: Bike[], categoria: Category) {
  const alturas = categoria === "bici-infantil" ? [100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150] : [150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200];
  return alturas
    .map((h) => {
      const r = calcularTalla(bikes, h, undefined, categoria);
      return { altura: h, total: r.total, letra: r.letras[0] ?? null, cm: r.cm[0] ?? null, pulgadas: r.pulgadas[0] ?? null };
    })
    .filter((f) => f.total >= 5);
}
