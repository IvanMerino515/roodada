import Link from "next/link";

import { BikeCard } from "@/components/BikeCard";
import { Intro } from "@/components/Intro";
import { getCatalog } from "@/lib/catalog/load";
import type { Bike, Category } from "@/lib/catalog/types";
import { CATEGORY_LABEL } from "@/lib/format";

const n = (v: number) => v.toLocaleString("es-ES");

export default async function HomePage() {
  const bikes = await getCatalog();
  const brands = new Set(bikes.map((b) => b.brand)).size;
  const sizes = bikes.reduce((sum, b) => sum + b.sizes.length, 0);
  const picks = bestPerCategory(bikes);

  return (
    <>
      <Intro bikes={n(bikes.length)} />

      {/* Qué es Roodada: titular a toda la retícula y cifras en la columna derecha */}
      <section id="descubre" className="wrap grid-swiss gap-y-3 pt-6 pb-6 border-b border-border" aria-labelledby="titular">
        <p className="col-span-4 md:col-span-4 lg:col-span-6 eyebrow">Guía de compra de bicicletas</p>
        <p className="hidden md:block md:col-span-4 lg:col-span-6 eyebrow md:text-right num">
          {n(bikes.length)} bicis · {brands} marcas
        </p>
        <h2 id="titular" className="col-span-4 md:col-span-8 lg:col-span-10 text-display uppercase mt-4 md:mt-8">
          Encuentra la bici que te encaja
        </h2>
        <p className="col-span-4 md:col-span-5 lg:col-span-5 lg:col-start-1 mt-2">
          Seis preguntas y te enseñamos las bicis que encajan con tu uso, tu altura y tu presupuesto, y por qué. Solo con
          los datos que publica cada marca.
        </p>
      </section>

      {/* Los dos caminos, uno al lado del otro */}
      <section className="grid md:grid-cols-2 border-b border-border" aria-label="Por dónde empezar">
        <Link href="/guia" className="group bg-surface text-text p-2 md:p-4 grid gap-3 content-between min-h-50 no-underline">
          <span className="font-display text-display num leading-none" aria-hidden="true">01</span>
          <span className="grid gap-1">
            <span className="font-display text-h2 uppercase">Guía</span>
            <span className="max-w-60">Responde seis preguntas y te decimos qué bicis te encajan, en qué talla y por qué.</span>
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

      {/* Método: etiqueta en la columna izquierda, tres pasos en la derecha */}
      <section className="wrap grid-swiss gap-y-3 py-6 border-b border-border" aria-labelledby="metodo">
        <h2 id="metodo" className="col-span-4 md:col-span-2 lg:col-span-3 eyebrow">Cómo elegimos</h2>
        <ol className="col-span-4 md:col-span-6 lg:col-span-9 grid md:grid-cols-3 gap-3 list-none m-0 p-0">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="grid gap-1 content-start border-t border-border pt-1">
              <span className="eyebrow num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="text-h4 uppercase">{title}</h3>
              <p className="text-small">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Cifras */}
      <section className="wrap grid-swiss py-6 border-b border-border" aria-label="El catálogo en cifras">
        <dl className="col-span-4 md:col-span-8 lg:col-span-9 lg:col-start-4 grid grid-cols-3 gap-2 m-0">
          {[
            [n(bikes.length), "bicis analizadas"],
            [n(brands), "marcas"],
            [n(sizes), "tallas con medidas"],
          ].map(([value, text]) => (
            <div key={text} className="flex flex-col-reverse gap-1">
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
            <Link href="/comparador" className="eyebrow link">Ver todas <span aria-hidden="true">→</span></Link>
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
    </>
  );
}

const STEPS: [string, string][] = [
  ["Tu talla primero", "Te decimos si la talla sale de la tabla oficial de la marca, si es una estimación o si estás entre dos."],
  ["Lo que te importa", "Comodidad, ligereza, componentes, autonomía… Ordenamos según lo que tú eliges."],
  ["Sin inventar", "Si una marca no publica un dato, te lo decimos. Nunca lo rellenamos."],
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
