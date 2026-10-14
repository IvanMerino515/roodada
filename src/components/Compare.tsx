"use client";

import Link from "next/link";
import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";

export const MAX_COMPARE = 4;

type Ctx = { selected: string[]; toggle: (slug: string) => void; clear: () => void };
const CompareContext = createContext<Ctx | null>(null);

// La selección se guarda en el navegador mientras dura la visita (sessionStorage): así no se pierde al
// cambiar de página del catálogo o al entrar en una ficha y volver. Si el navegador no deja guardar,
// vive solo en memoria.
const KEY = "roodada-comparar";
const listeners = new Set<() => void>();
let memory = "[]";
const readRaw = () => {
  try {
    return sessionStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
};
const save = (slugs: string[]) => {
  memory = JSON.stringify(slugs);
  try {
    sessionStorage.setItem(KEY, memory);
  } catch {}
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Selección de 2 a 4 bicis para la comparativa, con una barra fija abajo. */
export function CompareProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  const selected = useMemo<string[]>(() => {
    try {
      const v = JSON.parse(raw);
      return Array.isArray(v) ? v.slice(0, MAX_COMPARE) : [];
    } catch {
      return [];
    }
  }, [raw]);
  const setSelected = (next: string[]) => save(next);
  const toggle = (slug: string) =>
    setSelected(selected.includes(slug) ? selected.filter((x) => x !== slug) : selected.length < MAX_COMPARE ? [...selected, slug] : selected);
  return (
    <CompareContext.Provider value={{ selected, toggle, clear: () => setSelected([]) }}>
      {children}
      <div className="sticky bottom-0 z-20">
        {/* Siempre montada (una región que aparece de golpe no se anuncia) y con frase completa */}
        <p role="status" className="sr-only">
          {selected.length
            ? `${selected.length} de ${MAX_COMPARE} bicis elegidas para comparar${selected.length < 2 ? ". Elige al menos 2" : ""}`
            : ""}
        </p>
        {selected.length > 0 && (
          <div className="bg-choice text-on-choice border-t border-border">
            <div className="wrap flex flex-wrap items-center justify-between gap-2 py-1">
              <p className="eyebrow num" aria-hidden="true">
                Comparar {selected.length}/{MAX_COMPARE}
                {selected.length < 2 ? " · elige al menos 2" : ""}
              </p>
              <div className="flex gap-1">
                <button type="button" className="btn" onClick={() => setSelected([])}>
                  Vaciar
                </button>
                {selected.length >= 2 && (
                  <Link className="btn btn-solid" href={`/comparativa?bicis=${selected.join(",")}`}>
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
      className={`eyebrow flex items-center gap-1 min-h-6 px-2 cursor-pointer select-none ${checked ? "bg-choice text-on-choice" : "hover:underline"} has-disabled:cursor-not-allowed has-disabled:opacity-50 has-focus-visible:outline-2 has-focus-visible:outline-accent has-focus-visible:-outline-offset-4`}
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
