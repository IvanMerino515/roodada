// De dónde sale el precio de cada oferta, contado igual en todas las fichas.
// Sale de cómo se capturó cada tienda (repo de datos: docs/extraccion/recaptura.md y el nombre de la tienda en
// la base). ⚠️ Si se añade una tienda cuyo precio no es el de España en € (o con otra condición), hay que añadirla aquí.

export type PriceOrigin = {
  /** Fila «Origen» de la ficha: corto */
  label: string;
  /** Texto extra del ⓘ, tras «Precio de la web oficial de X.»: por qué este precio. null en el caso normal */
  help: string | null;
  /** false si el precio ya incluye el envío (no se añade «No incluye gastos de envío…») */
  costsExtra?: boolean;
  /** La marca vende por tiendas o por presupuesto: su web no dice si hay stock (🟡 «Stock por confirmar») */
  stockUnknown?: boolean;
};

type Origen = (brand: string) => PriceOrigin;

const PVP_EN_TIENDAS: Origen = (brand) => ({
  stockUnknown: true,
  label: "PVP en España",
  help: `${brand} vende a través de tiendas: es el precio de venta recomendado que publica su web para España, con IVA. Cada tienda puede variarlo.`,
});
const TIENDA_EUROPA: Origen = (brand) => ({
  label: "Tienda europea, precio para España",
  help: `Es el precio de la tienda oficial europea de ${brand} con España como país de envío, con IVA.`,
});

const POR_TIENDA: Record<string, Origen> = {
  "stevens-oficial-de": () => ({
    label: "PVP de Alemania",
    help: "Stevens no muestra precio para España: es el precio recomendado de su web alemana, con IVA alemán. En España puede ser distinto.",
  }),
  "pivot-oficial-de": () => ({
    label: "PVP de Alemania",
    help: "Pivot no muestra precio para España: es el de su tienda oficial europea para Alemania, con IVA alemán. En España puede ser distinto.",
  }),
  "radon-oficial": () => ({
    label: "Precio de Alemania",
    help: "Precio de la web de la marca (radon-bikes.de), con IVA alemán. Radon vende en su tienda bike-discount.de: allí y al enviarla a España el precio puede ser distinto.",
  }),
  "ventum-oficial-eu": () => ({
    stockUnknown: true,
    label: "Precio de la web europea",
    help: "Precio de la web europea de Ventum (eu.ventumracing.com), que no dice si lleva IVA. En Europa se compra en Woest Sport (Países Bajos), donde el precio puede ser distinto.",
  }),
  "gazelle-oficial-fr": () => ({
    stockUnknown: true,
    label: "PVP de Francia",
    help: "Gazelle no tiene web ni precio para España: es el precio recomendado de su web francesa, con IVA francés. En España puede ser distinto.",
  }),
  "ktm-oficial": () => ({
    stockUnknown: true,
    label: "Precio recomendado de la marca",
    help: "KTM publica un precio recomendado (SRP) en euros para su red de tiendas. Cada tienda puede variarlo.",
  }),
  "berria-oficial-es": () => ({
    stockUnknown: true,
    label: "Precio estimado",
    help: "Es el precio estimado que publica Berria. Berria no vende en línea: la bici se pide por presupuesto y el precio final lo confirma la marca.",
  }),
  "commencal-oficial-es": () => ({
    label: "Tienda europea, envío a España",
    help: "Es el precio de la tienda oficial europea de Commencal, que envía a España, con IVA.",
  }),
  "kona-oficial-eu": (brand) => ({ ...TIENDA_EUROPA(brand), stockUnknown: true }), // vende por tiendas
  "yt-oficial-eu": TIENDA_EUROPA,
  "wilier-oficial-es": () => ({
    label: "Precio zona España / UE",
    help: "Es el precio que da la web oficial de Wilier para la zona España / Unión Europea, con IVA.",
  }),
  "argon18-oficial-es": PVP_EN_TIENDAS,
  "look-oficial-es": PVP_EN_TIENDAS,
  "moustache-oficial-es": PVP_EN_TIENDAS,
  "avenger-oficial": () => ({
    label: "Solo en dólares",
    help: "Solo vende en dólares (también a España), sin IVA ni aranceles: compra directa desde China. No lo convertimos a euros: el cambio y los impuestos dependen del día y del pedido.",
  }),
  "elves-uk-europa": () => ({
    label: "Solo en libras",
    help: "Es su agente oficial para Reino Unido y Europa y solo vende en libras, con IVA británico. No lo convertimos a euros: el cambio depende del día. Según sus condiciones, a la mayoría de la UE no cobra envío ni aranceles extra.",
    costsExtra: false,
  }),
};

