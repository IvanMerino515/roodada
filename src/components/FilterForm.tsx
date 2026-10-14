"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const MoreFilters = createContext<{ open: boolean; toggle: () => void } | null>(null);

/**
 * Formulario de filtros. En móvil, los filtros secundarios (los marcados `extra` en FilterSelect)
 * se pliegan tras "Más filtros" para que las bicis no queden debajo de nueve desplegables.
 * Desde lg siempre se ven todos. Sin JavaScript también funciona: el formulario es un GET normal.
 */
export function FilterForm({ children, action }: { children: ReactNode; action: string }) {
  const [open, setOpen] = useState(false);
  return (
    <MoreFilters.Provider value={{ open, toggle: () => setOpen((o) => !o) }}>
      <form method="get" action={action} aria-label="Filtros" data-open={open || undefined} className="group/filtros border-b border-border">
        {children}
      </form>
    </MoreFilters.Provider>
  );
}

/** Botón de "Más filtros", solo en móvil. Dice cuántos filtros plegados están puestos. */
export function MoreFiltersToggle({ active }: { active: number }) {
  const ctx = useContext(MoreFilters);
  if (!ctx) return null;
  return (
    <button
      type="button"
      aria-expanded={ctx.open}
      onClick={ctx.toggle}
      className="lg:hidden eyebrow flex items-center justify-between gap-1 min-h-6 px-2 border-b border-border md:border-r cursor-pointer hover:underline"
    >
      {ctx.open ? "Menos filtros" : `Más filtros${active ? ` (${active} puestos)` : ""}`}
      <span aria-hidden="true">{ctx.open ? "−" : "+"}</span>
    </button>
  );
}
