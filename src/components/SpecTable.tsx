import type { ReactNode } from "react";

import { InfoTip } from "@/components/InfoTip";
import type { Bike } from "@/lib/catalog/types";
import { MISSING } from "@/lib/format";
import { rowsFor, type SpecRow as SpecRowDef } from "@/lib/specRows";

/** Fila de ficha técnica: etiqueta en mayúsculas a la izquierda, valor a la derecha, filete encima. */
export function SpecRow({ label, children, muted = false }: { label: ReactNode; children: ReactNode; muted?: boolean }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-2 border-t border-border px-2 py-1.5">
      <dt className="eyebrow pt-0.5">{label}</dt>
      <dd className={`m-0 ${muted ? "italic" : ""}`}>{children}</dd>
    </div>
  );
}

type Item = { group: string; row: SpecRowDef | null };

/** Alto en pantalla: un título de apartado ocupa algo más que una fila */
const H_TITLE = 1.2;

/**
 * Reparte las filas en dos columnas del mismo alto. Se corta por filas, no por apartados: si un apartado
 * sigue en la segunda columna, su título se repite arriba. Nunca deja un título suelto al pie de la columna.
 */
export function splitColumns(items: Item[]): [Item[], Item[]] {
  const h = (list: Item[]) => list.reduce((t, x) => t + (x.row ? 1 : H_TITLE), 0);
  let best: [Item[], Item[]] = [items, []];
  let gap = Infinity;
  for (let k = 1; k < items.length; k++) {
    if (!items[k - 1].row) continue; // la izquierda no puede acabar en un título
    const left = items.slice(0, k);
    const right = items.slice(k);
    if (right[0].row) right.unshift({ group: right[0].group, row: null }); // título repetido
    const d = Math.abs(h(left) - h(right));
    if (d < gap) [gap, best] = [d, [left, right]];
  }
  return best;
}

/** Especificaciones agrupadas, en dos columnas del mismo alto en escritorio. Un dato que la marca no publica se dice, no se oculta. */
export function SpecTable({ bike }: { bike: Bike }) {
  const rows = rowsFor([bike]);
  const items: Item[] = [];
  for (const g of new Set(rows.map((r) => r.group))) {
    items.push({ group: g, row: null });
    for (const r of rows) if (r.group === g) items.push({ group: g, row: r });
  }
  const [left, right] = splitColumns(items);
  // Cada columna: título de apartado y su lista de filas (<dl>); en móvil, el título repetido de la derecha sobra
  const column = (list: Item[], side: "l" | "r") => {
    const blocks: { group: string; title: boolean; rows: SpecRowDef[] }[] = [];
    for (const x of list) {
      if (!x.row) blocks.push({ group: x.group, title: true, rows: [] });
      else if (blocks.length) blocks[blocks.length - 1].rows.push(x.row);
      else blocks.push({ group: x.group, title: false, rows: [x.row] });
    }
    return (
      <div className="min-w-0">
        {blocks.map((bl, i) => {
          const repeated = side === "r" && i === 0 && left.some((y) => y.group === bl.group);
          return (
            <section key={`${side}-${bl.group}`} aria-label={bl.group}>
              {bl.title && (
                <h3 className={`font-display text-h4 uppercase border-t border-border px-2 pt-3 pb-1 ${repeated ? "hidden lg:block" : ""}`}>
                  {bl.group}
                </h3>
              )}
              <dl className="m-0">
                {bl.rows.map((r) => {
                  const v = r.value(bike);
                  const note = r.note?.(bike);
                  const info = v !== null ? r.info?.(bike) : null;
                  return (
                    <SpecRow key={r.label} label={r.label} muted={v === null}>
                      {info ? <InfoTip text={info} label={`De dónde sale: ${r.label.toLowerCase()}`}>{v}</InfoTip> : (v ?? MISSING)}
                      {note && <span className="block text-small">{note}</span>}
                    </SpecRow>
                  );
                })}
              </dl>
            </section>
          );
        })}
      </div>
    );
  };
  return (
    <div className="grid lg:grid-cols-2 lg:divide-x divide-border">
      {column(left, "l")}
      {column(right, "r")}
    </div>
  );
}

/** Datos de la ficha técnica que la marca sí publica (para el contador del desplegable) */
export function specCount(bike: Bike) {
  return rowsFor([bike]).filter((r) => r.value(bike) !== null).length;
}