export function priceOrigin(storeSlug: string | null, brand: string, opts: { from: boolean; hasEuros: boolean }): PriceOrigin {
  if (opts.from) {
    return {
      label: "Precio de partida",
      help: `${brand} vende esta bici con montaje a elegir en su configurador: es el precio más bajo. El final depende de lo que elijas.`,
    };
  }
  const own = storeSlug ? POR_TIENDA[storeSlug] : undefined;
  if (own) return own(brand);
  if (!opts.hasEuros) {
    return {
      label: "Sin precio en la web",
      help: `La web oficial de ${brand} no mostraba precio para esta bici cuando la comprobamos.`,
    };
  }
  return { label: "Precio para España", help: null };
}

/** «Trek España (web oficial)» → «Trek»; «Pivot Europa (tienda oficial…)» → «Pivot» */
export function shortStore(name: string | null, brand: string) {
  const s = (name ?? "").split(" (")[0].replace(/\s+(España|Europa)$/, "").trim();
  return s || brand;
}

/** Precio en otra moneda que la nota de la base guarda tal cual («Precio base: 3.449 $», «Precio: 3.200 £») */
export function foreignPrice(notes: string | null): string | null {
  if (!notes || !/PENDIENTE DE CONVERTIR/i.test(notes)) return null;
  const m = notes.match(/(\d{1,3}(?:\.\d{3})+|\d+)(?:,\d+)? ?([$£])/);
  return m ? `${m[1]} ${m[2]}` : null;
}

// ── Otras tiendas (no la web de la marca): fila «Precio de otro proveedor» y desplegable de la ficha ──
// ⚠️ Al añadir una tienda que no es de marca (kind ≠ marca_directa), ponerla aquí: nombre corto, qué es y el IVA.

type OtraTienda = {
  /** Nombre corto para la ficha («Hibike») */
  name: string;
  /** Qué es, para «Este precio corresponde a Hibike, …» */
  what: string;
  /** Una frase sobre el IVA o lo que puede cambiar, o null */
  tax: string | null;
  /** País desde el que vende, para la línea del desplegable («tienda en Alemania») */
  country: string;
};

const OTRAS_TIENDAS: Record<string, OtraTienda> = {
  "hibike-es": {
    name: "Hibike",
    what: "una tienda online de Alemania",
    tax: "Es el precio de su web, con IVA alemán: al pedirla desde España el importe final puede variar.",
    country: "Alemania",
  },
};

export function otraTienda(slug: string, fallbackName: string): OtraTienda {
  return OTRAS_TIENDAS[slug] ?? { name: fallbackName, what: "una tienda online", tax: null, country: "" };
}

/** «talla M», «tallas S, XL y XXL», «todas las tallas»; null si la tienda no lo indica */
export function tallasTexto(sizes: string[] | null, all: string[]): string | null {
  if (!sizes) return null;
  if (!sizes.length) return "sin tallas en stock";
  if (all.length > 1 && all.every((t) => sizes.includes(t))) return "todas las tallas";
  if (sizes.length === 1) return `talla ${sizes[0]}`;
  return `tallas ${sizes.slice(0, -1).join(", ")} y ${sizes.at(-1)}`;
}
