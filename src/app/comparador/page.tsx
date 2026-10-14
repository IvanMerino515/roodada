import type { Metadata } from "next";
import Link from "next/link";
import { Fragment, Suspense, type ReactNode } from "react";

import { BikeCard, FeatureTile } from "@/components/BikeCard";
import { CompareProvider, CompareToggle } from "@/components/Compare";
import { EXTRA, FilterRow, FilterSelect } from "@/components/FilterBar";
import { FilterForm, MoreFiltersToggle } from "@/components/FilterForm";
import { getCatalog } from "@/lib/catalog/load";
import {
  applyFilters, facetOptions, filtersToSearch, PAGE_SIZE, parseFilters, SORTS, type CatalogFilters,
} from "@/lib/catalogFilters";
import { CATEGORY_LABEL, decimal, eur, label } from "@/lib/format";
import type { Bike, Category } from "@/lib/catalog/types";

export const metadata: Metadata = {
  title: "Comparador de bicicletas",
  description: "Filtra más de 1.600 bicis por tipo, precio, marca y material, y compara hasta cuatro lado a lado.",
};

const PRICE_STEPS = [500, 1000, 1500, 2000, 3000, 5000, 8000];

export default function ComparatorPage({ searchParams }: PageProps<"/comparador">) {
  return (
    <Suspense fallback={<p className="wrap py-4 eyebrow">Cargando bicis…</p>}>
      {searchParams.then((sp) => (
        <Catalog filters={parseFilters(sp)} />
      ))}
    </Suspense>
  );
}

