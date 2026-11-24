import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LandingView } from "@/components/LandingView";
import { getCatalog } from "@/lib/catalog/load";
import type { Category } from "@/lib/catalog/types";
import { filtersToSearch } from "@/lib/catalogFilters";
import { CATEGORY_LABEL } from "@/lib/format";
import { aLaVenta, CATEGORY_SLUG, introMarca, marcaTipoLandings, MIN_BICIS, preguntasMarca, resumen } from "@/lib/landings";

async function marcas() {
  const bikes = await getCatalog({ sizes: false });
  const sale = aLaVenta(bikes);
  const by = new Map<string, number>();
  for (const b of sale) by.set(b.brandSlug, (by.get(b.brandSlug) ?? 0) + 1);
  // Todas las marcas con bicis a la venta tienen página (la ficha enlaza a ella); las de menos de
  // MIN_BICIS no se indexan
  return { bikes, slugs: [...by.keys()] };
}

export async function generateStaticParams() {
  return (await marcas()).slugs.map((marca) => ({ marca }));
}

async function load(slug: string) {
  const { bikes, slugs } = await marcas();
  if (!slugs.includes(slug)) return null;
  const own = bikes.filter((b) => b.brandSlug === slug);
  const r = resumen(own);
  const porTipo = Object.entries(
    aLaVenta(own).reduce<Record<string, number>>((acc, b) => ((acc[b.category] = (acc[b.category] ?? 0) + 1), acc), {}),
  ).sort((a, b) => b[1] - a[1]) as [Category, number][];
  const conPagina = new Set(marcaTipoLandings(bikes).filter((l) => l.slug === slug).map((l) => l.categoria));
  return { marca: own[0].brand, r, porTipo, conPagina };
}

export async function generateMetadata({ params }: PageProps<"/marcas/[marca]">): Promise<Metadata> {
  const slug = (await params).marca;
  const data = await load(slug);
  if (!data) return {};
  return {
    title: `Bicis ${data.marca}: precios, modelos y las mejores por calidad-precio`,
    description: introMarca(data.marca, data.r, data.porTipo)[0],
    alternates: { canonical: `/marcas/${slug}` },
    ...(data.r.total < MIN_BICIS ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function MarcaPage({ params }: PageProps<"/marcas/[marca]">) {
  const slug = (await params).marca;
  const data = await load(slug);
  if (!data) notFound();
  const { marca, r, porTipo, conPagina } = data;
  const path = `/marcas/${slug}`;

  return (
    <>
      <LandingView
        eyebrow="Marca"
        titulo={`Bicis ${marca}`}
        intro={introMarca(marca, r, porTipo)}
        mejores={r.mejores}
        relacionados={[
          {
            titulo: `${marca} por tipo`,
            enlaces: porTipo.map(([c, n]) => ({
              href: conPagina.has(c) ? `/marcas/${slug}/${CATEGORY_SLUG[c]}` : `/comparador${filtersToSearch({ marca: slug, categoria: c })}`,
              texto: CATEGORY_LABEL[c],
              n,
            })),
          },
          {
            titulo: "Tipos de bici",
            enlaces: porTipo.map(([c]) => ({ href: `/bicis/${CATEGORY_SLUG[c]}`, texto: `Todas las de ${CATEGORY_LABEL[c].toLowerCase()}` })),
          },
        ]}
        preguntas={preguntasMarca(marca, r, porTipo)}
        migas={[{ name: "Marcas", path: "/marcas" }, { name: marca, path }]}
        verTodas={{ href: `/comparador${filtersToSearch({ marca: slug })}`, texto: `Ver las ${r.total.toLocaleString("es-ES", { useGrouping: "always" })}` }}
        path={path}
      />
    </>
  );
}
