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
import { CATEGORY_LABEL, DISCIPLINE_LABEL, eur, NO_PRICE } from "@/lib/format";
import { priceOrigin, shortStore } from "@/lib/priceOrigin";

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
            <Gallery photos={photos} name={name} transitionName={`foto-${bike.id}`} />
          </div>

          <dl className="lg:col-span-5 m-0 border-t border-border lg:border-t-0 [&>div:first-child]:border-t-0">
            <SpecRow label="Modelo">
              {/* La marca ya se ve en la cabecera de la ficha; en el título va para lectores de pantalla y buscadores */}
              <h1 id="nombre" className="font-display text-h2 leading-tight"><span className="sr-only">{bike.brand} </span>{bike.name}</h1>
            </SpecRow>
            <SpecRow label="Precio">
              {/* El ⓘ va arriba a la derecha; al abrirlo, la explicación sale bajo el precio */}
              <div className="relative pr-4">
                <span className={priceCents === null ? "font-display text-h4" : "font-display text-h3 num"}>
                  {priceCents === null ? NO_PRICE : `${from ? "Desde " : bike.priceState === "estimado" ? "Precio est. " : ""}${eur(priceCents)}`}
                </span>
                {priceCents === null && detail.foreignPrice && (
                  <span className="block text-small">En su web: {detail.foreignPrice} (sin convertir a euros)</span>
                )}
                <details>
                  <summary
                    aria-label="Cómo leemos este precio"
                    title="Cómo leemos este precio"
                    className="absolute top-0 right-0 list-none [&::-webkit-details-marker]:hidden cursor-pointer inline-flex items-center justify-center size-3 rounded-full border border-border text-small font-semibold leading-none select-none hover:bg-surface"
                  >
                    i
                  </summary>
                  <p className="text-small mt-0.5 border-l-2 border-border pl-1">
                    Precio de la web oficial de {store}.{origin.help && ` ${origin.help}`}
                    {origin.costsExtra !== false && " No incluye gastos de envío ni otros costes asociados."}
                  </p>
                </details>
              </div>
            </SpecRow>
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
