"use client";

import { useState } from "react";

import { Icon } from "../../design-system/react";
import { CATEGORY_LABEL, DISCIPLINE_LABEL, int } from "@/lib/format";
import { PLATOS, PLATOS_CATEGORIA, type Platos } from "@/lib/catalogFilters";
import type { Category, Discipline } from "@/lib/catalog/types";

/**
 * Tipo, Subtipo y (solo gravel) Platos del comparador. Subtipo (la disciplina de la base: Trail, XC, Descenso, Aero…) solo aparece
 * cuando hay un tipo elegido y ese tipo tiene más de un subtipo; sus opciones cambian al cambiar el tipo,
 * sin tener que aplicar. Mismas celdas y desplegables que FilterSelect.
 */
export function TypeFilter({
  categories, subtypes, categoria, subtipo, platos, platosOptions = [],
}: {
  /** [tipo, nº de bicis], en el orden del desplegable */
  categories: [string, number][];
  /** Por tipo: [subtipo, nº de bicis], de más a menos */
  subtypes: Record<string, [string, number][]>;
  categoria?: string;
  subtipo?: string;
  /** Solo gravel: monoplato o varios platos (aparece al elegir Gravel, sin aplicar) */
  platos?: string;
  platosOptions?: [Platos, number][];
}) {
  const [cat, setCat] = useState(categoria ?? "");
  const options = cat ? (subtypes[cat] ?? []) : [];
  return (
    <>
      <div className="relative flex items-center border-b border-border md:border-r">
        <label htmlFor="categoria" className="eyebrow pl-2 whitespace-nowrap">Tipo:</label>
        <select id="categoria" name="categoria" defaultValue={categoria ?? ""} onChange={(e) => setCat(e.currentTarget.value)} className="select pl-1">
          <option value="">Todos</option>
          {categories.map(([k, n]) => (
            <option key={k} value={k}>{CATEGORY_LABEL[k as Category]} ({int(n)})</option>
          ))}
        </select>
        <Icon name="chevron-down" size={20} className="absolute right-2 pointer-events-none" />
      </div>
      {options.length > 1 && (
        <div className="relative flex items-center border-b border-border md:border-r">
          <label htmlFor="subtipo" className="eyebrow pl-2 whitespace-nowrap">Subtipo:</label>
          {/* key: al cambiar de tipo, el subtipo vuelve a «Todos» */}
          <select key={cat} id="subtipo" name="subtipo" defaultValue={cat === categoria ? (subtipo ?? "") : ""} className="select pl-1">
            <option value="">Todos</option>
            {options.map(([k, n]) => (
              <option key={k} value={k}>{DISCIPLINE_LABEL[k as Discipline] ?? k} ({int(n)})</option>
            ))}
          </select>
          <Icon name="chevron-down" size={20} className="absolute right-2 pointer-events-none" />
        </div>
      )}
      {cat === PLATOS_CATEGORIA && platosOptions.length > 0 && (
        <div className="relative flex items-center border-b border-border md:border-r">
          <label htmlFor="platos" className="eyebrow pl-2 whitespace-nowrap">Platos:</label>
          <select key={cat} id="platos" name="platos" defaultValue={cat === categoria ? (platos ?? "") : ""} className="select pl-1">
            <option value="">Todos</option>
            {platosOptions.map(([k, n]) => (
              <option key={k} value={k}>{PLATOS[k]} ({int(n)})</option>
            ))}
          </select>
          <Icon name="chevron-down" size={20} className="absolute right-2 pointer-events-none" />
        </div>
      )}
    </>
  );
}
