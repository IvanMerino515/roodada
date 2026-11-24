// Páginas de entrada por tipo de bici (/bicis/…) y por marca (/marcas/…): qué páginas existen, qué
// bicis entran en cada una y el resumen que abre la página, calculado con los datos. Funciones puras.
import type { Bike, Category, Discipline } from "./catalog/types";
import { CATEGORY_LABEL, eur, int } from "./format";

/** Por debajo de esto, la página no se publica: una lista de 2 bicis no responde a nadie */
export const MIN_BICIS = 5;

export const CATEGORY_SLUG: Record<Category, string> = {
  "bici-carretera": "carretera",
  "bici-gravel": "gravel",
  "bici-mtb": "montana",
  "bici-urbana": "urbanas",
  "bici-infantil": "infantiles",
};
const SLUG_CATEGORY = Object.fromEntries(Object.entries(CATEGORY_SLUG).map(([c, s]) => [s, c])) as Record<string, Category>;

/** Cómo se dice cada tipo en un título: «Bicis de gravel» */
const CATEGORY_TITLE: Record<Category, string> = {
  "bici-carretera": "Bicis de carretera",
  "bici-gravel": "Bicis de gravel",
  "bici-mtb": "Bicis de montaña",
  "bici-urbana": "Bicis urbanas y de paseo",
  "bici-infantil": "Bicis infantiles",
};
const DISCIPLINE_TITLE: Partial<Record<Discipline, string>> = {
  competicion: "Bicis de carretera de competición",
  aero: "Bicis aero",
  endurance: "Bicis de endurance",
  triatlon: "Bicis de triatlón",
  ciclocross: "Bicis de ciclocross",
  gravel: "Bicis de gravel puro",
  xc: "Bicis de XC (rally)",
  trail: "Bicis de trail",
  enduro: "Bicis de enduro",
  descenso: "Bicis de descenso",
  dirt: "Bicis de dirt",
  fat: "Fat bikes",
  urbana: "Bicis urbanas",
  trekking: "Bicis de trekking",
  cargo: "Bicis de carga",
  plegable: "Bicis plegables",
};

export type Landing = {
  /** Qué es: un tipo, un subtipo, las eléctricas (todas o de un tipo) o un tope de precio sobre cualquiera de ellos */
  clase: "tipo" | "subtipo" | "electricas" | "electricas-tipo" | "precio";
  /** Segmentos de la dirección tras /bicis: ["gravel"], ["montana", "trail"], ["electricas", "urbanas"], ["gravel", "menos-de-1500"] */
  ruta: string[];
  titulo: string;
  /** Para frases: «bicis de gravel» */
  nombre: string;
  /** Migas: [texto, ruta] desde /bicis */
  padres: { name: string; path: string }[];
  filtro: (b: Bike) => boolean;
  /** Mismos filtros en el comparador, para «ver todas» */
  comparador: { categoria?: Category; subtipo?: string; electrica?: "si"; precioMax?: number };
  /** Solo en las de precio: el tope en euros */
  precio?: number;
};

/** Topes de las páginas de precio (€) */
export const TOPES_PRECIO = [500, 1000, 1500, 2000, 3000, 5000];

const lower = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);
/** Bicis que cuentan: a la venta y con precio en euros */
export const aLaVenta = (bikes: Bike[]) => bikes.filter((b) => b.inStock);

