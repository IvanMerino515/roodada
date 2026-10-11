import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Button, Cards, Cluster, Container, Field, Heading, Input, Section, Select, Stack, Text } from "../../../design-system/react";
import { BikeCard } from "@/components/BikeCard";
import { CompareProvider, CompareToggle } from "@/components/Compare";
import { getCatalog } from "@/lib/catalog/load";
import {
  applyFilters, facetOptions, filtersToSearch, PAGE_SIZE, parseFilters, SORTS, type CatalogFilters,
} from "@/lib/catalogFilters";
import { CATEGORY_LABEL, label } from "@/lib/format";
import type { Category } from "@/lib/catalog/types";

export const metadata: Metadata = {
  title: "Comparador de bicicletas",
  description: "Filtra más de 1.600 bicis por tipo, precio, marca y material, y compara hasta cuatro lado a lado.",
};

export default function ComparatorPage({ searchParams }: PageProps<"/comparador">) {
  return (
    <Section size="sm">
      <Container size="wide">
        <Stack>
          <Heading level={1} size="h2">Comparador</Heading>
          <Text>Filtra, marca hasta cuatro bicis y compáralas lado a lado.</Text>
          <Suspense fallback={<Text>Cargando bicis…</Text>}>
            {searchParams.then((sp) => (
              <Catalog filters={parseFilters(sp)} />
            ))}
          </Suspense>
        </Stack>
      </Container>
    </Section>
  );
}

async function Catalog({ filters: f }: { filters: CatalogFilters }) {
  const bikes = (await getCatalog()).filter((b) => b.inStock);
  const facets = facetOptions(bikes);
  const list = applyFilters(bikes, f);
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const page = Math.min(f.pagina, pages);
  const shown = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Stack>
      <form method="get" action="/comparador" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 items-end">
        <Field label="Buscar" htmlFor="q">
          <Input id="q" name="q" type="search" defaultValue={f.q} placeholder="Marca, modelo o grupo" />
        </Field>
        <Field label="Tipo" htmlFor="categoria">
          <Select id="categoria" name="categoria" defaultValue={f.categoria ?? ""}>
            <option value="">Todos</option>
            {facets.categoria.map(([k, n]) => (
              <option key={k} value={k}>{CATEGORY_LABEL[k as Category]} ({n})</option>
            ))}
          </Select>
        </Field>
        <Field label="Eléctrica" htmlFor="electrica">
          <Select id="electrica" name="electrica" defaultValue={f.electrica ?? ""}>
            <option value="">Indiferente</option>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </Select>
        </Field>
        <Field label="Precio máximo (€)" htmlFor="precioMax">
          <Input id="precioMax" name="precioMax" type="number" inputMode="numeric" min={0} step={100} defaultValue={f.precioMax} />
        </Field>
        <Field label="Marca" htmlFor="marca">
          <Select id="marca" name="marca" defaultValue={f.marca ?? ""}>
            <option value="">Todas</option>
            {facets.marca.map(([k, n]) => (
              <option key={k} value={k}>{facets.marcaNombre[k]} ({n})</option>
            ))}
          </Select>
        </Field>
        <Field label="Cuadro" htmlFor="material">
          <Select id="material" name="material" defaultValue={f.material ?? ""}>
            <option value="">Todos</option>
            {facets.material.map(([k, n]) => (
              <option key={k} value={k}>{label(k)} ({n})</option>
            ))}
          </Select>
        </Field>
        <Field label="Suspensión" htmlFor="suspension">
          <Select id="suspension" name="suspension" defaultValue={f.suspension ?? ""}>
            <option value="">Todas</option>
            {facets.suspension.map(([k, n]) => (
              <option key={k} value={k}>{label(k)} ({n})</option>
            ))}
          </Select>
        </Field>
        <Field label="Ordenar" htmlFor="orden">
          <Select id="orden" name="orden" defaultValue={f.orden}>
            {Object.entries(SORTS).map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
          </Select>
        </Field>
        <Cluster className="sm:col-span-2 lg:col-span-4">
          <Button type="submit">Filtrar</Button>
          <Button variant="ghost" href="/comparador">Quitar filtros</Button>
        </Cluster>
      </form>

      <Text size="small" aria-live="polite">
        {list.length.toLocaleString("es-ES")} {list.length === 1 ? "bici" : "bicis"}
        {pages > 1 ? ` · página ${page} de ${pages}` : ""}
      </Text>

      <CompareProvider>
        <Cards>
          {shown.map((b, i) => (
            <BikeCard key={b.id} bike={b} preload={i < 4}>
              <div className="mt-auto">
                <CompareToggle slug={b.slug} />
              </div>
            </BikeCard>
          ))}
        </Cards>
      </CompareProvider>

      {pages > 1 && (
        <nav aria-label="Páginas" className="flex justify-between gap-2">
          {page > 1 ? (
            <Link className="ds-link" href={`/comparador${filtersToSearch({ ...f, pagina: page - 1 })}`}>← Anteriores</Link>
          ) : <span />}
          {page < pages && (
            <Link className="ds-link" href={`/comparador${filtersToSearch({ ...f, pagina: page + 1 })}`}>Siguientes →</Link>
          )}
        </nav>
      )}
    </Stack>
  );
}
