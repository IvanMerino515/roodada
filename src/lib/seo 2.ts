// Lo que la web le dice a Google y a los buscadores de IA: títulos, descripciones y datos
// estructurados (JSON-LD, schema.org). Funciones puras: se prueban sin servidor.
import type { Bike } from "./catalog/types";
import { CATEGORY_LABEL, DISCIPLINE_LABEL, priceLabel } from "./format";

export const SITE_NAME = "Roodada";

/** Dirección pública del sitio, sin barra final (https://roodada.com en producción) */
export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** Convierte una ruta del sitio en dirección completa; las que ya lo son se dejan tal cual */
export const abs = (path: string) => (/^https?:\/\//.test(path) ? path : `${siteUrl()}${path.startsWith("/") ? "" : "/"}${path}`);

const bikeName = (b: Pick<Bike, "brand" | "name">) => `${b.brand} ${b.name}`;
const kindOf = (b: Pick<Bike, "specs" | "category">) =>
  b.specs.discipline === "infantil" ? CATEGORY_LABEL[b.category] : DISCIPLINE_LABEL[b.specs.discipline];

/** «Orbea Terra H40 1X (2026): precio, talla y geometría». La plantilla del layout añade « · Roodada». */
export function bikeTitle(b: Pick<Bike, "brand" | "name" | "modelYear">) {
  return `${bikeName(b)}${b.modelYear ? ` (${b.modelYear})` : ""}: precio, talla y geometría`;
}

/** Descripción para el resultado de Google: precio, tipo, grupo y lo que solo tiene Roodada */
export function bikeDescription(b: Pick<Bike, "brand" | "name" | "priceCents" | "priceState" | "specs" | "category">) {
  const parts = [priceLabel(b), kindOf(b).toLowerCase(), b.specs.groupset].filter(Boolean).join(", ");
  return `${bikeName(b)}: ${parts}. Qué talla te corresponde según tu altura, geometría completa y nota calidad-precio frente a bicis parecidas.`;
}

type Offer = { priceCents: number | null; inStock: boolean; store: string } | null;

/**
 * Product de schema.org para la ficha. Solo lleva oferta cuando hay precio en euros y no es un
 * «desde» (un precio de partida contado como precio real engañaría en el buscador). El peso, solo
 * si es el oficial: el estimado no se publica como dato del producto.
 */
export function productJsonLd(
  b: Pick<Bike, "slug" | "brand" | "name" | "modelName" | "modelYear" | "category" | "specs" | "weightG" | "priceState" | "imageUrl">,
  photos: { url: string }[],
  offer: Offer,
) {
  const url = abs(`/bici/${b.slug}`);
  const images = [...new Set([b.imageUrl, ...photos.map((p) => p.url)])].filter(Boolean).slice(0, 5).map(abs);
  const withOffer = offer && offer.priceCents !== null && b.priceState === "ok";
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: bikeName(b),
    url,
    image: images,
    brand: { "@type": "Brand", name: b.brand },
    model: b.modelName,
    category: `Bicicletas > ${CATEGORY_LABEL[b.category]} > ${kindOf(b)}`,
    ...(b.modelYear ? { releaseDate: String(b.modelYear) } : {}),
    ...(b.weightG ? { weight: { "@type": "QuantitativeValue", value: Math.round(b.weightG / 100) / 10, unitCode: "KGM" } } : {}),
    ...(withOffer
      ? {
          offers: {
            "@type": "Offer",
            url,
            price: (offer.priceCents! / 100).toFixed(2),
            priceCurrency: "EUR",
            availability: offer.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: offer.store },
          },
        }
      : {}),
  };
}

/** Migas de pan: lo mismo que se ve arriba de la ficha */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

/** Quién es Roodada y qué web es: en la portada */
export function siteJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl(),
      logo: abs("/logo.png"),
      description: "Guía de compra y comparador de bicicletas con datos reales: talla según tu altura, componentes y precio.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: siteUrl(),
      inLanguage: "es-ES",
    },
  ];
}

/** El JSON-LD dentro de un <script>, escapando «<» para que ningún texto pueda cerrar la etiqueta */
export const jsonLdHtml = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
