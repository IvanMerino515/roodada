import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Badge, Button, Container, Heading, Section, Split, Stack, Text } from "../../../../design-system/react";
import { GeometryTable } from "@/components/GeometryTable";
import { QualityBadge } from "@/components/QualityBadge";
import { SizeFinder } from "@/components/SizeFinder";
import { SpecTable } from "@/components/SpecTable";
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

export default async function BikePage({ params }: PageProps<"/bici/[slug]">) {
  const bike = await getBike((await params).slug);
  if (!bike) notFound();
  const detail = await getBikeDetail(bike.id);
  const photos = detail.photos.length ? detail.photos : [{ url: bike.imageUrl, alt: null }];

  return (
    <>
      <Section size="sm">
        <Container>
          <Text size="small" as="p">
            <Link href="/comparador" className="ds-link">Comparador</Link> / {CATEGORY_LABEL[bike.category]} / {bike.brand}
          </Text>
          <Split className="mt-3">
            <Stack>
              <div className="bg-white">
                <Image
                  src={photos[0].url}
                  alt={photos[0].alt ?? `${bike.brand} ${bike.name}`}
                  width={1200}
                  height={800}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="w-full h-auto aspect-[3/2] object-contain"
                  preload
                />
              </div>
              {photos.length > 1 && (
                <ul className="grid grid-cols-4 gap-1" aria-label="Más fotos">
                  {photos.slice(1, 9).map((p, i) => (
                    <li key={p.url} className="bg-white">
                      <a href={p.url} target="_blank" rel="noopener noreferrer" aria-label={`Ver foto ${i + 2} en grande`}>
                        <Image src={p.url} alt={p.alt ?? ""} width={300} height={200} sizes="12vw" className="w-full h-auto aspect-[3/2] object-contain" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Stack>
            <Stack>
              <div className="flex flex-wrap gap-1">
                <Badge>{DISCIPLINE_LABEL[bike.specs.discipline]}</Badge>
                {bike.electric && <Badge tone="accent">Eléctrica</Badge>}
                {!bike.inStock && <Badge tone="warning">Sin stock</Badge>}
              </div>
              <div>
                <Text size="label" as="p">{bike.brand}</Text>
                <Heading level={1} size="h2">{bike.name}</Heading>
              </div>
              <div className="flex flex-wrap items-baseline gap-2">
                <Text as="p" className="text-h3 font-display">{eur(detail.offer?.priceCents ?? bike.priceCents)}</Text>
                <QualityBadge bike={bike} />
              </div>
              <Button href={`/ir/${bike.slug}`} rel="nofollow noopener" target="_blank">
                Ver en {detail.offer?.store ?? "la web oficial"}
              </Button>
              <Text size="small">Precio y stock de la web oficial de la marca. Te llevamos a su ficha.</Text>
              <Stack className="mt-2">
                <Heading level={2} size="h4">¿Es para ti?</Heading>
                <Suspense fallback={null}>
                  <SizeFinder sizes={bike.sizes} />
                </Suspense>
              </Stack>
            </Stack>
          </Split>
        </Container>
      </Section>

      <Section size="sm">
        <Container>
          <Split>
            <Stack>
              <Heading level={2} size="h3">Especificaciones</Heading>
              <SpecTable bike={bike} />
            </Stack>
            <Stack>
              <Heading level={2} size="h3">Geometría</Heading>
              <GeometryTable geometry={detail.geometry} />
              {detail.components.length > 0 && (
                <details>
                  <summary className="text-label cursor-pointer py-1">Montaje completo ({detail.components.length} piezas)</summary>
                  <dl className="text-small grid grid-cols-[auto_1fr] gap-x-2">
                    {detail.components.map((c, i) => (
                      <div key={`${c.role}-${i}`} className="contents">
                        <dt className="py-1 border-t border-border">{COMPONENT_LABEL[c.role] ?? c.role}</dt>
                        <dd className="py-1 border-t border-border">{c.description}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              )}
            </Stack>
          </Split>
        </Container>
      </Section>
    </>
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
