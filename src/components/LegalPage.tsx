import type { ReactNode } from "react";

/** Página de texto legal: titular a la izquierda de la retícula y texto en columna de lectura. */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="wrap grid-swiss gap-y-3 pt-4 pb-8">
      <h1 className="col-span-4 md:col-span-8 lg:col-span-4 text-h1 uppercase">{title}</h1>
      <div className="col-span-4 md:col-span-8 lg:col-span-7 lg:col-start-6 grid gap-3 max-w-[var(--ds-container-narrow)] [&_h2]:text-h4 [&_h2]:uppercase [&_h2]:mt-2 [&_ul]:grid [&_ul]:gap-1 [&_ul]:pl-3 [&_a]:underline [&_a]:underline-offset-2">
        <p className="eyebrow">Actualizado el {updated}</p>
        {children}
      </div>
    </div>
  );
}
