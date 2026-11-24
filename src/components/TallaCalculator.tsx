"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";

import { track } from "@/lib/actividad/cliente";
import { alturaTramo } from "@/lib/actividad/eventos";
import type { ResultadoTalla } from "@/lib/talla";

// [ruta, botón, cómo se dice tras «bicis»]
const TIPOS = [
  ["carretera", "Carretera", "de carretera"],
  ["gravel", "Gravel", "de gravel"],
  ["montana", "Montaña", "de montaña"],
  ["urbanas", "Urbana", "urbanas y de paseo"],
  ["infantiles", "Infantil", "infantiles"],
] as const;
type Tipo = (typeof TIPOS)[number][0];

const m = (cm: number) => `${(cm / 100).toLocaleString("es-ES", { minimumFractionDigits: 2 })} m`;

/**
 * Altura, tipo de bici y (opcional) entrepierna → la talla que toca en las bicis de ese tipo, cómo se
 * reparte y la de cada marca. Los cálculos los hace /api/talla con la tabla oficial de cada marca.
 */
export function TallaCalculator() {
  const id = useId();
  const [altura, setAltura] = useState("175");
  const [entrepierna, setEntrepierna] = useState("");
  const [tipo, setTipo] = useState<Tipo>("gravel");
  const [r, setR] = useState<ResultadoTalla | null>(null);
  const [cargando, setCargando] = useState(false);

  const h = Number(altura);
  const infantil = tipo === "infantiles";
  const valida = Number.isInteger(h) && h >= (infantil ? 90 : 140) && h <= (infantil ? 170 : 215);

  useEffect(() => {
    if (!valida) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      setCargando(true);
      const p = new URLSearchParams({ altura: String(h), tipo });
      if (entrepierna && !infantil) p.set("entrepierna", entrepierna);
      fetch(`/api/talla?${p}`, { signal: ctrl.signal })
        .then((res) => (res.ok ? res.json() : null))
        .then((d: ResultadoTalla | null) => {
          setR(d);
          // Registro anónimo: tipo, altura por tramos y la talla que sale (nunca la altura exacta)
          if (d) {
            const top = tipo === "infantiles" ? d.pulgadas[0] : (d.letras[0] ?? d.cm[0]);
            track("talla_calculada", { tipo, altura: alturaTramo(h), entrepierna: Boolean(entrepierna), talla: top?.label ?? null });
          }
        })
        .catch(() => {})
        .finally(() => setCargando(false));
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [h, tipo, entrepierna, valida, infantil]);

  const principal = r ? (infantil ? r.pulgadas[0] : (r.letras[0] ?? r.cm[0])) : null;
  const bicisDe = `bicis ${TIPOS.find(([k]) => k === tipo)![2]}`;

  return (
    <div className="grid lg:grid-cols-12 border border-border bg-white">
      <form className="lg:col-span-5 p-2 md:p-3 grid gap-3 content-start border-b lg:border-b-0 lg:border-r border-border" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="grid gap-1 border-0 p-0 m-0 min-w-0">
          <legend className="eyebrow mb-1">Tipo de bici</legend>
          <div className="flex flex-wrap gap-1">
            {TIPOS.map(([k, l]) => (
              <button key={k} type="button" aria-pressed={tipo === k} onClick={() => setTipo(k)} className="btn aria-pressed:bg-choice aria-pressed:text-on-choice aria-pressed:border-border">
                {l}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-1">
          <label htmlFor={`${id}-h`} className="eyebrow">{infantil ? "Altura del niño o la niña (cm)" : "Tu altura (cm)"}</label>
          <input id={`${id}-h`} type="number" inputMode="numeric" value={altura} onChange={(e) => setAltura(e.target.value)} className="input font-display text-display num max-w-40" />
          {!valida && altura !== "" && <p className="text-small font-bold" role="alert">Escribe una altura entre {infantil ? "90 y 170" : "140 y 215"} cm.</p>}
        </div>
        {!infantil && (
          <div className="grid gap-1 border-t border-border pt-2">
            <label htmlFor={`${id}-e`} className="eyebrow">Entrepierna (cm) · opcional</label>
            <input id={`${id}-e`} type="number" inputMode="numeric" value={entrepierna} placeholder="80" onChange={(e) => setEntrepierna(e.target.value)} className="input font-display text-h2 num max-w-30 placeholder:opacity-40" />
            <p className="text-small">Descalzo y de pie contra la pared, del suelo a la entrepierna. Sirve para decidir cuando estás entre dos tallas.</p>
          </div>
        )}
      </form>

      {/* Mientras calcula, lo anterior se atenúa; al llegar, lo nuevo entra con un fundido (key) */}
      <div
        className={`lg:col-span-7 p-2 md:p-3 grid gap-3 content-start transition-opacity duration-200 ease-ds motion-reduce:transition-none ${cargando ? "opacity-40" : "opacity-100"}`}
        aria-live="polite"
        aria-busy={cargando}
      >
        {!r || !valida ? (
          <p className="text-small">{cargando ? "Calculando…" : "Escribe tu altura y elige el tipo de bici."}</p>
        ) : r.total === 0 ? (
          <p>No hay {bicisDe} con talla para {m(h)} en el catálogo.</p>
        ) : (
          <div key={`${tipo}-${h}-${entrepierna}-${r.total}`} className="llegar grid gap-3">
            <div className="grid gap-1">
              <p className="eyebrow">Con {m(h)}, {bicisDe}</p>
              <p className="font-display text-display leading-none">{principal?.label ?? "—"}</p>
              <p>
                En las <strong className="num">{r.total.toLocaleString("es-ES", { useGrouping: "always" })}</strong> {bicisDe} con talla
                para ti, es tu talla en el <strong>{principal?.pct} %</strong>{infantil ? " (tamaño de rueda)" : ""}. En{" "}
                {r.entreDos.toLocaleString("es-ES", { useGrouping: "always" })} estás entre dos tallas
                {!infantil && !entrepierna ? ": con la entrepierna lo afinamos" : ""}.
              </p>
            </div>
            {!infantil && <Reparto titulo="Marcas que usan letras" datos={r.letras} />}
            {!infantil && r.cm.length > 0 && <Reparto titulo="Marcas que miden en centímetros" datos={r.cm} />}
            {infantil && <Reparto titulo="Tamaño de rueda" datos={r.pulgadas} />}
            <div className="grid gap-1">
              <h3 className="eyebrow">Tu talla en cada marca</h3>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-2 list-none m-0 p-0 text-small">
                {r.marcas.map((x) => (
                  <li key={x.slug} className="flex justify-between gap-1 border-t border-border py-0.5">
                    <Link href={`/marcas/${x.slug}`} className="link">{x.marca}</Link>
                    <span className="font-semibold num">{x.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-1">
              <Link href="/guia" className="btn btn-solid">Ver qué bicis me encajan <span aria-hidden="true">→</span></Link>
              <Link href={`/bicis/${tipo}`} className="btn">B{bicisDe.slice(1)}</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Reparto({ titulo, datos }: { titulo: string; datos: { label: string; pct: number }[] }) {
  if (!datos.length) return null;
  return (
    <div className="grid gap-1">
      <h3 className="eyebrow">{titulo}</h3>
      <ul className="grid gap-0.5 list-none m-0 p-0">
        {datos.map((d) => (
          <li key={d.label} className="grid grid-cols-[5ch_1fr_4ch] items-center gap-1 text-small num">
            <span className="font-semibold">{d.label}</span>
            <span className="h-1 bg-bg" aria-hidden="true">
              <span className="block h-full bg-accent transition-[width] duration-300 ease-ds motion-reduce:transition-none" style={{ width: `${d.pct}%` }} />
            </span>
            <span className="text-right">{d.pct} %</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
