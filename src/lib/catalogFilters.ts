// Filtros y orden del comparador, leídos de la URL (?categoria=…&marca=…&orden=…).
import type { Bike, Category } from "./catalog/types";

export const SORTS = {
  calidad: "Mejor calidad-precio",
  "precio-asc": "Precio: de menor a mayor",
  "precio-desc": "Precio: de mayor a menor",
  peso: "Más ligeras",
} as const;
export type SortKey = keyof typeof SORTS;

export type CatalogFilters = {
  categoria?: Category;
  electrica?: "si" | "no";
  precioMax?: number;
  marca?: string;
  material?: string;
  suspension?: string;
  q?: string;
  orden: SortKey;
  pagina: number;
};

export const PAGE_SIZE = 24;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export function parseFilters(sp: Record<string, string | string[] | undefined>): CatalogFilters {
  const precio = Number(one(sp.precioMax));
  const pagina = Number(one(sp.pagina));
  const orden = one(sp.orden);
  const electrica = one(sp.electrica);
  return {
    categoria: one(sp.categoria) as Category | undefined,
    electrica: electrica === "si" || electrica === "no" ? electrica : undefined,
    precioMax: Number.isFinite(precio) && precio > 0 ? precio : undefined,
    marca: one(sp.marca),
    material: one(sp.material),
    suspension: one(sp.suspension),
    q: one(sp.q)?.trim().slice(0, 80),
    orden: orden && orden in SORTS ? (orden as SortKey) : "calidad",
    pagina: Number.isInteger(pagina) && pagina > 0 ? pagina : 1,
  };
}

const normalize = (t: string) => t.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function applyFilters(bikes: Bike[], f: CatalogFilters): Bike[] {
  const words = f.q ? normalize(f.q).split(/\s+/).filter(Boolean) : [];
  const list = bikes.filter(
    (b) =>
      (!f.categoria || b.category === f.categoria) &&
      (!f.electrica || b.electric === (f.electrica === "si")) &&
      (!f.precioMax || b.priceCents <= f.precioMax * 100) &&
      (!f.marca || b.brandSlug === f.marca) &&
      (!f.material || b.frameMaterial === f.material) &&
      (!f.suspension || b.specs.suspension === f.suspension) &&
      words.every((w) => normalize(`${b.brand} ${b.name} ${b.specs.groupset ?? ""}`).includes(w)),
  );
  const by: Record<SortKey, (a: Bike, b: Bike) => number> = {
    calidad: (a, b) => b.quality.total - a.quality.total || a.priceCents - b.priceCents,
    "precio-asc": (a, b) => a.priceCents - b.priceCents,
    "precio-desc": (a, b) => b.priceCents - a.priceCents,
    // sin peso publicado, al final
    peso: (a, b) => (a.weightG ?? Infinity) - (b.weightG ?? Infinity),
  };
  return list.sort(by[f.orden]);
}

/** Valores presentes en el catálogo para cada desplegable */
export function facetOptions(bikes: Bike[]) {
  const count = <K extends string>(key: (b: Bike) => K | null) => {
    const m = new Map<K, number>();
    for (const b of bikes) {
      const k = key(b);
      if (k) m.set(k, (m.get(k) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };
  return {
    categoria: count((b) => b.category),
    marca: count((b) => b.brandSlug),
    marcaNombre: Object.fromEntries(bikes.map((b) => [b.brandSlug, b.brand])),
    material: count((b) => b.frameMaterial),
    suspension: count((b) => b.specs.suspension),
  };
}

export function filtersToSearch(f: Partial<CatalogFilters>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) {
    if (v === undefined || v === "" || (k === "orden" && v === "calidad") || (k === "pagina" && v === 1)) continue;
    p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}
