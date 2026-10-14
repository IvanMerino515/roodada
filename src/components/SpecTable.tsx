import type { ReactNode } from "react";

import type { Bike } from "@/lib/catalog/types";
import { MISSING } from "@/lib/format";
import { rowsFor } from "@/lib/specRows";

/** Fila de ficha técnica: etiqueta en mayúsculas a la izquierda, valor a la derecha, filete encima. */
export function SpecRow({ label, children, muted = false }: { label: ReactNode; children: ReactNode; muted?: boolean }) {
  return (
    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-2 border-t border-border px-2 py-1.5">
      <dt className="eyebrow pt-0.5">{label}</dt>
      <dd className={`m-0 ${muted ? "italic" : ""}`}>{children}</dd>
    </div>
  );
}

/** Especificaciones agrupadas, en dos columnas en escritorio. Un dato que la marca no publica se dice, no se oculta. */
export function SpecTable({ bike }: { bike: Bike }) {
  const rows = rowsFor([bike]);
  const groups = [...new Set(rows.map((r) => r.group))];
  return (
    <div className="lg:columns-2 lg:gap-0 lg:[column-rule:1px_solid_var(--ds-border)]">
      {groups.map((g) => (
        <section key={g} className="break-inside-avoid" aria-labelledby={`spec-${g}`}>
          <h3 id={`spec-${g}`} className="font-display text-h4 uppercase border-t border-border px-2 pt-3 pb-1">{g}</h3>
          <dl className="m-0">
            {rows
              .filter((r) => r.group === g)
              .map((r) => {
                const v = r.value(bike);
                return (
                  <SpecRow key={r.label} label={r.label} muted={v === null}>
                    {v ?? MISSING}
                  </SpecRow>
                );
              })}
          </dl>
        </section>
      ))}
    </div>
  );
}
