import type { Bike } from "@/lib/catalog/types";
import { MISSING } from "@/lib/format";
import { rowsFor } from "@/lib/specRows";

/** Especificaciones de una bici agrupadas. Un dato que la marca no publica se dice, no se oculta. */
export function SpecTable({ bike }: { bike: Bike }) {
  const rows = rowsFor([bike]);
  const groups = [...new Set(rows.map((r) => r.group))];
  return (
    <div className="grid gap-4">
      {groups.map((g) => (
        <table key={g} className="w-full text-small border-collapse">
          <caption className="text-left text-label pb-1">{g}</caption>
          <tbody>
            {rows
              .filter((r) => r.group === g)
              .map((r) => {
                const v = r.value(bike);
                return (
                  <tr key={r.label} className="border-t border-border">
                    <th scope="row" className="text-left font-normal py-1 pr-2 w-1/2">{r.label}</th>
                    <td className={v === null ? "py-1 opacity-70" : "py-1"}>{v ?? MISSING}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      ))}
    </div>
  );
}
