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
  /** Disciplina dentro del tipo (specs.discipline): trail, descenso, aero… */
  subtipo?: string;
  electrica?: "si" | "no";
  precioMin?: number;
  precioMax?: number;
  marca?: string;
  material?: string;
  suspension?: string;
  /** Solo gravel: monoplato (1x) o varios platos (2x/3x) */
  platos?: Platos;
  /** Gama: la más baja entre la de componentes (grupo) y la de precio (ver gamaDe) */
  gama?: Gama;
  q?: string;
  orden: SortKey;
  pagina: number;
};

export const PAGE_SIZE = 24;

/** Platos (solo gravel, 27-11-2026): monoplato = 1x; varios = 2x o 3x. Sin dato de platos, no entra si se filtra */
export const PLATOS = { mono: "Monoplato (1x)", varios: "Varios platos (2x / 3x)" } as const;
export type Platos = keyof typeof PLATOS;
export const PLATOS_CATEGORIA = "bici-gravel";
const platosDe = (b: Bike): Platos | null =>
  b.specs.drivetrain === "1x" ? "mono" : b.specs.drivetrain === "2x" || b.specs.drivetrain === "3x" ? "varios" : null;

/**
 * Gama (decisión de Edgar, 27-11-2026): por componentes Y por precio, y cuenta LA MÁS BAJA de las dos
 * (gama alta solo si lo es por las dos). Componentes: grupo de transmisión (tiers.ts): 1–2 entrada, 3 media, 4–5 alta.
 * Precio (el de la marca): < 1.100 € entrada, 1.100–4.500 € media, > 4.500 € alta. Sin gama de grupo conocida, cuenta el precio.
 */
export const GAMAS = { entrada: "Gama de entrada", media: "Gama media", alta: "Gama alta" } as const;
export type Gama = keyof typeof GAMAS;
const ORDEN_GAMA: Gama[] = ["entrada", "media", "alta"];
const GAMA_PRECIO = { media: 110_000, alta: 450_000 }; // céntimos: desde 1.100 € media; más de 4.500 € alta
export const gamaPorPrecio = (cents: number): Gama => (cents < GAMA_PRECIO.media ? "entrada" : cents <= GAMA_PRECIO.alta ? "media" : "alta");
export const gamaPorGrupo = (tier: number | null): Gama | null => (tier === null ? null : tier <= 2 ? "entrada" : tier === 3 ? "media" : "alta");
export const gamaDe = (b: Bike): Gama | null => {
  const precio = b.priceCents > 0 ? gamaPorPrecio(b.priceCents) : null;
  const grupo = gamaPorGrupo(b.tier);
  if (!precio) return grupo;
  if (!grupo) return precio;
  return ORDEN_GAMA[Math.min(ORDEN_GAMA.indexOf(precio), ORDEN_GAMA.indexOf(grupo))];
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export function parseFilters(sp: Record<string, string | string[] | undefined>): CatalogFilters {
  // «3.500», «3500 €» o «3500»: se quedan solo las cifras (el punto es el separador de miles)
  const euros = (v: string | string[] | undefined) => {
    const n = Number((one(v) ?? "").replace(/\D/g, ""));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  // «Entre» con las cifras al revés: se ordenan
  let [precioMin, precioMax] = [euros(sp.precioMin), euros(sp.precioMax)];
  if (precioMin !== undefined && precioMax !== undefined && precioMin > precioMax) [precioMin, precioMax] = [precioMax, precioMin];
  const pagina = Number(one(sp.pagina));
  const orden = one(sp.orden);
  const electrica = one(sp.electrica);
  const platos = one(sp.platos);
  const gama = one(sp.gama);
  return {
    categoria: one(sp.categoria) as Category | undefined,
    // Sin tipo, el subtipo no vale (el desplegable ni aparece)
    subtipo: one(sp.categoria) ? one(sp.subtipo) : undefined,
    electrica: electrica === "si" || electrica === "no" ? electrica : undefined,
    precioMin,
    precioMax,
    marca: one(sp.marca),
    material: one(sp.material),
    suspension: one(sp.suspension),
    // Platos solo con gravel elegido (el desplegable solo sale ahí)
    platos: one(sp.categoria) === PLATOS_CATEGORIA && platos && platos in PLATOS ? (platos as Platos) : undefined,
    gama: gama && gama in GAMAS ? (gama as Gama) : undefined,
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
      (!f.subtipo || b.specs.discipline === f.subtipo) &&
      (!f.electrica || b.electric === (f.electrica === "si")) &&
      (!f.precioMin || b.priceCents >= f.precioMin * 100) &&
      (!f.precioMax || b.priceCents <= f.precioMax * 100) &&
      // Marca elegida (slug) o escrita a mano: vale el nombre, sin tildes ni mayúsculas
      (!f.marca || b.brandSlug === f.marca || normalize(b.brand) === normalize(f.marca.trim())) &&
      (!f.material || b.frameMaterial === f.material) &&
      (!f.suspension || b.specs.suspension === f.suspension) &&
      (!f.platos || platosDe(b) === f.platos) &&
      (!f.gama || gamaDe(b) === f.gama) &&
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
    subtipo: Object.fromEntries(
      [...new Set(bikes.map((b) => b.category))].map((c) => [c, count((b) => (b.category === c ? b.specs.discipline : null))]),
    ),
    marca: count((b) => b.brandSlug),
    marcaNombre: Object.fromEntries(bikes.map((b) => [b.brandSlug, b.brand])),
    material: count((b) => b.frameMaterial),
    suspension: count((b) => b.specs.suspension),
    platos: count((b) => (b.category === PLATOS_CATEGORIA ? platosDe(b) : null)),
    gama: count((b) => gamaDe(b)),
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
