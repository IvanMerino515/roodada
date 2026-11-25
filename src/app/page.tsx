import type { Metadata } from "next";
import Link from "next/link";

import { BikeCard } from "@/components/BikeCard";
import { Intro } from "@/components/Intro";
import { JsonLd } from "@/components/JsonLd";
import { getCatalog, getPreviousPrices } from "@/lib/catalog/load";
import type { Bike, Category } from "@/lib/catalog/types";
import { CATEGORY_LABEL } from "@/lib/format";
import { siteJsonLd } from "@/lib/seo";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const n = (v: number) => v.toLocaleString("es-ES", { useGrouping: "always" });

export default async function HomePage() {
  const bikes = await getCatalog();
  // Mismo número en toda la web (intro, comparador y guía): bicis a la venta (en stock y con precio)
  const forSale = bikes.filter((b) => b.inStock);
  const brands = new Set(forSale.map((b) => b.brand)).size;
  const sizes = forSale.reduce((sum, b) => sum + b.sizes.length, 0);
  const picks = bestPerCategory(bikes);
  const deals = bestDeals(bikes, await getPreviousPrices());

  return (
    <>
      <JsonLd data={siteJsonLd()} />
      {/* Mismo número que el comparador y la guía: bicis a la venta (en stock y con precio) */}
      <Intro bikes={n(forSale.length)} />

      {/* Justo después de la intro, los dos caminos, uno al lado del otro */}
      <section id="descubre" className="grid md:grid-cols-2 border-b border-border" aria-label="Por dónde empezar">
        <Link href="/guia" className="group bg-surface text-text p-2 md:p-4 grid gap-3 content-between min-h-50 no-underline">
          <span className="font-display text-display num leading-none" aria-hidden="true">01</span>
          <span className="grid gap-1">
            <span className="font-display text-h2 uppercase">Guía</span>
            <span className="max-w-60">Unas pocas preguntas, más o menos según lo que sepas de bicis, y te decimos qué bicis te encajan, en qué talla y por qué.</span>
          </span>
          <span className="eyebrow flex items-center justify-between border-t border-current pt-1">
            Empezar la guía <span aria-hidden="true" className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none">→</span>
          </span>
        </Link>
        <Link href="/comparador" className="group p-2 md:p-4 grid gap-3 content-between min-h-50 no-underline md:border-l border-t md:border-t-0 border-border hover:bg-white">
          <span className="font-display text-display num leading-none" aria-hidden="true">02</span>
          <span className="grid gap-1">
            <span className="font-display text-h2 uppercase">Comparador</span>
            <span className="max-w-60">Filtra el catálogo completo y compara hasta cuatro bicis lado a lado.</span>
          </span>
          <span className="eyebrow flex items-center justify-between border-t border-current pt-1">
            Ver el catálogo <span aria-hidden="true" className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none">→</span>
          </span>
        </Link>
      </section>

      {/* Método: etiqueta en la columna izquierda, tres pasos y las cifras en la derecha */}
      <section className="wrap grid-swiss gap-y-6 py-6 border-b border-border" aria-labelledby="metodo">
        <h2 id="metodo" className="col-span-4 md:col-span-2 lg:col-span-3 text-h2 uppercase">¿Cómo elegimos?</h2>
        <ol className="col-span-4 md:col-span-6 lg:col-span-9 grid md:grid-cols-3 gap-3 list-none m-0 p-0">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="grid gap-1 content-start border-t border-border pt-1">
              <span className="eyebrow num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="text-h4 uppercase">{title}</h3>
              <p className="text-small">{text}</p>
            </li>
          ))}
        </ol>
        <dl aria-label="El catálogo en cifras" className="col-span-4 md:col-span-6 md:col-start-3 lg:col-span-9 lg:col-start-4 grid grid-cols-3 gap-3 m-0">
          {[
            [n(forSale.length), "bicis a la venta"],
            [n(brands), "marcas"],
            [n(sizes), "tallas con medidas"],
          ].map(([value, text]) => (
            <div key={text} className="flex flex-col-reverse gap-1 border-t border-border pt-1">
              <dt className="eyebrow">{text}</dt>
              <dd className="m-0 font-display text-h1 num leading-none">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Muestra del catálogo */}
      {picks.length > 0 && (
        <section className="wrap py-6 grid gap-2" aria-labelledby="destacadas">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="destacadas" className="text-h2 uppercase">Mejor calidad-precio</h2>
            <Link href="/comparador" className="eyebrow link inline-flex items-center min-h-3">Ver todas <span aria-hidden="true">→</span></Link>
          </div>
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-1 md:gap-2 list-none m-0 p-0">
            {picks.map((b) => (
              <li key={b.id}>
                <BikeCard bike={b}>
                  <p className="eyebrow border-t border-border pt-1">{CATEGORY_LABEL[b.category]}</p>
                </BikeCard>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Las 4 bicis con más descuento sobre el precio anterior que tacha la propia web oficial */}
      {deals.length > 0 && (
        <section className="wrap pb-6 grid gap-2" aria-labelledby="rebajadas">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="rebajadas" className="text-h2 uppercase">Mejores rebajadas</h2>
          </div>
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-1 md:gap-2 list-none m-0 p-0">
            {deals.map(({ bike: b, previousCents }) => (
              <li key={b.id}>
                <BikeCard bike={b} previousCents={previousCents}>
                  <p className="eyebrow border-t border-border pt-1">{CATEGORY_LABEL[b.category]}</p>
                </BikeCard>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

const STEPS: [string, string][] = [
  ["Tu talla primero", "Te decimos si la talla sale de la tabla oficial de la marca, si es una estimación o si estás entre dos."],
  ["Lo que te importa", "Ordenamos según el tipo de ciclista que eres y, si lo eliges, lo que más te importa: comodidad, ligereza, componentes y prestaciones."],
  ["Toda la información", "Para que decidas con el máximo de información, te explicamos de dónde sale cada dato. Si un dato es confuso o no estás familiarizado, te lo aclararemos."],
];

/** La de mejor nota calidad-precio de cada tipo de adulto, en stock. */
function bestPerCategory(bikes: Bike[]): Bike[] {
  const cats: Category[] = ["bici-carretera", "bici-gravel", "bici-mtb", "bici-urbana"];
  return cats
    .map((c) =>
      bikes
        .filter((b) => b.category === c && b.inStock && b.quality.coverage >= 0.8)
        .sort((a, b) => b.quality.total - a.quality.total)[0],
    )
    .filter((b): b is Bike => !!b);
}

/**
 * Las 4 con más descuento (en %) sobre el precio anterior de la web oficial: bicis de adulto e infantiles, en stock,
 * con precio en €, una por marca (si no, salen cuatro montajes del mismo modelo, p. ej. cuatro YT Decoy).
 * A igualdad de %, la que más euros ahorra.
 */
function bestDeals(bikes: Bike[], previous: Record<number, [number, number]>) {
  const seen = new Set<string>();
  return bikes
    .flatMap((bike) => {
      const p = previous[bike.id];
      if (!bike.inStock || bike.priceState !== "ok" || !bike.category.startsWith("bici-") || !p || p[0] !== bike.priceCents) return [];
      return [{ bike, previousCents: p[1], pct: Math.round((1 - p[0] / p[1]) * 100) }];
    })
    .sort((a, b) => b.pct - a.pct || b.previousCents - b.bike.priceCents - (a.previousCents - a.bike.priceCents))
    .filter((d) => (seen.has(d.bike.brandSlug) ? false : (seen.add(d.bike.brandSlug), true)))
    .slice(0, 4);
}
