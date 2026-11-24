import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/JsonLd";
import { getCatalog } from "@/lib/catalog/load";
import { eur, int } from "@/lib/format";
import { aLaVenta, MIN_BICIS } from "@/lib/landings";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Marcas de bicis: todos los modelos y precios",
  description: "Todas las marcas de bicis del catálogo con cuántas bicis tienen a la venta, sus precios y las mejores por calidad-precio.",
  alternates: { canonical: "/marcas" },
};

/** Índice de marcas, por número de bicis a la venta */
export default async function MarcasIndex() {
  const sale = aLaVenta(await getCatalog({ sizes: false }));
  const by = new Map<string, { nombre: string; n: number; min: number }>();
  for (const b of sale) {
    const cur = by.get(b.brandSlug) ?? { nombre: b.brand, n: 0, min: Infinity };
    cur.n++;
    cur.min = Math.min(cur.min, b.priceCents);
    by.set(b.brandSlug, cur);
  }
  const marcas = [...by.entries()].filter(([, v]) => v.n >= MIN_BICIS).sort((a, b) => a[1].nombre.localeCompare(b[1].nombre, "es"));

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Marcas", path: "/marcas" }])} />
      <header className="wrap grid-swiss gap-y-2 pt-4 pb-3 items-end">
        <h1 className="col-span-4 md:col-span-5 lg:col-span-8 text-display uppercase">Marcas</h1>
        <p className="col-span-4 md:col-span-3 lg:col-span-4">
          {int(marcas.length)} marcas con sus bicis a la venta, por orden alfabético. Precios de la web de cada marca o de la
          tienda que la vende.
        </p>
      </header>
      <ul className="wrap grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-2 list-none pb-4">
        {marcas.map(([slug, v]) => (
          <li key={slug}>
            <Link href={`/marcas/${slug}`} className="grid gap-0.5 bg-white border border-border p-2 h-full no-underline hover:underline focus-inset">
              <span className="font-display text-h4 uppercase">{v.nombre}</span>
              <span className="eyebrow num">{int(v.n)} bicis · desde {eur(v.min)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
