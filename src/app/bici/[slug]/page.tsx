import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Gallery } from "@/components/Gallery";
import { GeometryTable, geometrySizeCount } from "@/components/GeometryTable";
import { QualityBadge } from "@/components/QualityBadge";
import { SizeFinder } from "@/components/SizeFinder";
import { WhyForYou } from "@/components/WhyForYou";
import { specCount, SpecRow, SpecTable } from "@/components/SpecTable";
import { BikeCard } from "@/components/BikeCard";
import { getAlternatives, getBike, getBikeDetail, getSlugs } from "@/lib/catalog/load";
import { preguntasFicha } from "@/lib/fichaPreguntas";
import { categoryPath } from "@/lib/landings";
import { AFFILIATE_NOTICE } from "@/lib/legal";
import { JsonLd } from "@/components/JsonLd";
import { TrackEvent } from "@/components/TrackEvent";
import { bikeDescription, bikeTitle, breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import { PriceChecked } from "@/components/PriceChecked";
import { CATEGORY_LABEL, day, DISCIPLINE_LABEL, eur, NO_PRICE } from "@/lib/format";
import { otraTienda, priceOrigin, shortStore, tallasTexto } from "@/lib/priceOrigin";
import { InfoTip } from "@/components/InfoTip";

/** Importe con céntimos («89,90 €»), para el envío */
const eurCents = (cents: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 2, useGrouping: "always" }).format(cents / 100);
/** Diferencias: sin céntimos si son euros redondos («3.519 €»), con céntimos si no («89,90 €») */
const money = (cents: number) => (cents % 100 ? eurCents(cents) : eur(cents));

/** Etiqueta del precio más barato (verde de rebaja, como las bajadas de precio de la web) */
function Cheapest() {
  return (
    <span className="inline-block align-middle ml-1 bg-rebaja text-white eyebrow px-0.5 py-px leading-tight">
      <span aria-hidden="true">✓ </span>Más barato
    </span>
  );
}

// En el build solo se generan unas pocas fichas: las 2.100+ de golpe agotan la memoria del build de
// Vercel. El resto se genera en la primera visita y queda en caché igual que si fuera del build
// (dynamicParams sigue activo), así que Google recibe siempre una página ya hecha.
const FICHAS_EN_BUILD = 100;

export async function generateStaticParams() {
  return (await getSlugs()).slice(0, FICHAS_EN_BUILD).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/bici/[slug]">): Promise<Metadata> {
  const bike = await getBike((await params).slug);
  if (!bike) return {};
  return {
    title: bikeTitle(bike),
    description: bikeDescription(bike),
    alternates: { canonical: `/bici/${bike.slug}` },
    openGraph: { images: [bike.imageUrl], type: "website" },
  };
}