/** Todas las páginas de tipo que tienen al menos MIN_BICIS bicis a la venta */
export function allLandings(bikes: Bike[]): Landing[] {
  const sale = aLaVenta(bikes);
  const enough = (f: (b: Bike) => boolean) => sale.filter(f).length >= MIN_BICIS;
  const out: Landing[] = [];
  const root = { name: "Bicis", path: "/bicis" };

  for (const cat of Object.keys(CATEGORY_SLUG) as Category[]) {
    const catF = (b: Bike) => b.category === cat;
    if (!enough(catF)) continue;
    const catLanding: Landing = {
      clase: "tipo",
      ruta: [CATEGORY_SLUG[cat]],
      titulo: CATEGORY_TITLE[cat],
      nombre: lower(CATEGORY_TITLE[cat]),
      padres: [root],
      filtro: catF,
      comparador: { categoria: cat },
    };
    out.push(catLanding);
    // Subtipos: solo si el tipo tiene más de uno con bicis suficientes
    const discs = [...new Set(sale.filter(catF).map((b) => b.specs.discipline))].filter(
      (d) => DISCIPLINE_TITLE[d] && enough((b) => catF(b) && b.specs.discipline === d),
    );
    if (discs.length > 1) {
      for (const d of discs) {
        out.push({
          clase: "subtipo",
          ruta: [CATEGORY_SLUG[cat], d],
          titulo: DISCIPLINE_TITLE[d]!,
          nombre: lower(DISCIPLINE_TITLE[d]!),
          padres: [root, { name: CATEGORY_LABEL[cat], path: `/bicis/${CATEGORY_SLUG[cat]}` }],
          filtro: (b) => catF(b) && b.specs.discipline === d,
          comparador: { categoria: cat, subtipo: d },
        });
      }
    }
  }

  // Eléctricas: todas y por tipo
  const eF = (b: Bike) => b.electric;
  if (enough(eF)) {
    out.push({ clase: "electricas", ruta: ["electricas"], titulo: "Bicis eléctricas", nombre: "bicis eléctricas", padres: [root], filtro: eF, comparador: { electrica: "si" } });
    for (const cat of Object.keys(CATEGORY_SLUG) as Category[]) {
      if (cat === "bici-infantil") continue;
      const f = (b: Bike) => b.electric && b.category === cat;
      if (!enough(f)) continue;
      const titulo = `${CATEGORY_TITLE[cat]} eléctricas`;
      out.push({
        clase: "electricas-tipo",
        ruta: ["electricas", CATEGORY_SLUG[cat]],
        titulo,
        nombre: lower(titulo),
        padres: [root, { name: "Eléctricas", path: "/bicis/electricas" }],
        filtro: f,
        comparador: { categoria: cat, electrica: "si" },
      });
    }
  }
  // Por precio, sobre los tipos y las eléctricas: «Bicis de gravel por menos de 1.500 €». Solo los topes
  // que aportan algo: al menos MIN_BICIS bicis, no todas las del tipo (sería la misma página) y más que
  // en el tope anterior
  for (const base of out.filter((l) => l.clase === "tipo" || l.clase === "electricas" || l.clase === "electricas-tipo")) {
    const total = sale.filter(base.filtro).length;
    let anterior = 0;
    for (const tope of TOPES_PRECIO) {
      const f = (b: Bike) => base.filtro(b) && b.priceCents <= tope * 100;
      const n = sale.filter(f).length;
      if (n >= MIN_BICIS && n < total && n > anterior) {
        const precio = eur(tope * 100);
        out.push({
          clase: "precio",
          ruta: [...base.ruta, `menos-de-${tope}`],
          titulo: `${base.titulo} por menos de ${precio}`,
          nombre: `${base.nombre} por menos de ${precio}`,
          padres: [...base.padres, { name: base.titulo.replace(/^Bicis (de )?/, "").replace(/^./, (c) => c.toUpperCase()), path: `/bicis/${base.ruta.join("/")}` }],
          filtro: f,
          comparador: { ...base.comparador, precioMax: tope },
          precio: tope,
        });
      }
      anterior = Math.max(anterior, n);
    }
  }
  return out;
}

export const findLanding = (bikes: Bike[], ruta: string[]) => allLandings(bikes).find((l) => l.ruta.join("/") === ruta.join("/"));

/** Tipo de una bici como página de entrada (para enlazar desde la ficha) */
export const categoryPath = (cat: Category) => `/bicis/${CATEGORY_SLUG[cat]}`;
export const categoryFromSlug = (slug: string) => SLUG_CATEGORY[slug];

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor((s.length - 1) / 2)] : null;
};
const kg = (g: number) => `${(g / 1000).toLocaleString("es-ES", { maximumFractionDigits: 1 })} kg`;

export type Resumen = {
  total: number;
  marcas: [string, string, number][]; // [slug, nombre, nº]
  min: number;
  max: number;
  mediana: number;
  pesoMediano: string | null;
  conPesoOficial: number;
  electricas: number;
  mejores: Bike[];
};

