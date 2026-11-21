"use client";

import { useEffect, useRef, useState } from "react";

import { ELECTRIC, USES, type Answers } from "@/lib/recommender/questions";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fmt = (n: number) => n.toLocaleString("es-ES");

/**
 * Número que cuenta hasta su valor nuevo en 320 ms (frena al llegar). El lector de pantalla solo oye
 * el valor final: el número que se mueve va oculto para él.
 */
export function AnimatedCount({ value, from: initial, className = "" }: { value: number; from?: number; className?: string }) {
  const [shown, setShown] = useState(initial ?? value);
  const from = useRef(initial ?? value);
  useEffect(() => {
    const start = from.current;
    from.current = value;
    if (start === value) return;
    if (reduced()) {
      const id = requestAnimationFrame(() => setShown(value));
      return () => cancelAnimationFrame(id);
    }
    const t0 = performance.now();
    let id = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 320);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(start + (value - start) * eased));
      if (p < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [value]);
  return (
    <span className={className}>
      <span aria-hidden="true">{fmt(shown)}</span>
      <span className="sr-only">{fmt(value)}</span>
    </span>
  );
}

/** Check que se dibuja cuando la opción que lo contiene está elegida (aria-pressed="true") */
export function CheckMark() {
  return (
    <svg className="check inline-block size-[1.1em] align-[-0.15em]" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3 10.5 L8 15 L17 5" />
    </svg>
  );
}

type Step = { n: number; label: string };

/** Los pasos del embudo con sus cifras reales (las del recomendador, vía /api/contador) */
function funnelSteps(funnel: Record<string, number>, a: Partial<Answers>): Step[] {
  const steps: Step[] = [{ n: funnel.total, label: "bicis a la venta" }];
  if (funnel.electrica !== undefined && a.electrica) {
    const e = { si: "eléctricas", no: "sin motor", igual: "con y sin motor" } satisfies Record<keyof typeof ELECTRIC, string>;
    steps.push({ n: funnel.electrica, label: e[a.electrica] });
  }
  if (funnel.presupuesto !== undefined) steps.push({ n: funnel.presupuesto, label: "en tu presupuesto" });
  if (funnel.uso !== undefined && a.uso) steps.push({ n: funnel.uso, label: `para ${USES[a.uso].label.toLowerCase()}` });
  if (funnel.altura !== undefined && a.altura) steps.push({ n: funnel.altura, label: `con talla para ${a.altura} cm` });
  return steps.filter((s) => typeof s.n === "number");
}

/**
 * "Buscando tus bicis": mientras se calculan los resultados, cuenta cómo se estrecha el catálogo con
 * cada respuesta. Las cifras son las del recomendador; no se retrasa la búsqueda para enseñarlas.
 */
export function SearchFunnel({ funnel, answers }: { funnel: Record<string, number> | null; answers: Partial<Answers> }) {
  const steps = funnel ? funnelSteps(funnel, answers) : [];
  const [lit, setLit] = useState(1);
  useEffect(() => {
    if (lit > steps.length) return;
    const t = setTimeout(() => setLit((n) => n + 1), reduced() ? 0 : 260);
    return () => clearTimeout(t);
  }, [lit, steps.length]);
  const top = steps[0]?.n || 1;
  // El botón pulsado desaparece: el foco pasa al título para no perderse
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);

  return (
    <section aria-labelledby="buscando" className="grid gap-3 llegar">
      <h1 id="buscando" ref={heading} tabIndex={-1} className="text-h1 uppercase">Buscando tus bicis…</h1>
      {steps.length > 0 && (
        <ol className="list-none m-0 p-0 border-b border-border" aria-label="Cómo se ha estrechado el catálogo">
          {steps.map((s, i) => (
            <li
              key={s.label}
              className="embudo-paso grid grid-cols-[7ch_minmax(0,1fr)] items-baseline gap-x-3 border-t border-border py-1"
              data-on={i < lit || undefined}
            >
              <span className="font-display text-h3 num text-right leading-tight">
                {i < lit ? <AnimatedCount value={s.n} from={steps[i - 1]?.n} /> : <span aria-hidden="true">—</span>}
              </span>
              <span className="grid gap-1">
                <span>{s.label}</span>
                <span className="embudo-barra block h-0.5 bg-white" aria-hidden="true">
                  <span style={{ width: i < lit ? `${Math.max(1, (s.n / top) * 100)}%` : "100%" }} />
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
      <p className="eyebrow" role="status">
        {lit > steps.length ? "Eligiendo las que mejor te encajan…" : "Aplicando tus respuestas…"}
      </p>
    </section>
  );
}
