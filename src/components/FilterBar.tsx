import type { ReactNode } from "react";

import { Icon } from "../../design-system/react";

/** Celda de una barra de filtros: etiqueta visible a la izquierda y desplegable plano. */
export function FilterSelect({
  id, label, name, defaultValue, children, className = "",
}: {
  id: string;
  label: string;
  name: string;
  defaultValue?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative flex items-center border-b border-border md:border-r ${className}`}>
      <label htmlFor={id} className="eyebrow pl-2 whitespace-nowrap">{label}:</label>
      <select id={id} name={name} defaultValue={defaultValue} className="select pl-1">
        {children}
      </select>
      <Icon name="chevron-down" size={20} className="absolute right-2 pointer-events-none" />
    </div>
  );
}

/** Rejilla de celdas que se parte en 1 / 2 / n columnas según el ancho. */
export function FilterRow({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div role="group" aria-label={label} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-none lg:grid-flow-col lg:auto-cols-fr border-t border-border">
      {children}
    </div>
  );
}
