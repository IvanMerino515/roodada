"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { Button, Checkbox, Text } from "../../design-system/react";

export const MAX_COMPARE = 4;

type Ctx = { selected: string[]; toggle: (slug: string) => void };
const CompareContext = createContext<Ctx | null>(null);

/** Selección de 2 a 4 bicis para la comparativa, con una barra fija abajo. */
export function CompareProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (slug: string) =>
    setSelected((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : s.length < MAX_COMPARE ? [...s, slug] : s));
  return (
    <CompareContext.Provider value={{ selected, toggle }}>
      {children}
      {selected.length > 0 && (
        <div className="sticky bottom-0 z-10 bg-surface border-t-[length:var(--ds-border-width)] border-border">
          <div className="ds-container flex flex-wrap items-center justify-between gap-2 py-2">
            <Text size="label" as="p" aria-live="polite">
              {selected.length} de {MAX_COMPARE} para comparar
              {selected.length < 2 ? " · elige al menos 2" : ""}
            </Text>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => selected.forEach(toggle)}>
                Vaciar
              </Button>
              {selected.length >= 2 && (
                <Button size="sm" href={`/comparativa?bicis=${selected.join(",")}`}>
                  Comparar
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </CompareContext.Provider>
  );
}

export function CompareToggle({ slug }: { slug: string }) {
  const ctx = useContext(CompareContext);
  if (!ctx) return null;
  const checked = ctx.selected.includes(slug);
  const full = ctx.selected.length >= MAX_COMPARE;
  return <Checkbox label="Comparar" checked={checked} disabled={!checked && full} onChange={() => ctx.toggle(slug)} />;
}
