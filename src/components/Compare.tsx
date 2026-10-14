"use client";

import Link from "next/link";
import { createContext, useContext, useState, type ReactNode } from "react";

export const MAX_COMPARE = 4;

type Ctx = { selected: string[]; toggle: (slug: string) => void; clear: () => void };
const CompareContext = createContext<Ctx | null>(null);

/** Selección de 2 a 4 bicis para la comparativa, con una barra fija abajo. */
export function CompareProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (slug: string) =>
    setSelected((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : s.length < MAX_COMPARE ? [...s, slug] : s));
  return (
    <CompareContext.Provider value={{ selected, toggle, clear: () => setSelected([]) }}>
      {children}
      <div aria-live="polite" className="sticky bottom-0 z-20">
        {selected.length > 0 && (
          <div className="bg-accent text-on-accent">
            <div className="wrap flex flex-wrap items-center justify-between gap-2 py-1">
              <p className="eyebrow num">
                Comparar {selected.length}/{MAX_COMPARE}
                {selected.length < 2 ? " · elige al menos 2" : ""}
              </p>
              <div className="flex gap-1">
                <button type="button" className="btn" onClick={() => setSelected([])}>
                  Vaciar
                </button>
                {selected.length >= 2 && (
                  <Link className="btn bg-on-accent text-accent border-on-accent" href={`/comparativa?bicis=${selected.join(",")}`}>
                    Comparar <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </CompareContext.Provider>
  );
}

export function CompareToggle({ slug, name }: { slug: string; name: string }) {
  const ctx = useContext(CompareContext);
  if (!ctx) return null;
  const checked = ctx.selected.includes(slug);
  const full = ctx.selected.length >= MAX_COMPARE;
  return (
    <label
      className={`eyebrow flex items-center gap-1 min-h-6 px-2 cursor-pointer select-none ${checked ? "bg-accent text-on-accent" : "hover:underline"} has-disabled:cursor-not-allowed has-disabled:opacity-50`}
    >
      <input
        type="checkbox"
        className="size-2 accent-[var(--ds-accent)] cursor-[inherit]"
        checked={checked}
        disabled={!checked && full}
        onChange={() => ctx.toggle(slug)}
        aria-label={`Comparar ${name}`}
      />
      <span aria-hidden="true">Comparar</span>
    </label>
  );
}
