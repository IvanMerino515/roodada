"use client";

import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";

import { Icon } from "../../design-system/react";

type Mode = "lista" | "hasta" | "desde" | "entre";

const eur = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0, useGrouping: "always" }).format(n);
/** «3.500», «3500 €» → 3500 */
const toNumber = (t: string) => {
  const n = Number(t.replace(/\D/g, ""));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

/**
 * Presupuesto del comparador: el mismo desplegable de la barra de filtros, con las cifras fijas («hasta X €»)
 * y tres opciones para escribir: Hasta (≤), Desde (≥) y Entre (dos casillas). Al elegir una, la celda pasa
 * a ser el campo o los campos, con la misma letra; Escape o dejarlos vacíos vuelve al desplegable.
 * Lo que se manda en el formulario son siempre precioMin y precioMax (campos ocultos).
 */
export function PriceFilter({ steps, min, max }: { steps: number[]; min?: number; max?: number }) {
  const custom = min !== undefined || (max !== undefined && !steps.includes(max));
  const [mode, setMode] = useState<Mode>("lista");
  const [from, setFrom] = useState<number | undefined>(min);
  const [to, setTo] = useState<number | undefined>(max);
  const first = useRef<HTMLInputElement>(null);

  // El desplegable nativo se cierra después del cambio y puede quitar el foco al campo nuevo: se le devuelve
  useEffect(() => {
    if (mode === "lista") return;
    const t = setTimeout(() => first.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [mode]);

  const back = () => {
    setMode("lista");
    setFrom(min);
    setTo(max);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => e.key === "Escape" && back();
  // Vuelve al desplegable si se sale de la celda con todo vacío
  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    const empty = [...e.currentTarget.querySelectorAll<HTMLInputElement>("input[type=text]")].every((i) => !i.value);
    if (empty) back();
  };

  // Lo que se ve en el desplegable cuando ya hay un filtro escrito a mano
  const current =
    min !== undefined && max !== undefined ? `Entre ${eur(min)} y ${eur(max)}` : min !== undefined ? `Desde ${eur(min)}` : max !== undefined ? `Hasta ${eur(max)}` : null;

  const field = (value: number | undefined, set: (n: number | undefined) => void, ph: string, ref?: typeof first) => (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      defaultValue={value ? String(value) : ""}
      placeholder={ph}
      aria-label={`Presupuesto: ${ph}`}
      onChange={(e) => set(toNumber(e.currentTarget.value))}
      onKeyDown={onKeyDown}
      className="select flex-1 w-0 min-w-0 pl-1 pr-1"
    />
  );
  const word = (t: string) => <span className="eyebrow whitespace-nowrap pl-1">{t}</span>;

  return (
    <div className="relative flex items-center border-b border-border md:border-r" onBlur={mode === "lista" ? undefined : onBlur}>
      <label htmlFor="precio" className="eyebrow pl-2 whitespace-nowrap">Presupuesto:</label>
      {mode === "lista" ? (
        <select
          id="precio"
          defaultValue={custom ? "actual" : max ? String(max) : ""}
          onChange={(e) => {
            const v = e.currentTarget.value;
            if (v === "hasta" || v === "desde" || v === "entre") {
              setFrom(v === "hasta" ? undefined : min);
              setTo(v === "desde" ? undefined : max);
              setMode(v);
            } else if (v === "actual") {
              setFrom(min);
              setTo(max);
            } else {
              setFrom(undefined);
              setTo(toNumber(v));
            }
          }}
          className="select pl-1"
        >
          {/* Arriba, las de escribir: con el lápiz se ve que son para teclear */}
          <option value="hasta">✎ Hasta…</option>
          <option value="desde">✎ Desde…</option>
          <option value="entre">✎ Entre…</option>
          <option value="">Cualquier precio</option>
          {current && <option value="actual">{current}</option>}
          {steps.map((p) => (
            <option key={p} value={p}>{eur(p)}</option>
          ))}
        </select>
      ) : (
        // Escribiendo, sin flecha: todo el ancho es para las cifras (en «Entre» van dos casillas)
        <div className="flex items-center flex-1 min-w-0 pr-2">
          {mode === "hasta" && <>{word("Hasta")}{field(to, setTo, "Importe €", first)}</>}
          {mode === "desde" && <>{word("Desde")}{field(from, setFrom, "Importe €", first)}</>}
          {mode === "entre" && (
            <>
              {field(from, setFrom, "Mín. €", first)}
              {word("–")}
              {field(to, setTo, "Máx. €")}
            </>
          )}
        </div>
      )}
      {/* Lo que va en la dirección: ?precioMin=…&precioMax=… (vacíos no se mandan) */}
      <input type="hidden" name="precioMin" value={from ?? ""} />
      <input type="hidden" name="precioMax" value={to ?? ""} />
      {mode === "lista" && <Icon name="chevron-down" size={20} className="absolute right-2 pointer-events-none" />}
    </div>
  );
}