/** Las cifras de una lista de bicis (a la venta) y sus mejores por calidad-precio, una por modelo */
export function resumen(bikes: Bike[], cuantas = 8): Resumen {
  const sale = aLaVenta(bikes);
  const prices = sale.map((b) => b.priceCents);
  const byBrand = new Map<string, [string, string, number]>();
  for (const b of sale) {
    const cur = byBrand.get(b.brandSlug) ?? [b.brandSlug, b.brand, 0];
    cur[2]++;
    byBrand.set(b.brandSlug, cur);
  }
  const weights = sale.map((b) => b.weightG).filter((w): w is number => w !== null);
  const seen = new Set<number>();
  const mejores = [...sale]
    .filter((b) => b.category === "bici-infantil" || b.quality.coverage >= 0.6)
    .sort((a, b) => b.quality.total - a.quality.total || a.priceCents - b.priceCents)
    .filter((b) => (seen.has(b.modelId) ? false : (seen.add(b.modelId), true)))
    .slice(0, cuantas);
  return {
    total: sale.length,
    marcas: [...byBrand.values()].sort((a, b) => b[2] - a[2]),
    min: Math.min(...prices),
    max: Math.max(...prices),
    mediana: median(prices) ?? 0,
    pesoMediano: weights.length >= MIN_BICIS ? kg(median(weights)!) : null,
    conPesoOficial: weights.length,
    electricas: sale.filter((b) => b.electric).length,
    mejores,
  };
}

/** Las dos primeras frases de la página: la respuesta, con cifras */
export function introLanding(nombre: string, r: Resumen) {
  const top = r.marcas.slice(0, 3).map(([, n]) => n);
  return [
    `Hay ${int(r.total)} ${nombre} a la venta en Roodada, de ${int(r.marcas.length)} marcas, entre ${eur(r.min)} y ${eur(r.max)}. La mitad cuesta menos de ${eur(r.mediana)}.`,
    `${top.length > 1 ? `${top.slice(0, -1).join(", ")} y ${top.at(-1)} son las marcas` : `${top[0]} es la marca`} con más modelos${r.pesoMediano ? `, y el peso típico, cuando la marca lo publica, es de ${r.pesoMediano}` : ""}.`,
  ];
}

export type Pregunta = { q: string; a: string };

/** Preguntas frecuentes con respuesta sacada de los datos (también van como FAQPage) */
export function preguntasLanding(nombre: string, r: Resumen): Pregunta[] {
  const out: Pregunta[] = [
    {
      q: `¿Cuánto cuestan las ${nombre}?`,
      a: `Entre ${eur(r.min)} y ${eur(r.max)}. La mitad de las ${int(r.total)} que hay a la venta cuesta menos de ${eur(r.mediana)}. Son precios de la web de cada marca o de la tienda que la vende.`,
    },
    {
      q: `¿Qué marcas tienen más ${nombre}?`,
      a: r.marcas.slice(0, 5).map(([, n, c]) => `${n} (${int(c)})`).join(", ") + ".",
    },
  ];
  if (r.pesoMediano) {
    out.push({
      q: `¿Cuánto pesan las ${nombre}?`,
      a: `El peso típico es de ${r.pesoMediano}, calculado con las ${int(r.conPesoOficial)} que tienen peso oficial publicado.`,
    });
  }
  out.push({
    q: "¿Qué talla necesito?",
    a: "Depende de tu altura y de la geometría de cada modelo: la misma altura puede ser una M en una marca y una L en otra. En cada ficha te decimos la talla con la tabla oficial de la marca, y la guía la calcula para todas a la vez.",
  });
  return out;
}

/** «74 de montaña», «24 urbanas y de paseo», «8 infantiles» */
const CATEGORY_COUNT: Record<Category, string> = {
  "bici-carretera": "de carretera",
  "bici-gravel": "de gravel",
  "bici-mtb": "de montaña",
  "bici-urbana": "urbanas y de paseo",
  "bici-infantil": "infantiles",
};

/** Resumen y preguntas de una marca */
export function introMarca(marca: string, r: Resumen, porTipo: [Category, number][]) {
  const lista = porTipo.map(([c, n]) => `${int(n)} ${CATEGORY_COUNT[c]}`);
  const tipos = lista.length > 1 ? `${lista.slice(0, -1).join(", ")} y ${lista.at(-1)}` : lista[0];
  return [
    `${marca} tiene ${int(r.total)} bicis a la venta en Roodada: ${tipos}. Cuestan entre ${eur(r.min)} y ${eur(r.max)}, y la mitad menos de ${eur(r.mediana)}.`,
    r.electricas ? `${int(r.electricas)} son eléctricas.` : `Ninguna es eléctrica.`,
  ];
}

