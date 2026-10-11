import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { Alert, Button, Container, Heading, Section, Stack, Text } from "../../../design-system/react";
import { getCatalog } from "@/lib/catalog/load";
import type { Bike } from "@/lib/catalog/types";
import { MISSING } from "@/lib/format";
import { rowsFor, type SpecRow } from "@/lib/specRows";

export const metadata: Metadata = { title: "Comparativa", robots: { index: false } };

export default function ComparisonPage({ searchParams }: PageProps<"/comparativa">) {
  return (
    <Section size="sm">
      <Container size="wide">
        <Suspense fallback={<Text>Preparando la comparativa…</Text>}>
          {searchParams.then((sp) => (
            <Comparison slugs={String(sp.bicis ?? "").split(",").filter(Boolean).slice(0, 4)} />
          ))}
        </Suspense>
      </Container>
    </Section>
  );
}

async function Comparison({ slugs }: { slugs: string[] }) {
  const catalog = await getCatalog();
  const bikes = slugs.map((s) => catalog.find((b) => b.slug === s)).filter((b): b is Bike => !!b);
  if (bikes.length < 2) {
    return (
      <Alert tone="warning" title="Elige al menos dos bicis">
        Márcalas en el <Link href="/comparador" className="ds-link">comparador</Link> o en tus resultados de la guía.
      </Alert>
    );
  }
  const rows = rowsFor(bikes);
  const groups = [...new Set(rows.map((r) => r.group))];

  return (
    <Stack>
      <Heading level={1} size="h2">Comparativa</Heading>
      <Text size="small">En negrita, la mejor en cada dato que se puede medir. «{MISSING}» significa que la marca no lo da.</Text>
      <div className="overflow-x-auto">
        <table className="w-full min-w-80 border-collapse text-small table-fixed">
          <caption className="sr-only">Comparativa de {bikes.length} bicis</caption>
          <thead>
            <tr>
              <td className="w-20" />
              {bikes.map((b) => (
                <th key={b.id} scope="col" className="align-top text-left p-1">
                  <Link href={`/bici/${b.slug}`} className="grid gap-1">
                    <span className="block bg-white">
                      <Image src={b.imageUrl} alt="" width={300} height={200} sizes="25vw" className="w-full h-auto aspect-[3/2] object-contain" />
                    </span>
                    <span className="text-label">{b.brand}</span>
                    <span className="font-display">{b.name}</span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          {groups.map((g) => (
            <tbody key={g}>
              <tr>
                <th scope="colgroup" colSpan={bikes.length + 1} className="text-left text-label pt-3 pb-1">{g}</th>
              </tr>
              {rows.filter((r) => r.group === g).map((r) => (
                <Row key={r.label} row={r} bikes={bikes} />
              ))}
            </tbody>
          ))}
          <tfoot>
            <tr>
              <td />
              {bikes.map((b) => (
                <td key={b.id} className="p-1 pt-3">
                  <Button variant="secondary" size="sm" href={`/ir/${b.slug}`} rel="nofollow noopener" target="_blank">
                    Ver en la tienda
                  </Button>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </Stack>
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
    <tr className="border-t border-border">
      <th scope="row" className="text-left font-normal py-1 pr-2">{row.label}</th>
      {values.map((v, i) => (
        <td
          key={bikes[i].id}
          className={`py-1 px-1 ${v === null ? "opacity-70" : ""} ${best !== null && nums[i] === best ? "font-bold" : ""} ${!allSame ? "bg-surface" : ""}`}
        >
          {v ?? MISSING}
        </td>
      ))}
    </tr>
  );
}
