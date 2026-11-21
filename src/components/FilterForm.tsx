"use client";

import { useRouter } from "next/navigation";
import { createContext, startTransition, useContext, useState, type FormEvent, type ReactNode } from "react";

import { startNavProgress } from "./NavProgress";

const MoreFilters = createContext<{ open: boolean; toggle: () => void } | null>(null);

/**
 * Formulario de filtros. En móvil, los filtros secundarios (los marcados `extra` en FilterSelect)
 * se pliegan tras "Más filtros" para que las bicis no queden debajo de nueve desplegables.
 * Desde lg siempre se ven todos. Sin JavaScript también funciona: el formulario es un GET normal.
 * Con JavaScript, "Aplicar" navega dentro de la web en lugar de recargarla: la lista de bicis se funde
 * con la nueva y el total cuenta hasta la cifra nueva.
 */
export function FilterForm({ children, action }: { children: ReactNode; action: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Solo los filtros puestos: la dirección queda igual que con el GET normal, sin "campo=" vacíos
    const params = new URLSearchParams();
    new FormData(e.currentTarget).forEach((v, k) => {
      if (typeof v === "string" && v !== "") params.append(k, v);
    });
    const qs = params.toString();
    startNavProgress();
    startTransition(() => router.push(qs ? `${action}?${qs}` : action, { scroll: false }));
  };
  return (
    <MoreFilters.Provider value={{ open, toggle: () => setOpen((o) => !o) }}>
      <form method="get" action={action} onSubmit={submit} aria-label="Filtros" data-open={open || undefined} className="group/filtros border-b border-border">
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
