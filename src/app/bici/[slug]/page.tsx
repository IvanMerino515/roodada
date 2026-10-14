import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Gallery } from "@/components/Gallery";
import { GeometryTable } from "@/components/GeometryTable";
import { QualityBadge } from "@/components/QualityBadge";
import { SizeFinder } from "@/components/SizeFinder";
import { WhyForYou } from "@/components/WhyForYou";
import { SpecRow, SpecTable } from "@/components/SpecTable";
import { getBike, getBikeDetail, getCatalog } from "@/lib/catalog/load";
import { CATEGORY_LABEL, DISCIPLINE_LABEL, eur } from "@/lib/format";

// Todas las fichas se generan en el build: son las páginas que posiciona Google
export async function generateStaticParams() {
  return (await getCatalog()).map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/bici/[slug]">): Promise<Metadata> {
  const bike = await getBike((await params).slug);
  if (!bike) return {};
  const title = `${bike.brand} ${bike.name}`;
  return {
    title,
    description: `${title}: ${eur(bike.priceCents)}, ${DISCIPLINE_LABEL[bike.specs.discipline].toLowerCase()}${bike.specs.groupset ? `, ${bike.specs.groupset}` : ""}. Talla según tu altura, geometría y especificaciones comparadas.`,
    alternates: { canonical: `/bici/${bike.slug}` },
    openGraph: { images: [bike.imageUrl] },
  };
}

export default async function BikePage({ params, searchParams }: PageProps<"/bici/[slug]">) {
  const bike = await getBike((await params).slug);
  if (!bike) notFound();
  const detail = await getBikeDetail(bike.id);
  // Mismo orden de tallas que el catálogo (por altura), no el sort_order de la base
  const order = new Map(bike.sizes.map((s, i) => [s.label, i]));
  const geometry = [...detail.geometry].sort((a, b) => (order.get(a.label) ?? 99) - (order.get(b.label) ?? 99));
  const photos = detail.photos.length ? detail.photos : [{ url: bike.imageUrl, alt: null }];
  const name = `${bike.brand} ${bike.name}`;
  const kind = bike.specs.discipline === "infantil" ? CATEGORY_LABEL[bike.category] : DISCIPLINE_LABEL[bike.specs.discipline];

  return (
    <div className="wrap pt-2 pb-4 grid gap-4">
      <nav aria-label="Estás en" className="eyebrow">
        <ol className="flex flex-wrap gap-1 list-none m-0 p-0">
          <li><Link href="/comparador" className="link">Comparador</Link> /</li>
          <li><Link href={`/comparador?categoria=${bike.category}`} className="link">{CATEGORY_LABEL[bike.category]}</Link> /</li>
          <li aria-current="page">{bike.brand}</li>
        </ol>
      </nav>

      {/* Desde los resultados de la guía: la explicación larga. La ficha sigue siendo estática; esto se rellena aparte */}
      <Suspense fallback={null}>
        <WhyForYou bike={bike} searchParams={searchParams} />
      </Suspense>

      {/* Ficha: marco con cabecera, producto y filas de dato, como una etiqueta de producto */}
      <article className="border border-border bg-white" aria-labelledby="nombre">
        <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-2 py-2 border-b border-border">
          <p className="font-display text-h2 uppercase leading-none">{bike.brand}</p>
          <p className="eyebrow">
            {[kind, bike.electric ? "Eléctrica" : null, bike.modelYear].filter(Boolean).join(" · ")}
          </p>
        </header>

        <div className="lg:grid lg:grid-cols-12">
          <div className="lg:col-span-7 lg:border-r border-border">
            <Gallery photos={photos} name={name} />
          </div>

          <dl className="lg:col-span-5 m-0 border-t border-border lg:border-t-0 [&>div:first-child]:border-t-0">
            <SpecRow label="Modelo">
              <h1 id="nombre" className="font-display text-h3 leading-tight">{bike.name}</h1>
            </SpecRow>
            <SpecRow label="Precio">
              <span className="font-display text-h3 num">{eur(detail.offer?.priceCents ?? bike.priceCents)}</span>
              <span className="block text-small">
                {bike.inStock ? "En stock" : "Sin stock"} en {detail.offer?.store ?? "la web oficial"}
              </span>
            </SpecRow>
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
              <a href={`/ir/${bike.slug}`} rel="nofollow noopener" target="_blank" className="btn btn-solid btn-lg w-full">
                Comprar en la web oficial
                <span aria-hidden="true">↗</span>
                <span className="sr-only">(se abre en otra pestaña)</span>
              </a>
              <p className="text-small">Te llevamos a la ficha de la bici en la web de {bike.brand}: precio y stock son los suyos.</p>
            </div>
          </dl>
        </div>
      </article>

      <section aria-labelledby="specs" className="border border-border">
        <h2 id="specs" className="font-display text-h3 uppercase px-2 py-2">Especificaciones</h2>
        <SpecTable bike={bike} />
      </section>

      <section aria-labelledby="geo" className="border border-border">
        <h2 id="geo" className="font-display text-h3 uppercase px-2 py-2">Geometría</h2>
        <GeometryTable geometry={geometry} />
      </section>

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