export default async function BikePage({ params, searchParams }: PageProps<"/bici/[slug]">) {
  const bike = await getBike((await params).slug);
  if (!bike) notFound();
  const detail = await getBikeDetail(bike.id);
  // Mismo orden de tallas que el catálogo (por altura), no el sort_order de la base
  const order = new Map(bike.sizes.map((s, i) => [s.label, i]));
  const geometry = [...detail.geometry].sort((a, b) => (order.get(a.label) ?? 99) - (order.get(b.label) ?? 99));
  // Tallas con alguna medida publicada (contador del desplegable de geometría)
  const geoSizes = geometrySizeCount(geometry);
  const photos = detail.photos.length ? detail.photos : [{ url: bike.imageUrl, alt: null }]; // imageUrl ya trae SIN_FOTO si no hay
  const name = `${bike.brand} ${bike.name}`;
  const kind = bike.specs.discipline === "infantil" ? CATEGORY_LABEL[bike.category] : DISCIPLINE_LABEL[bike.specs.discipline];
  // Precio: el de la mejor oferta activa (aunque esté agotada, la ficha enseña lo que costaba)
  const offer = detail.offer;
  const priceCents = offer ? offer.priceCents : null;
  const from = bike.priceState === "desde";
  const origin = priceOrigin(offer?.storeSlug ?? null, bike.brand, { from, hasEuros: priceCents !== null });
  const store = shortStore(offer?.store ?? null, bike.brand);
  // Otras tiendas (no la web de la marca): textos de la fila «Precio de otro proveedor» y del desplegable
  const tallasBici = bike.sizes.map((s) => s.label);
  const otras = detail.otherOffers.map((o) => {
    const tienda = otraTienda(o.storeSlug, o.storeName);
    const tallas = tallasTexto(o.sizes, tallasBici);
    const envio = o.shippingCents > 0 ? `${eurCents(o.shippingCents)} de envío a España` : null;
    const explicacion = [
      `Este precio corresponde a ${tienda.name}, ${tienda.what} que vende bicis de ${bike.brand}.`,
      envio && `Incluye ${envio}.`,
      tienda.tax,
      !o.inStock
        ? "Ahora mismo no la tiene en stock."
        : tallas
          ? `Tiene esta bici en ${tallas}.`
          : `${tienda.name} no indica qué tallas tiene disponibles: mejor confírmalo en su web antes de comprar.`,
      `Comprobado el ${day(o.checkedAt)}.`,
    ]
      .filter(Boolean)
      .join(" ");
    const resumen = [tienda.name, !o.inStock ? "sin stock" : (tallas ?? "tallas por confirmar"), envio && "envío incluido"].filter(Boolean).join(" · ");
    const detalle = [
      !o.inStock ? "Sin stock" : tallas ? tallas.charAt(0).toUpperCase() + tallas.slice(1) : "Tallas por confirmar",
      o.inStock && "en stock",
      envio && "envío a España incluido",
      tienda.country && `tienda en ${tienda.country}`,
    ]
      .filter(Boolean)
      .join(" · ");
    return { ...o, tienda, explicacion, resumen, detalle };
  });
  // El más barato: solo entre ofertas en stock y con precio en € (con el envío ya incluido). Se marca si gana
  // por 1 € o más; si empatan, ninguna etiqueta y «mismo precio».
  const BRAND = "marca";
  const cands = [
    ...(offer?.inStock && priceCents !== null ? [{ key: BRAND, name: "la web oficial", cents: priceCents, shipping: 0 }] : []),
    ...otras.filter((o) => o.inStock && o.priceCents !== null).map((o) => ({ key: String(o.offerId), name: o.tienda.name, cents: o.priceCents!, shipping: o.shippingCents })),
  ].sort((a, b) => a.cents - b.cents);
  const winner = cands.length > 1 && cands[1].cents - cands[0].cents >= 100 ? cands[0] : null;
  const tie = cands.length > 1 && !winner;
  const brandCand = cands.find((c) => c.key === BRAND);
  /** Línea gris de una fila que no es la más barata: cuánto más cuesta y frente a quién */
  const diffText = (key: string): string | null => {
    const me = cands.find((c) => c.key === key);
    if (!me) return null;
    if (tie && cands.some((c) => c.key !== key && Math.abs(c.cents - me.cents) < 100)) return "Mismo precio";
    if (!winner || winner.key === key) return null;
    const d = me.cents - winner.cents;
    if (winner.key === BRAND) return d === me.shipping ? `${money(d)} más (el envío)` : `${money(d)} más que en la web oficial`;
    return `${money(d)} más que en ${winner.name}`;
  };
  /** Línea del desplegable: «ahorras X» si gana, «X más que la web oficial» si no */
  const saveText = (key: string): string | null => {
    if (winner?.key === key && brandCand && brandCand.key !== key) return `ahorras ${money(brandCand.cents - winner.cents)}`;
    const d = diffText(key);
    return d ? d.charAt(0).toLowerCase() + d.slice(1) : null;
  };
  const isBest = (key: string) => winner?.key === key;
  const alternativas = await getAlternatives(bike);
  const preguntas = preguntasFicha(bike, alternativas);

  return (
    <div className="wrap pt-2 pb-4 grid grid-cols-[minmax(0,1fr)] gap-4">
      <TrackEvent key={bike.id} nombre="ficha_vista" datos={{ bici: bike.id, marca: bike.brand, categoria: bike.category }} />
      {/* Para Google y los buscadores de IA: qué producto es, su precio y dónde está en la web */}
      <JsonLd
        data={[
          productJsonLd(bike, photos, offer ? { priceCents: offer.priceCents, inStock: offer.inStock, store: offer.store } : null),
          breadcrumbJsonLd([
            { name: "Bicis", path: "/bicis" },
            { name: CATEGORY_LABEL[bike.category], path: categoryPath(bike.category) },
            { name: bike.brand, path: `/marcas/${bike.brandSlug}` },
            { name, path: `/bici/${bike.slug}` },
          ]),
          ...(preguntas.length
            ? [{
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: preguntas.map((p) => ({ "@type": "Question", name: p.q, acceptedAnswer: { "@type": "Answer", text: p.a } })),
              }]
            : []),
        ]}
      />
      <nav aria-label="Estás en" className="eyebrow">
        <ol className="flex flex-wrap gap-1 list-none m-0 p-0">
          <li><Link href="/bicis" className="link inline-flex items-center min-h-3">Bicis</Link> /</li>
          <li><Link href={categoryPath(bike.category)} className="link inline-flex items-center min-h-3">{CATEGORY_LABEL[bike.category]}</Link> /</li>
          <li><Link href={`/marcas/${bike.brandSlug}`} className="link inline-flex items-center min-h-3">{bike.brand}</Link></li>
        </ol>
      </nav>

      {/* Desde los resultados de la guía: la explicación larga. La ficha sigue siendo estática; esto se rellena aparte */}
      <Suspense fallback={null}>
        <WhyForYou bike={bike} searchParams={searchParams} />
      </Suspense>

      {/* Ficha: marco con cabecera, producto y filas de dato, como una etiqueta de producto */}
      <article className="border border-border bg-white" aria-labelledby="nombre">
        <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-2 py-2 border-b border-border">
          <p className="font-display text-h4 uppercase leading-none">{bike.brand}</p>
          <p className="eyebrow">
            {[kind, bike.electric ? "Eléctrica" : null, bike.modelYear].filter(Boolean).join(" · ")}
          </p>
        </header>

        <div className="lg:grid lg:grid-cols-12">
          <div className="lg:col-span-7 lg:border-r border-border">
            <Gallery photos={photos} name={name} transitionName={`foto-${bike.id}`} bici={bike.id} />
          </div>

          <dl className="lg:col-span-5 m-0 border-t border-border lg:border-t-0 [&>div:first-child]:border-t-0">
            <SpecRow label="Modelo">
              {/* La marca ya se ve en la cabecera de la ficha; en el título va para lectores de pantalla y buscadores */}
              <h1 id="nombre" className="font-display text-h2 leading-tight"><span className="sr-only">{bike.brand} </span>{bike.name}</h1>
            </SpecRow>
            <SpecRow label="Precio" className={isBest(BRAND) ? "bg-rebaja/10" : ""}>
              {/* El ⓘ va pegado al precio; al abrirlo, la explicación sale debajo */}
              <InfoTip
                label="Cómo leemos este precio"
                text={
                  <>
                    Precio de la web oficial de {store}.{origin.help && ` ${origin.help}`}
                    {origin.costsExtra !== false && " No incluye gastos de envío ni otros costes asociados."}
                  </>
                }
              >
                <span className={priceCents === null ? "font-display text-h4" : "font-display text-h3 num"}>
                  {priceCents === null ? NO_PRICE : `${from ? "Desde " : bike.priceState === "estimado" ? "Precio est. " : ""}${eur(priceCents)}`}
                </span>
              </InfoTip>
              {isBest(BRAND) && <Cheapest />}
              {diffText(BRAND) && <span className="block text-small text-text-muted mt-0.5">{diffText(BRAND)}</span>}
              {priceCents === null && detail.foreignPrice && (
                <span className="block text-small">En su web: {detail.foreignPrice} (sin convertir a euros)</span>
              )}
            </SpecRow>
            {/* Otras tiendas que venden esta bici (Hibike…): una fila por tienda, debajo del precio de la marca */}
            {otras.map((o) => (
              <SpecRow key={o.offerId} label="Precio de otro proveedor" className={isBest(String(o.offerId)) ? "bg-rebaja/10" : ""}>
                <InfoTip label={`Sobre el precio de ${o.tienda.name}`} text={o.explicacion}>
                  <span className={o.priceCents === null ? "font-display text-h4" : "font-display text-h4 num"}>
                    {o.priceCents === null ? NO_PRICE : money(o.priceCents)}
                  </span>
                </InfoTip>
                {isBest(String(o.offerId)) && <Cheapest />}
                <span className="block text-small mt-0.5">{o.resumen}</span>
                {diffText(String(o.offerId)) && <span className="block text-small text-text-muted">{diffText(String(o.offerId))}</span>}
              </SpecRow>
            ))}
            <SpecRow label="Origen">{origin.label}</SpecRow>
            <SpecRow label="Disponible">
              {offer ? (
                <>
                  {/* 🟢 en stock · 🔴 sin stock · 🟡 la marca vende por tiendas o por presupuesto: su web no dice si hay */}
                  <span aria-hidden="true">{!offer.inStock ? "🔴" : origin.stockUnknown ? "🟡" : "🟢"}</span>{" "}
                  {!offer.inStock ? "Sin stock" : origin.stockUnknown ? "Stock por confirmar en tiendas" : "En stock"}. Link a la web más abajo.
                </>
              ) : (
                <><span aria-hidden="true">🔴</span> Sin oferta en la web oficial.</>
              )}
            </SpecRow>
            {offer?.checkedAt && (
              <SpecRow label="Actualizado">
                <PriceChecked iso={offer.checkedAt} />
              </SpecRow>
            )}
            {bike.category !== "bici-infantil" && (
              <SpecRow label="Calidad-precio">
                <QualityBadge bike={bike} large />
                <span className="block text-small mt-0.5">
                  Frente a otras bicis de su tipo. Datos disponibles: {Math.round(bike.quality.coverage * 100)} %.
                </span>
              </SpecRow>
            )}
            <SpecRow label="¿Es para ti?">
              <Suspense fallback={null}>
                <SizeFinder sizes={bike.sizes} />
              </Suspense>
            </SpecRow>
            <div className="border-t border-border p-2 grid gap-1">
              <a href={`/ir/${bike.slug}`} rel="sponsored nofollow noopener" target="_blank" className="btn btn-solid btn-lg w-full">
                Comprar en la web oficial
                <span aria-hidden="true">↗</span>
                <span className="sr-only">(se abre en otra pestaña)</span>
              </a>
              <p className="text-small">Link a la web oficial de {store}</p>
              {/* Solo cuando el enlace es de afiliado: la ley pide identificarlo como comunicación comercial */}
              {detail.offer?.affiliateUrl && <p className="text-small">{AFFILIATE_NOTICE}</p>}
              {otras.length > 0 && (
                <details className="border border-border group mt-1">
                  <summary className="flex items-center justify-between gap-2 px-2 py-1.5 cursor-pointer list-none [&::-webkit-details-marker]:hidden eyebrow">
                    Opciones de otros proveedores ({otras.length})
                    <span aria-hidden="true" className="inline-block group-open:rotate-45 transition-transform motion-reduce:transition-none">+</span>
                  </summary>
                  <ul className="list-none m-0 p-0 border-t border-border">
                    {otras.map((o) => (
                      <li
                        key={o.offerId}
                        className={`grid grid-cols-[minmax(0,1fr)_auto] gap-x-2 gap-y-1 p-2 border-t border-border first:border-t-0 ${isBest(String(o.offerId)) ? "bg-rebaja/10" : ""}`}
                      >
                        <span className="font-semibold">
                          {o.tienda.name}
                          {isBest(String(o.offerId)) && <Cheapest />}
                        </span>
                        <span className="font-display num">{o.priceCents === null ? NO_PRICE : money(o.priceCents)}</span>
                        <span className="col-span-2 text-small">{[o.detalle, saveText(String(o.offerId))].filter(Boolean).join(" · ")}</span>
                        <a
                          href={`/ir/${bike.slug}?o=${o.offerId}`}
                          rel="sponsored nofollow noopener"
                          target="_blank"
                          className="btn col-span-2 justify-self-start"
                        >
                          Ver en {o.tienda.name}
                          <span aria-hidden="true">↗</span>
                          <span className="sr-only">(se abre en otra pestaña)</span>
                        </a>
                        {o.affiliateUrl && <p className="col-span-2 text-small">{AFFILIATE_NOTICE}</p>}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </dl>
        </div>
      </article>

      {/* Desplegable como Geometría y Montaje completo; abierto al entrar, que es lo que más se consulta */}
      <details open className="border border-border group">
        <summary className="flex items-center justify-between gap-2 px-2 py-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <h2 id="specs" className="font-display text-h3 uppercase">Especificaciones</h2>
          <span className="eyebrow num">
            {specCount(bike)} datos <span aria-hidden="true" className="inline-block group-open:rotate-45 transition-transform motion-reduce:transition-none">+</span>
          </span>
        </summary>
        <SpecTable bike={bike} />
      </details>

      {detail.components.length > 0 && (
        <details className="border border-border group">
          <summary className="flex items-center justify-between gap-2 px-2 py-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <h2 className="font-display text-h3 uppercase">Montaje completo</h2>
            <span className="eyebrow num">
              {detail.components.length} piezas <span aria-hidden="true" className="inline-block group-open:rotate-45 transition-transform motion-reduce:transition-none">+</span>
            </span>
          </summary>
          <dl className="m-0 lg:columns-2 lg:gap-0 lg:[column-rule:1px_solid_var(--ds-border)]">
            {detail.components.map((c, i) => (
              <div key={`${c.role}-${i}`} className="break-inside-avoid">
                <SpecRow label={COMPONENT_LABEL[c.role] ?? c.role}>{c.description}</SpecRow>
              </div>
            ))}
          </dl>
        </details>
      )}

      <details className="border border-border group">
        <summary className="flex items-center justify-between gap-2 px-2 py-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <h2 id="geo" className="font-display text-h3 uppercase">Geometría</h2>
          <span className="eyebrow num">
            {geoSizes > 0 ? `${geoSizes} ${geoSizes === 1 ? "talla" : "tallas"}` : "No publicada"} <span aria-hidden="true" className="inline-block group-open:rotate-45 transition-transform motion-reduce:transition-none">+</span>
          </span>
        </summary>
        <GeometryTable geometry={geometry} />
      </details>

      {alternativas.length > 0 && (
        <section aria-labelledby="alternativas" className="grid gap-2">
          <h2 id="alternativas" className="font-display text-h3 uppercase border-t border-border pt-2">Alternativas por un precio parecido</h2>
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-1 md:gap-2 list-none m-0 p-0">
            {alternativas.map((b) => (
              <li key={b.id}>
                <BikeCard bike={b} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {preguntas.length > 0 && (
        <section aria-labelledby="preguntas" className="grid gap-2">
          <h2 id="preguntas" className="font-display text-h3 uppercase border-t border-border pt-2">Preguntas frecuentes</h2>
          <dl className="m-0 grid gap-2 max-w-[70ch]">
            {preguntas.map((p) => (
              <div key={p.q} className="grid gap-0.5">
                <dt className="font-display font-semibold">{p.q}</dt>
                <dd className="m-0">{p.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}

const COMPONENT_LABEL: Record<string, string> = {
  frame: "Cuadro", fork: "Horquilla", rear_shock: "Amortiguador", headset: "Dirección",
  crankset: "Bielas", chainring: "Plato", bottom_bracket: "Eje de pedalier", shifters: "Mandos",
  rear_derailleur: "Desviador trasero", front_derailleur: "Desviador delantero", cassette: "Cassette",
  chain: "Cadena", brakes: "Frenos", brake_front: "Freno delantero", brake_rear: "Freno trasero",
  brake_levers: "Manetas", rotors: "Discos", rotor_front: "Disco delantero", rotor_rear: "Disco trasero",
  wheels: "Ruedas", wheel_front: "Rueda delantera", wheel_rear: "Rueda trasera", rims: "Llantas",
  hubs: "Bujes", hub_front: "Buje delantero", hub_rear: "Buje trasero", spokes: "Radios",
  tyres: "Cubiertas", tyre_front: "Cubierta delantera", tyre_rear: "Cubierta trasera", tubes: "Cámaras",
  handlebar: "Manillar", stem: "Potencia", grips: "Puños / cinta", saddle: "Sillín", seatpost: "Tija",
  seatpost_clamp: "Abrazadera de tija", dropper: "Tija telescópica", dropper_remote: "Mando de tija",
  pedals: "Pedales", axle_front: "Eje delantero", axle_rear: "Eje trasero",
  motor: "Motor", battery: "Batería", display: "Pantalla", remote: "Mando", charger: "Cargador",
  lights: "Luces", light_front: "Luz delantera", light_rear: "Luz trasera", fenders: "Guardabarros",
  rack: "Portabultos", kickstand: "Caballete", bell: "Timbre", lock: "Candado", other: "Otros",
};
