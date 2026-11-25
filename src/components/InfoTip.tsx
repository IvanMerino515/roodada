import type { ReactNode } from "react";

/**
 * Valor con un ⓘ arriba a la derecha; al abrirlo, la explicación sale debajo. Mismo dibujo que el ⓘ del
 * precio en la ficha.
 */
export function InfoTip({ children, text, label }: { children: ReactNode; text: string; label: string }) {
  return (
    <div className="relative pr-4">
      {children}
      <details>
        <summary
          aria-label={label}
          title={label}
          className="absolute top-0 right-0 list-none [&::-webkit-details-marker]:hidden cursor-pointer inline-flex items-center justify-center size-3 rounded-full border border-border text-small font-semibold leading-none select-none hover:bg-surface"
        >
          i
        </summary>
        <p className="text-small mt-0.5 border-l-2 border-border pl-1 font-normal not-italic">{text}</p>
      </details>
    </div>
  );
}
