import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LandingView } from "@/components/LandingView";
import { getCatalog } from "@/lib/catalog/load";
import { filtersToSearch } from "@/lib/catalogFilters";
import { introMarcaTipo, marcaTipoLandings, preguntasMarcaTipo, resumen } from "@/lib/landings";

export async function generateStaticParams() {
  return marcaTipoLandings(await getCatalog({ sizes: false })).map((l) => ({ marca: l.slug, tipo: l.tipo }));
}

async function load(marca: string, tipo: string) {
  const bikes = await getCatalog({ sizes: false });
  const todas = marcaTipoLandings(bikes);
  const l = todas.find((x) => x.slug === marca && x.tipo === tipo);
  if (!l) return null;
  const own = bikes.filter((b) => b.brandSlug === marca && b.category === l.categoria);
  return { l, own, r: resumen(own), otras: todas.filter((x) => x.slug === marca && x.tipo !== tipo) };
}

const nombreDe = (titulo: string) => titulo.charAt(0).toLowerCase() + titulo.slice(1);
/** «Bicis de montaña Orbea» → «bicis de montaña» */
const tipoNombre = (titulo: string, marca: string) => nombreDe(titulo.replace(` ${marca}`, ""));

export async function generateMetadata({ params }: PageProps<"/marcas/[marca]/[tipo]">): Promise<Metadata> {
  const { marca, tipo } = await params;
  const data = await load(marca, tipo);
  if (!data) return {};
  return {
    title: `${data.l.titulo}: precios, modelos y las mejores por calidad-precio`,
    description: introMarcaTipo(data.l.marca, tipoNombre(data.l.titulo, data.l.marca), data.r, data.own)[0],
    alternates: { canonical: `/marcas/${marca}/${tipo}` },
  };
}

export default async function MarcaTipoPage({ params }: PageProps<"/marcas/[marca]/[tipo]">) {
  const { marca, tipo } = await params;
  const data = await load(marca, tipo);
  if (!data) notFound();
  const { l, own, r, otras } = data;
  const nombre = nombreDe(l.titulo);
  const path = `/marcas/${marca}/${tipo}`;

  return (
    <LandingView
      eyebrow={l.marca}
      titulo={l.titulo}
      intro={introMarcaTipo(l.marca, tipoNombre(l.titulo, l.marca), r, own)}
      mejores={r.mejores}
      relacionados={[
        { titulo: `Más de ${l.marca}`, enlaces: otras.map((o) => ({ href: `/marcas/${marca}/${o.tipo}`, texto: o.titulo, n: o.n })) },
        { titulo: "De todas las marcas", enlaces: [{ href: `/bicis/${tipo}`, texto: l.titulo.replace(` ${l.marca}`, "") }] },
      ]}
      preguntas={preguntasMarcaTipo(l.marca, nombre, r, own)}
      migas={[{ name: "Marcas", path: "/marcas" }, { name: l.marca, path: `/marcas/${marca}` }, { name: l.titulo, path }]}
      verTodas={{ href: `/comparador${filtersToSearch({ marca, categoria: l.categoria })}`, texto: `Ver las ${r.total.toLocaleString("es-ES", { useGrouping: "always" })}` }}
      path={path}
    />
  );
}
