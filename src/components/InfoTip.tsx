import type { ReactNode } from "react";

/**
 * Valor con un ⓘ justo a su lado; al pulsarlo (el valor o el ⓘ), la explicación sale debajo. Mismo dibujo
 * de ⓘ que el del precio en la ficha.
 */
export function InfoTip({ children, text, label, textClassName = "" }: { children: ReactNode; text: ReactNode; label: string; textClassName?: string }) {
  return (
    <details>
      <summary className="list-none [&::-webkit-details-marker]:hidden inline-flex items-center gap-1 cursor-pointer" title={label}>
        <span>{children}</span>
        <span
          aria-hidden="true"
          className="inline-flex items-center justify-center size-3 shrink-0 rounded-full border border-border text-small font-semibold not-italic normal-case tracking-normal leading-none select-none hover:bg-surface"
        >
          i
        </span>
        <span className="sr-only">{label}</span>
      </summary>
      <div className={`text-small mt-0.5 border-l-2 border-border pl-1 font-normal not-italic ${textClassName}`}>{text}</div>
    </details>
  );
}