export function preguntasMarca(marca: string, r: Resumen, porTipo: [Category, number][]): Pregunta[] {
  const share = r.total ? Math.round((r.conPesoOficial / r.total) * 100) : 0;
  return [
    {
      q: `¿Cuánto cuestan las bicis ${marca}?`,
      a: `Entre ${eur(r.min)} y ${eur(r.max)}. La mitad de las ${int(r.total)} que tiene a la venta cuesta menos de ${eur(r.mediana)}, según su web oficial o la tienda que la vende.`,
    },
    {
      q: `¿Qué tipos de bici hace ${marca}?`,
      a: porTipo.map(([c, n]) => `${CATEGORY_LABEL[c]} (${int(n)})`).join(", ") + ".",
    },
    {
      q: `¿${marca} publica el peso de sus bicis?`,
      a:
        share >= 90
          ? `Sí, en ${share} % de sus bicis.`
          : share > 0
            ? `Solo en el ${share} % de sus bicis. En las demás damos un peso estimado, siempre marcado como tal.`
            : `No. Damos un peso estimado con su margen, siempre marcado como tal.`,
    },
  ];
}

/** Datos del menú principal: tipos con sus subtipos y marcas, con cuántas bicis a la venta tiene cada uno */
export type Menu = {
  tipos: { titulo: string; path: string; n: number; subs: { titulo: string; path: string; n: number }[] }[];
  marcas: { nombre: string; slug: string; n: number }[];
};

/** «Bicis de carretera de competición» → «Competición»; «Bicis de montaña eléctricas» → «Montaña» */
const corto = (titulo: string) =>
  titulo
    .replace(/^Bicis (de )?/, "")
    .replace(/^carretera de /, "")
    .replace(/ eléctricas$/, "")
    .replace(/^./, (c) => c.toUpperCase());

export function buildMenu(bikes: Bike[]): Menu {
  const sale = aLaVenta(bikes);
  const landings = allLandings(bikes);
  const n = (l: Landing) => sale.filter(l.filtro).length;
  const tipos = landings
    .filter((l) => l.clase === "tipo" || l.clase === "electricas")
    .map((l) => ({
      // En el menú, el nombre corto: «Gravel», «Eléctricas»
      titulo: l.ruta[0] === "electricas" ? "Eléctricas" : CATEGORY_LABEL[categoryFromSlug(l.ruta[0])],
      path: `/bicis/${l.ruta[0]}`,
      n: n(l),
      subs: landings
        .filter((s) => (s.clase === "subtipo" || s.clase === "electricas-tipo") && s.ruta[0] === l.ruta[0])
        .map((s) => ({ titulo: corto(s.titulo), path: `/bicis/${s.ruta.join("/")}`, n: n(s) }))
        .sort((a, b) => b.n - a.n),
    }));
  const by = new Map<string, { nombre: string; slug: string; n: number }>();
  for (const b of sale) {
    const cur = by.get(b.brandSlug) ?? { nombre: b.brand, slug: b.brandSlug, n: 0 };
    cur.n++;
    by.set(b.brandSlug, cur);
  }
  const marcas = [...by.values()].filter((m) => m.n >= MIN_BICIS).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  return { tipos, marcas };
}

