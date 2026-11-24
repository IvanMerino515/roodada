import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LandingView } from "@/components/LandingView";
import { getCatalog } from "@/lib/catalog/load";
import { filtersToSearch } from "@/lib/catalogFilters";
import { aLaVenta, allLandings, findLanding, introLanding, preguntasLanding, resumen } from "@/lib/landings";

// Todas las páginas de tipo se generan al compilar (son unas 25)
export async function generateStaticParams() {
  return allLandings(await getCatalog({ sizes: false })).map((l) => ({ ruta: l.ruta }));
}

async function load(ruta: string[]) {
  const bikes = await getCatalog({ sizes: false });
  const landing = findLanding(bikes, ruta);
  if (!landing) return null;
  return { bikes, landing, r: resumen(bikes.filter(landing.filtro)) };
}

export async function generateMetadata({ params }: PageProps<"/bicis/[...ruta]">): Promise<Metadata> {
  const data = await load((await params).ruta);
  if (!data) return {};
  const { landing, r } = data;
  return {
    title: `${landing.titulo}: precios, marcas y las mejores por calidad-precio`,
    description: introLanding(landing.nombre, r)[0],
    alternates: { canonical: `/bicis/${landing.ruta.join("/")}` },
  };
}

export default async function LandingPage({ params }: PageProps<"/bicis/[...ruta]">) {
  const data = await load((await params).ruta);
  if (!data) notFound();
  const { bikes, landing, r } = data;
  const path = `/bicis/${landing.ruta.join("/")}`;
  const all = allLandings(bikes);
  const sale = aLaVenta(bikes);
  const count = (f: (b: (typeof bikes)[number]) => boolean) => sale.filter(f).length;

  // Subtipos de este tipo; si es un subtipo, sus hermanos
  const base = landing.ruta[0];
  const hijos = all.filter((l) => l.ruta.length === 2 && l.ruta[0] === base && l.ruta.join("/") !== landing.ruta.join("/"));
  const marcas = r.marcas.slice(0, 16).map(([slug, nombre, n]) => ({ href: `/marcas/${slug}`, texto: nombre, n }));

  return (
    <>
      <LandingView
        eyebrow={landing.ruta.length === 1 ? "Tipo de bici" : landing.padres.at(-1)!.name}
        titulo={landing.titulo}
        intro={introLanding(landing.nombre, r)}
        mejores={r.mejores}
        relacionados={[
          {
            titulo: landing.ruta.length === 1 ? "Por subtipo" : "Otros subtipos",
            enlaces: hijos.map((l) => ({ href: `/bicis/${l.ruta.join("/")}`, texto: l.titulo, n: count(l.filtro) })),
          },
          { titulo: "Por marca", enlaces: marcas },
        ]}
        preguntas={preguntasLanding(landing.nombre, r)}
        migas={[...landing.padres, { name: landing.titulo, path }]}
        verTodas={{ href: `/comparador${filtersToSearch({ ...landing.comparador })}`, texto: `Ver las ${r.total.toLocaleString("es-ES", { useGrouping: "always" })}` }}
        path={path}
      />
    </>
  );
}
