import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { getCatalog } from "@/lib/catalog/load";
import type { Bike } from "@/lib/catalog/types";
import { MISSING } from "@/lib/format";
import { rowsFor, type SpecRow } from "@/lib/specRows";

export const metadata: Metadata = { title: "Comparativa", robots: { index: false } };

export default function ComparisonPage({ searchParams }: PageProps<"/comparativa">) {
  return (
    <Suspense fallback={<p className="wrap py-4 eyebrow">Preparando la comparativa…</p>}>
      {searchParams.then((sp) => (
        <Comparison slugs={String(sp.bicis ?? "").split(",").filter(Boolean).slice(0, 4)} />
      ))}
    </Suspense>
  );
}

async function Comparison({ slugs }: { slugs: string[] }) {
  const catalog = await getCatalog();
  const bikes = slugs.map((s) => catalog.find((b) => b.slug === s)).filter((b): b is Bike => !!b);
  if (bikes.length < 2) {
    return (
      <div className="wrap grid-swiss py-8">
        <h1 className="col-span-4 md:col-span-6 font-display text-h2">Elige al menos dos bicis</h1>
        <p className="col-span-4 md:col-span-6 mt-2">
          Márcalas en el <Link href="/comparador" className="link">comparador</Link> o en tus resultados de la guía.
        </p>
      </div>
    );
  }
  const rows = rowsFor(bikes);
  const groups = [...new Set(rows.map((r) => r.group))];

  return (
    <>
      <div className="wrap grid-swiss gap-y-2 pt-4 pb-3 items-end">
        <h1 className="col-span-4 md:col-span-5 lg:col-span-8 text-display uppercase">Comparativa</h1>
        <p className="col-span-4 md:col-span-3 lg:col-span-4 text-small">
          Marcada con ●, la mejor en cada dato que se puede medir. Las filas que cambian entre bicis, con fondo.
          «{MISSING}» significa que la marca no lo da.
        </p>
      </div>
      <div className="wrap pb-4">
        <div className="overflow-x-auto border border-border" tabIndex={0} role="region" aria-label="Comparativa (desliza para ver todas las bicis)">
          <table className="w-full min-w-100 border-collapse text-small table-fixed num">
            <caption className="sr-only">Comparativa de {bikes.length} bicis</caption>
            <thead>
              <tr>
                <td className="w-20 border-r border-border" />
                {bikes.map((b) => (
                  <th key={b.id} scope="col" className="align-top text-left font-normal border-r border-border last:border-r-0 p-0">
                    <Link href={`/bici/${b.slug}`} className="group grid gap-1 p-2 no-underline">
                      <span className="block bg-white">
                        <Image src={b.imageUrl} alt="" width={300} height={200} sizes="25vw" className="product w-full h-auto aspect-[3/2] object-contain" />
                      </span>
                      <span className="eyebrow">{b.brand}</span>
                      <span className="font-display text-body leading-tight group-hover:underline">{b.name}</span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            {groups.map((g) => (
              <tbody key={g}>
                <tr className="border-t border-border">
                  <th scope="colgroup" colSpan={bikes.length + 1} className="text-left font-display text-h4 uppercase px-2 pt-3 pb-1">{g}</th>
                </tr>
                {rows.filter((r) => r.group === g).map((r) => (
                  <Row key={r.label} row={r} bikes={bikes} />
                ))}
              </tbody>
            ))}
            <tfoot>
              <tr className="border-t border-border">
                <td className="border-r border-border" />
                {bikes.map((b) => (
                  <td key={b.id} className="p-2 border-r border-border last:border-r-0">
                    <a href={`/ir/${b.slug}`} rel="nofollow noopener" target="_blank" className="btn w-full">
                      Tienda <span aria-hidden="true">↗</span>
                      <span className="sr-only">: {b.brand} {b.name} (se abre en otra pestaña)</span>
                    </a>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}

function Row({ row, bikes }: { row: SpecRow; bikes: Bike[] }) {
  const values = bikes.map((b) => row.value(b));
  const nums = row.numeric ? bikes.map((b) => row.numeric!(b)) : [];
  const valid = nums.filter((n): n is number => n !== null);
  // Solo hay "mejor" si al menos dos bicis tienen el dato y no empatan todas
  const best =
    row.better && valid.length >= 2 && new Set(valid).size > 1
      ? row.better === "higher" ? Math.max(...valid) : Math.min(...valid)
      : null;
  const allSame = new Set(values).size === 1;
  return (
    <tr className={`border-t border-border ${!allSame ? "bg-surface" : ""}`}>
      <th scope="row" className="eyebrow text-left font-normal px-2 py-1 border-r border-border">{row.label}</th>
      {values.map((v, i) => {
        const isBest = best !== null && nums[i] === best;
        return (
          <td key={bikes[i].id} className={`px-2 py-1 border-r border-border last:border-r-0 ${v === null ? "italic" : ""} ${isBest ? "font-bold" : ""}`}>
            {v ?? MISSING}
            {isBest && <> <span aria-hidden="true">●</span><span className="sr-only">(la mejor)</span></>}
          </td>
        );
      })}
    </tr>
  );
}