async function Catalog({ filters: f }: { filters: CatalogFilters }) {
  const bikes = (await getCatalog()).filter((b) => b.inStock);
  const facets = facetOptions(bikes);
  const list = applyFilters(bikes, f);
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const page = Math.min(f.pagina, pages);
  const shown = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const prices = f.precioMax && !PRICE_STEPS.includes(f.precioMax) ? [...PRICE_STEPS, f.precioMax].sort((a, b) => a - b) : PRICE_STEPS;
  const filtered = filtersToSearch({ ...f, orden: "calidad", pagina: 1 }) !== "";
  const tiles = featureTiles(shown, page);

  return (
    <>
      <div className="wrap grid-swiss gap-y-2 pt-4 pb-3 items-end">
        <h1 className="col-span-4 md:col-span-5 lg:col-span-8 text-display uppercase">Comparador</h1>
        <p className="col-span-4 md:col-span-3 lg:col-span-4 text-small">
          <span className="block font-display text-h3 num" aria-live="polite">
            {list.length.toLocaleString("es-ES")} {list.length === 1 ? "bici" : "bicis"}
          </span>
          Filtra, marca hasta cuatro y compáralas lado a lado.
        </p>
      </div>

      <FilterForm action="/comparador">
        <FilterRow label="Filtros principales">
          <FilterSelect id="categoria" name="categoria" label="Tipo" defaultValue={f.categoria ?? ""}>
            <option value="">Todos</option>
            {facets.categoria.map(([k, n]) => (
              <option key={k} value={k}>{CATEGORY_LABEL[k as Category]} ({n})</option>
            ))}
          </FilterSelect>
          <FilterSelect id="electrica" name="electrica" label="Eléctrica" defaultValue={f.electrica ?? ""} extra>
            <option value="">Igual</option>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </FilterSelect>
          <FilterSelect id="precioMax" name="precioMax" label="Hasta" defaultValue={f.precioMax ? String(f.precioMax) : ""}>
            <option value="">Cualquier precio</option>
            {prices.map((p) => (
              <option key={p} value={p}>{eur(p * 100)}</option>
            ))}
          </FilterSelect>
          <FilterSelect id="marca" name="marca" label="Marca" defaultValue={f.marca ?? ""} extra>
            <option value="">Todas</option>
            {facets.marca.map(([k, n]) => (
              <option key={k} value={k}>{facets.marcaNombre[k]} ({n})</option>
            ))}
          </FilterSelect>
          <FilterSelect id="orden" name="orden" label="Orden" defaultValue={f.orden}>
            {Object.entries(SORTS).map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
          </FilterSelect>
        </FilterRow>
        <FilterRow label="Más filtros">
          <MoreFiltersToggle active={[f.electrica, f.marca, f.q, f.material, f.suspension].filter(Boolean).length} />
          <div className={`${EXTRA} items-center border-b border-border md:border-r lg:border-b-0`}>
            <label htmlFor="q" className="eyebrow pl-2 whitespace-nowrap">Buscar:</label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={f.q}
              placeholder="Marca, modelo o grupo"
              className="select normal-case tracking-normal placeholder:text-text placeholder:opacity-60"
            />
          </div>
          <FilterSelect id="material" name="material" label="Cuadro" defaultValue={f.material ?? ""} className="lg:border-b-0" extra>
            <option value="">Todos</option>
            {facets.material.map(([k, n]) => (
              <option key={k} value={k}>{label(k)} ({n})</option>
            ))}
          </FilterSelect>
          <FilterSelect id="suspension" name="suspension" label="Suspensión" defaultValue={f.suspension ?? ""} className="lg:border-b-0" extra>
            <option value="">Todas</option>
            {facets.suspension.map(([k, n]) => (
              <option key={k} value={k}>{label(k)} ({n})</option>
            ))}
          </FilterSelect>
          <div className="grid grid-cols-2">
            {filtered ? (
              <Link href="/comparador" className="eyebrow flex items-center justify-center min-h-6 border-r border-border hover:underline">
                Quitar filtros
              </Link>
            ) : <span className="border-r border-border" />}
            <button type="submit" className="eyebrow min-h-6 bg-accent text-on-accent cursor-pointer hover:underline">
              Aplicar
            </button>
          </div>
        </FilterRow>
      </FilterForm>

      <CompareProvider>
        <div className="wrap py-2">
          <h2 className="sr-only">Bicis</h2>
          {shown.length === 0 ? (
            <div className="grid-swiss py-8">
              <p className="col-span-4 md:col-span-6 font-display text-h2">Ninguna bici cumple todos los filtros.</p>
              <p className="col-span-4 md:col-span-6 mt-2">
                <Link href="/comparador" className="link">Quitar filtros</Link> o prueba la <Link href="/guia" className="link">guía</Link>.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-2 list-none m-0 p-0">
              {shown.map((b, i) => (
                <Fragment key={b.id}>
                  {tiles.get(i) && (
                    // Dos filas de alto: rompe el ritmo de la rejilla sin dejar huecos en 2, 3 o 4 columnas
                    <li className="row-span-2">
                      {tiles.get(i)}
                    </li>
                  )}
                  <li>
                    <BikeCard bike={b} preload={i < 4} corner={<CompareToggle slug={b.slug} name={`${b.brand} ${b.name}`} />} />
                  </li>
                </Fragment>
              ))}
            </ul>
          )}
        </div>

        {pages > 1 && (
          <nav aria-label="Páginas" className="wrap">
            <div className="grid grid-cols-3 items-center border-y border-border eyebrow num">
              {page > 1 ? (
                <Link className="min-h-6 flex items-center hover:underline" href={`/comparador${filtersToSearch({ ...f, pagina: page - 1 })}`}>
                  <span aria-hidden="true">←&nbsp;</span>Anteriores
                </Link>
              ) : <span />}
              <p className="text-center">Página {page} de {pages}</p>
              {page < pages ? (
                <Link className="min-h-6 flex items-center justify-end hover:underline" href={`/comparador${filtersToSearch({ ...f, pagina: page + 1 })}`}>
                  Siguientes<span aria-hidden="true">&nbsp;→</span>
                </Link>
              ) : <span />}
            </div>
          </nav>
        )}
      </CompareProvider>
    </>
  );
}

/**
 * Casillas de color entre las bicis, cada una con un mensaje distinto: la guía, la mejor calidad-precio
 * de la página y la talla. La clave es la posición de la bici delante de la que va.
 */
function featureTiles(shown: Bike[], page: number) {
  const best = shown
    .filter((b) => b.category !== "bici-infantil" && b.quality.coverage >= 0.8)
    .sort((a, b) => b.quality.total - a.quality.total)[0];
  const guide = (
    <FeatureTile eyebrow="¿No sabes cuál?" title="Te decimos cuál te encaja" href="/guia" cta="Empezar la guía" className="h-full">
      Unas pocas preguntas sobre uso, presupuesto y altura, y te enseñamos tus bicis con lo bueno y lo malo de cada una.
    </FeatureTile>
  );
  const top = best && (
    <FeatureTile eyebrow="Mejor calidad-precio de esta página" title={`${best.brand} ${best.name}`} href={`/bici/${best.slug}`} cta="Ver la ficha" className="h-full">
      {decimal(best.quality.total)} sobre 10 por {eur(best.priceCents)}, frente a otras bicis de su tipo.
    </FeatureTile>
  );
  const size = (
    <FeatureTile eyebrow="¿Qué talla es la tuya?" title="Tu talla en cada bici" href="/guia" cta="Calcularla en la guía" className="h-full">
      Con tu altura, y la entrepierna si la sabes, elegimos la talla de cada bici con la tabla oficial de la marca.
    </FeatureTile>
  );
  const order = page === 1 ? [guide, top, size] : [top, guide];
  const slots = [1, 9, 18];
  const map = new Map<number, ReactNode>();
  order.filter(Boolean).forEach((tile, i) => {
    if (slots[i] < shown.length) map.set(slots[i], tile);
  });
  return map;
}
