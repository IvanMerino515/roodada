import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/JsonLd";
import { getCatalog } from "@/lib/catalog/load";
import { int } from "@/lib/format";
import { aLaVenta, allLandings } from "@/lib/landings";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Tipos de bici: carretera, gravel, montaña, urbanas y eléctricas",
  description: "Todos los tipos de bici con sus precios, marcas y las mejores por calidad-precio, con datos de las webs oficiales.",
  alternates: { canonical: "/bicis" },
};

/** Índice de los tipos de bici: cada tipo con sus subtipos y cuántas bicis hay a la venta */
export default async function BicisIndex() {
  const bikes = await getCatalog({ sizes: false });
  const sale = aLaVenta(bikes);
  const landings = allLandings(bikes);
  const tipos = landings.filter((l) => l.ruta.length === 1 && l.ruta[0] !== "electricas");
  const grupos = [...tipos, ...landings.filter((l) => l.ruta[0] === "electricas" && l.ruta.length === 1)];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Bicis", path: "/bicis" }])} />
      <header className="wrap grid-swiss gap-y-2 pt-4 pb-3 items-end">
        <h1 className="col-span-4 md:col-span-5 lg:col-span-8 text-display uppercase">Tipos de bici</h1>
        <p className="col-span-4 md:col-span-3 lg:col-span-4">
          {int(sale.length)} bicis a la venta de {int(new Set(sale.map((b) => b.brandSlug)).size)} marcas, ordenadas por tipo. En cada
          uno, los precios, las marcas y las mejores por calidad-precio.
        </p>
      </header>
      <div className="wrap grid gap-3 pb-4">
        {grupos.map((t) => {
          const subs = landings.filter((l) => l.ruta.length === 2 && l.ruta[0] === t.ruta[0]);
          return (
            <section key={t.ruta[0]} className="grid gap-1 border-t border-border pt-2">
              <h2 className="font-display text-h3 uppercase">
                <Link href={`/bicis/${t.ruta[0]}`} className="link">{t.titulo}</Link>{" "}
                <span className="eyebrow num">{int(sale.filter(t.filtro).length)}</span>
              </h2>
              {subs.length > 0 && (
                <ul className="flex flex-wrap gap-1 list-none m-0 p-0">
                  {subs.map((s) => (
                    <li key={s.ruta.join("/")}>
                      <Link href={`/bicis/${s.ruta.join("/")}`} className="btn">
                        {s.titulo} <span className="num opacity-70">{int(sale.filter(s.filtro).length)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