/** Preguntas de una página de precio: qué comprar por ese dinero, qué grupo llevan y cuánto pesan */
export function preguntasPrecio(landing: Landing, r: Resumen, bikes: Bike[]): Pregunta[] {
  const precio = eur((landing.precio ?? 0) * 100);
  const base = landing.nombre.replace(/ por menos de .*$/, "");
  const sale = aLaVenta(bikes);
  const grupos = new Map<string, number>();
  for (const b of sale) if (b.specs.groupset) grupos.set(b.specs.groupset, (grupos.get(b.specs.groupset) ?? 0) + 1);
  const topGrupos = [...grupos.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const out: Pregunta[] = [
    {
      q: `¿Qué ${base} comprar por menos de ${precio}?`,
      a: `Las que mejor nota calidad-precio tienen ahora: ${r.mejores
        .slice(0, 3)
        .map((b) => `${b.brand} ${b.name} (${eur(b.priceCents)}, ${b.quality.total.toLocaleString("es-ES")}/10)`)
        .join(", ")}. Hay ${int(r.total)} en total, de ${int(r.marcas.length)} marcas.`,
    },
  ];
  if (topGrupos.length) {
    out.push({
      q: `¿Qué grupo de cambio llevan las ${base} por menos de ${precio}?`,
      a: `Los más habituales: ${topGrupos.map(([g, n]) => `${g} (${int(n)})`).join(", ")}.`,
    });
  }
  if (r.pesoMediano) {
    out.push({
      q: `¿Cuánto pesan?`,
      a: `El peso típico es de ${r.pesoMediano}, con las ${int(r.conPesoOficial)} que tienen peso oficial publicado.`,
    });
  }
  out.push({
    q: "¿Qué talla necesito?",
    a: "Depende de tu altura y de la geometría de cada modelo. Calcúlala en la calculadora de talla o en cada ficha, con la tabla oficial de la marca.",
  });
  return out;
}

/** Páginas de marca y tipo (/marcas/orbea/montana): al menos MIN_BICIS y no todas las de la marca */
export function marcaTipoLandings(bikes: Bike[]) {
  const sale = aLaVenta(bikes);
  const porMarca = new Map<string, { marca: string; total: number; tipos: Map<Category, number> }>();
  for (const b of sale) {
    const m = porMarca.get(b.brandSlug) ?? { marca: b.brand, total: 0, tipos: new Map() };
    m.total++;
    m.tipos.set(b.category, (m.tipos.get(b.category) ?? 0) + 1);
    porMarca.set(b.brandSlug, m);
  }
  const out: { slug: string; marca: string; categoria: Category; tipo: string; titulo: string; n: number }[] = [];
  for (const [slug, m] of porMarca) {
    for (const [categoria, n] of m.tipos) {
      if (n >= MIN_BICIS && n < m.total) {
        out.push({ slug, marca: m.marca, categoria, tipo: CATEGORY_SLUG[categoria], titulo: `${CATEGORY_TITLE[categoria]} ${m.marca}`, n });
      }
    }
  }
  return out;
}

/** Preguntas de una página de marca y tipo */
export function preguntasMarcaTipo(marca: string, nombre: string, r: Resumen, bikes: Bike[]): Pregunta[] {
  const sale = aLaVenta(bikes);
  const subtipos = new Map<string, number>();
  for (const b of sale) subtipos.set(b.specs.discipline, (subtipos.get(b.specs.discipline) ?? 0) + 1);
  const share = r.total ? Math.round((r.conPesoOficial / r.total) * 100) : 0;
  const out: Pregunta[] = [
    {
      q: `¿Cuánto cuestan las ${nombre}?`,
      a: `Entre ${eur(r.min)} y ${eur(r.max)}. La mitad de las ${int(r.total)} que tiene a la venta cuesta menos de ${eur(r.mediana)}.`,
    },
    {
      q: `¿Cuál es la mejor calidad-precio?`,
      a: `Ahora mismo: ${r.mejores
        .slice(0, 3)
        .map((b) => `${b.name} (${eur(b.priceCents)}, ${b.quality.total.toLocaleString("es-ES")}/10)`)
        .join(", ")}, comparadas con bicis parecidas de todas las marcas.`,
    },
  ];
  if (subtipos.size > 1) {
    out.push({
      q: `¿Qué modalidades cubre ${marca}?`,
      a: [...subtipos.entries()].sort((a, b) => b[1] - a[1]).map(([d, n]) => `${modalidad(d)} (${int(n)})`).join(", ") + ".",
    });
  }
  out.push({
    q: `¿${marca} publica el peso?`,
    a: share >= 90 ? `Sí, en el ${share} % de estas bicis.` : share > 0 ? `Solo en el ${share} %; en las demás damos un peso estimado, marcado como tal.` : `No; damos un peso estimado, marcado como tal.`,
  });
  return out;
}

const modalidad = (d: string) =>
  (DISCIPLINE_TITLE[d as Discipline]?.replace(/^Bicis (de )?/, "") ?? d).replace(/^./, (c) => c.toUpperCase());

/** Las dos primeras frases de una página de marca y tipo */
export function introMarcaTipo(marca: string, tipoNombre: string, r: Resumen, bikes: Bike[]) {
  const subtipos = new Map<string, number>();
  for (const b of aLaVenta(bikes)) subtipos.set(b.specs.discipline, (subtipos.get(b.specs.discipline) ?? 0) + 1);
  const lista = [...subtipos.entries()].sort((a, b) => b[1] - a[1]).map(([d, n]) => `${modalidad(d)} (${int(n)})`);
  return [
    `${marca} tiene ${int(r.total)} ${tipoNombre} a la venta en Roodada, entre ${eur(r.min)} y ${eur(r.max)}. La mitad cuesta menos de ${eur(r.mediana)}.`,
    lista.length > 1 ? `Por modalidad: ${lista.join(", ")}.` : r.pesoMediano ? `El peso típico, donde ${marca} lo publica, es de ${r.pesoMediano}.` : `Las mejores por calidad-precio, abajo.`,
  ];
}
