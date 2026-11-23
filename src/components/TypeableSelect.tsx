"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import { Icon } from "../../design-system/react";
import { EXTRA } from "./FilterBar";

const TYPE = "__escribir";
const norm = (t: string) => t.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

type Option = { value: string; label: string; /** Texto con el que se autocompleta (sin el recuento) */ text?: string };

/**
 * El mismo desplegable de la barra de filtros (FilterSelect), con una opción arriba del todo para escribir.
 * Al elegirla, la celda pasa a ser un campo de texto con la misma letra; Escape o dejarlo vacío vuelve al
 * desplegable. Con `autocomplete`, al escribir se completa en el propio campo con la primera opción que
 * empieza igual (sin abrir otra lista). Sin JavaScript queda el desplegable normal.
 */
export function TypeableSelect({
  id, label, name, defaultValue = "", allLabel, typeLabel, placeholder, options, numeric = false,
  autocomplete = false, className = "", extra = false,
}: {
  id: string;
  label: string;
  name: string;
  defaultValue?: string;
  /** Primera opción, la de «sin filtro» («Cualquier precio», «Todas») */
  allLabel: string;
  /** Primera opción, la de escribir («Escribe tu presupuesto…»); se le pone delante el lápiz ✎ */
  typeLabel: string;
  placeholder: string;
  options: Option[];
  numeric?: boolean;
  autocomplete?: boolean;
  className?: string;
  extra?: boolean;
}) {
  const [typing, setTyping] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const field = useRef<HTMLInputElement>(null);
  // Al elegir «✎ Escribe…» el desplegable nativo se cierra después del cambio y puede quitarle el foco al
  // campo nuevo: se le da el foco otra vez cuando ya se ha cerrado, para poder teclear sin hacer clic
  useEffect(() => {
    if (!typing) return;
    const t = setTimeout(() => field.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [typing]);

  // Al escribir: si una opción empieza por lo escrito, se completa y lo que falta queda seleccionado
  const onInput = (e: FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const typed = input.value;
    const deleting = (e.nativeEvent as InputEvent).inputType?.startsWith("delete");
    const match = typed && !deleting ? options.find((o) => norm(o.text ?? o.label).startsWith(norm(typed))) : undefined;
    if (match && autocomplete) {
      const full = match.text ?? match.label;
      input.value = full;
      input.setSelectionRange(typed.length, full.length);
      setValue(match.value);
    } else {
      const exact = options.find((o) => norm(o.text ?? o.label) === norm(typed));
      setValue(exact ? exact.value : typed);
    }
  };
  const back = () => {
    setTyping(false);
    setValue(defaultValue);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") back();
  };

  return (
    <div className={`relative items-center border-b border-border md:border-r ${extra ? EXTRA : "flex"} ${className}`}>
      <label htmlFor={id} className="eyebrow pl-2 whitespace-nowrap">{label}:</label>
      {typing ? (
        <>
          <input
            ref={field}
            id={id}
            type="text"
            autoFocus
            autoComplete="off"
            inputMode={numeric ? "numeric" : undefined}
            placeholder={placeholder}
            aria-label={`${label}: ${placeholder}`}
            onInput={onInput}
            onKeyDown={onKeyDown}
            onBlur={(e) => !e.currentTarget.value && back()}
            className="select pl-1"
          />
          <input type="hidden" name={name} value={value} />
        </>
      ) : (
        <select
          id={id}
          name={name}
          defaultValue={defaultValue}
          onChange={(e) => e.currentTarget.value === TYPE && setTyping(true)}
          className="select pl-1"
        >
          {/* Arriba del todo, la de escribir: con el lápiz se ve que es para teclear */}
          <option value={TYPE}>✎ {typeLabel}</option>
          <option value="">{allLabel}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}
      <Icon name="chevron-down" size={20} className="absolute right-2 pointer-events-none" />
    </div>
  );
}
