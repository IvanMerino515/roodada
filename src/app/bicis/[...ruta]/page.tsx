import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LandingView } from "@/components/LandingView";
import { getCatalog } from "@/lib/catalog/load";
import { filtersToSearch } from "@/lib/catalogFilters";
import { aLaVenta, allLandings, findLanding, introLanding, preguntasLanding, preguntasPrecio, resumen } from "@/lib/landings";

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
  const actual = landing.ruta.join("/");
  const hijos = all.filter((l) => (l.clase === "subtipo" || l.clase === "electricas-tipo") && l.ruta[0] === base && l.ruta.join("/") !== actual);
  // Topes de precio de esta página (o de su página madre, si ya es una de precio)
  const madre = landing.clase === "precio" ? landing.ruta.slice(0, -1).join("/") : actual;
  const precios = all.filter((l) => l.clase === "precio" && l.ruta.slice(0, -1).join("/") === madre && l.ruta.join("/") !== actual);
  const marcas = r.marcas.slice(0, 16).map(([slug, nombre, n]) => ({ href: `/marcas/${slug}`, texto: nombre, n }));

  return (
    <>
      <LandingView
        eyebrow={landing.clase === "tipo" || landing.clase === "electricas" ? "Tipo de bici" : landing.padres.at(-1)!.name}
        titulo={landing.titulo}
        intro={introLanding(landing.nombre, r)}
        mejores={r.mejores}
        relacionados={[
          {
            titulo: landing.clase === "precio" ? "Otros precios" : "Por precio",
            enlaces: precios.map((l) => ({ href: `/bicis/${l.ruta.join("/")}`, texto: `Menos de ${(l.precio ?? 0).toLocaleString("es-ES", { useGrouping: "always" })} €`, n: count(l.filtro) })),
          },
          {
            titulo: landing.ruta.length === 1 ? "Por subtipo" : "Otros subtipos",
            enlaces: landing.clase === "precio" ? [] : hijos.map((l) => ({ href: `/bicis/${l.ruta.join("/")}`, texto: l.titulo, n: count(l.filtro) })),
          },
          { titulo: "Por marca", enlaces: marcas },
        ]}
        preguntas={landing.clase === "precio" ? preguntasPrecio(landing, r, bikes.filter(landing.filtro)) : preguntasLanding(landing.nombre, r)}
        migas={[...landing.padres, { name: landing.titulo, path }]}
        verTodas={{ href: `/comparador${filtersToSearch({ ...landing.comparador })}`, texto: `Ver las ${r.total.toLocaleString("es-ES", { useGrouping: "always" })}` }}
        path={path}
      />
    </>
  );
}
