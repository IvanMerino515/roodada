"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";

import {
  answersToSearch, availablePriorities, BUDGET, ELECTRIC, HEIGHT, INSEAM, isDetailed, LEVELS, MAX_PRIORITIES, PRIORITIES, USES, usesFor,
  type Answers, type ElectricKey, type LevelKey, type PriorityKey, type UseKey,
} from "@/lib/recommender/questions";

type Counts = {
  funnel: Record<string, number>;
  porUso: Record<UseKey, number>;
  porElectrica: Record<ElectricKey, number> | null;
  desde: number | null;
};

// Orden pedido: primero quién eres, luego eléctrica y presupuesto, y después para qué y tu talla
const STEPS = ["nivel", "electrica", "presupuesto", "uso", "altura", "prioridades"] as const;
type Step = (typeof STEPS)[number];

const eur = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export function Guide() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("nivel");
  const [a, setA] = useState<Partial<Answers>>({ presupuesto: 2500, prioridades: [] });
  const [counts, setCounts] = useState<Counts | null>(null);
  const index = STEPS.indexOf(step);

  // Contador en vivo: cuántas bicis quedan con lo respondido (con pausa para no pedir en cada movimiento del deslizador)
  useEffect(() => {
    const ctrl = new AbortController();
    const p = new URLSearchParams();
    if (a.uso) p.set("uso", a.uso);
    if (a.electrica) p.set("electrica", a.electrica);
    if (a.presupuesto && index >= STEPS.indexOf("presupuesto")) p.set("presupuesto", String(a.presupuesto));
    if (a.altura) p.set("altura", String(a.altura));
    const timer = setTimeout(() => {
      fetch(`/api/contador?${p}`, { signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : null))
        .then((d: Counts | null) => d && setCounts(d))
        .catch(() => {});
    }, 250);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [a.uso, a.electrica, a.presupuesto, a.altura, index]);

  const go = (next: Step) => setStep(next);
  // Las prioridades solo se preguntan al avanzado y al experto, y nunca para una bici infantil
  const detailed = a.nivel ? isDetailed(a.nivel) : false;
  const skipped = (st: Step) => st === "prioridades" && (!detailed || a.uso === "infantil");
  const back = () => {
    let i = index - 1;
    while (i > 0 && skipped(STEPS[i])) i--;
    go(STEPS[i]);
  };
  const choose = (patch: Partial<Answers>, next: Step) => {
    setA((prev) => ({ ...prev, ...patch }));
    go(next);
  };
  const finish = (final: Partial<Answers>) => router.push(`/guia/resultados?${answersToSearch(final as Answers)}`);

  const remaining = counts ? lastCount(counts.funnel) : null;
  const visible = STEPS.filter((st) => !skipped(st));
  const position = visible.indexOf(step);
  const answerOf = (st: Step): string | null => {
    if (st === "uso") return index > STEPS.indexOf("uso") && a.uso ? USES[a.uso].label : null;
    if (st === "electrica") return a.electrica ? ELECTRIC[a.electrica] : null;
    if (st === "presupuesto") return index > STEPS.indexOf("presupuesto") && a.presupuesto ? eur(a.presupuesto) : null;
    if (st === "altura")
      return index > STEPS.indexOf("altura") && a.altura ? `${a.altura} cm${a.entrepierna ? ` · entrepierna ${a.entrepierna} cm` : ""}` : null;
    if (st === "nivel") return a.nivel ? LEVELS[a.nivel].label : null;
    return a.prioridades?.length ? a.prioridades.map((k) => PRIORITIES[k].label).join(", ") : null;
  };

  return (
    <div className="grid-swiss gap-y-4">
      {/* Índice de pasos: en escritorio, columna fija a la izquierda; en móvil, una línea de progreso */}
      <aside className="col-span-4 md:col-span-8 lg:col-span-4 lg:border-r border-border lg:pr-3">
        <div className="flex items-baseline justify-between gap-2 lg:hidden border-b border-border pb-1">
          <p className="eyebrow num">Paso {position + 1} de {visible.length}</p>
          {remaining !== null && (
            <p className="eyebrow num" aria-live="polite">{remaining.toLocaleString("es-ES")} bicis encajan</p>
          )}
        </div>
        <div className="h-0.5 bg-surface lg:hidden" aria-hidden="true">
          <div className="h-full bg-accent transition-[width] motion-reduce:transition-none" style={{ width: `${((position + 1) / visible.length) * 100}%` }} />
        </div>
        <ol className="hidden lg:grid list-none m-0 p-0" aria-label="Pasos de la guía">
          {visible.map((st, i) => {
            const answer = answerOf(st);
            const done = i < position;
            return (
              <li key={st} aria-current={st === step ? "step" : undefined} className="border-t border-border aria-[current=step]:bg-accent aria-[current=step]:text-on-accent">
                {done ? (
                  <button type="button" onClick={() => go(st)} className="w-full text-left grid grid-cols-[auto_1fr] gap-x-2 px-1 py-1 cursor-pointer hover:underline">
                    <StepLabel n={i + 1} title={STEP_TITLES[st]} answer={answer} />
                    <span className="sr-only">(cambiar)</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-[auto_1fr] gap-x-2 px-1 py-1">
                    <StepLabel n={i + 1} title={STEP_TITLES[st]} answer={st === step ? null : answer} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        {remaining !== null && (
          <p className="hidden lg:block border-t border-border pt-2 mt-4" aria-live="polite">
            <span className="block font-display text-display num leading-none">{remaining.toLocaleString("es-ES")}</span>
            <span className="eyebrow">bicis encajan con lo que llevas</span>
          </p>
        )}
      </aside>

      <div className="col-span-4 md:col-span-8 lg:col-span-8 grid gap-3 content-start">
        {step === "nivel" && (
          <Question title="¿Qué tipo de Roodador eres?">
            <p className="text-small">Roodador: bicicletero. Según lo que sepas, te preguntamos más o menos detalle.</p>
            <Options>
              {(Object.keys(LEVELS) as LevelKey[]).map((k, i) => (
                <Option
                  key={k}
                  n={i + 1}
                  selected={a.nivel === k}
                  title={LEVELS[k].label}
                  hint={LEVELS[k].hint}
                  onClick={() =>
                    choose(
                      isDetailed(k)
                        ? { nivel: k, uso: a.uso && usesFor(k).includes(a.uso) ? a.uso : undefined }
                        : { nivel: k, uso: a.uso && usesFor(k).includes(a.uso) ? a.uso : undefined, prioridades: [], entrepierna: undefined },
                      "electrica",
                    )
                  }
                />
              ))}
            </Options>
          </Question>
        )}

        {step === "electrica" && (
          <Question title="¿La quieres eléctrica?">
            <Options>
              {(Object.keys(ELECTRIC) as ElectricKey[]).map((k, i) => (
                <Option
                  key={k}
                  n={i + 1}
                  selected={a.electrica === k}
                  title={ELECTRIC[k]}
                  count={counts?.porElectrica?.[k]}
                  onClick={() => choose({ electrica: k }, "presupuesto")}
                />
              ))}
            </Options>
          </Question>
        )}

        {step === "presupuesto" && (
          <Question title="¿Qué presupuesto tienes?">
            <BudgetInput
              value={a.presupuesto ?? 2500}
              desde={counts?.desde ?? null}
              onChange={(presupuesto) => setA((prev) => ({ ...prev, presupuesto }))}
            />
            <p className="text-small">Solo para la bici: casco, luces y demás van aparte. Incluimos bicis hasta un 10 % por encima, marcadas como tal.</p>
          </Question>
        )}

        {step === "uso" && (
          <Question title="¿Para qué la quieres?">
            <Options>
              {usesFor(a.nivel ?? "novato").map((k, i) => (
                <Option
                  key={k}
                  n={i + 1}
                  selected={a.uso === k}
                  title={USES[k].label}
                  hint={USES[k].hint}
                  count={counts?.porUso[k]}
                  onClick={() => choose({ uso: k }, "altura")}
                />
              ))}
            </Options>
          </Question>
        )}

        {step === "altura" && (
          <Question title={a.uso === "infantil" ? "¿Cuánto mide el niño o la niña?" : "¿Cuánto mides?"}>
            <HeightInput value={a.altura} onChange={(altura) => setA((prev) => ({ ...prev, altura }))} />
            {detailed && a.uso !== "infantil" && (
              <InseamInput value={a.entrepierna} onChange={(entrepierna) => setA((prev) => ({ ...prev, entrepierna }))} />
            )}
          </Question>
        )}

        {step === "prioridades" && a.uso && a.electrica && (
          <Question title="¿Qué es lo más importante para ti?">
            <p className="text-small">Elige hasta {MAX_PRIORITIES}, o ninguna si no lo tienes claro.</p>
            <Options>
              {availablePriorities(a.uso, a.electrica).map((k, i) => {
                const selected = a.prioridades?.includes(k) ?? false;
                const full = (a.prioridades?.length ?? 0) >= MAX_PRIORITIES;
                return (
                  <Option
                    key={k}
                    n={i + 1}
                    selected={selected}
                    disabled={!selected && full}
                    title={PRIORITIES[k].label}
                    hint={PRIORITIES[k].hint}
                    onClick={() =>
                      setA((prev) => ({
                        ...prev,
                        prioridades: selected ? prev.prioridades!.filter((p) => p !== k) : [...(prev.prioridades ?? []), k as PriorityKey],
                      }))
                    }
                  />
                );
              })}
            </Options>
          </Question>
        )}

        {remaining === 0 && index >= STEPS.indexOf("presupuesto") && (
          <div role="alert" className="border border-border p-2">
            <p className="font-display text-h4 uppercase">No queda ninguna bici</p>
            <p className="text-small">
              Prueba a subir el presupuesto{counts?.desde ? ` (la más barata para este uso cuesta ${eur(counts.desde)})` : ""} o
              vuelve un paso atrás.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
          {index > 0 ? (
            <button type="button" className="btn" onClick={back}>
              <span aria-hidden="true">←</span> Atrás
            </button>
          ) : (
            <span />
          )}
          {step === "presupuesto" && (
            <button type="button" className="btn btn-solid" onClick={() => go("uso")}>
              Siguiente <span aria-hidden="true">→</span>
            </button>
          )}
          {step === "altura" &&
            (skipped("prioridades") ? (
              <button type="button" className="btn btn-solid btn-lg" disabled={!a.altura} onClick={() => finish(a)}>
                Ver mis bicis <span aria-hidden="true">→</span>
              </button>
            ) : (
              <button type="button" className="btn btn-solid" disabled={!a.altura} onClick={() => go("prioridades")}>
                Siguiente <span aria-hidden="true">→</span>
              </button>
            ))}
          {step === "prioridades" && (
            <button type="button" className="btn btn-solid btn-lg" onClick={() => finish(a)}>
              Ver mis bicis <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const STEP_TITLES: Record<Step, string> = {
  nivel: "Roodador", electrica: "Eléctrica", presupuesto: "Presupuesto", uso: "Uso", altura: "Altura", prioridades: "Prioridades",
};

const pad = (n: number) => String(n).padStart(2, "0");

function StepLabel({ n, title, answer }: { n: number; title: string; answer: string | null }) {
  return (
    <>
      <span className="eyebrow num">{pad(n)}</span>
      <span>
        <span className="eyebrow block">{title}</span>
        {answer && <span className="block text-small">{answer}</span>}
      </span>
    </>
  );
}

function lastCount(funnel: Record<string, number>) {
  for (const k of ["altura", "uso", "presupuesto", "electrica", "total"]) if (k in funnel) return funnel[k];
  return null;
}

function Question({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-3 border-0 p-0 m-0 min-w-0">
      <legend className="p-0 mb-3">
        <h1 className="text-h1 uppercase">{title}</h1>
      </legend>
      {children}
    </fieldset>
  );
}

function Options({ children }: { children: React.ReactNode }) {
  return <div className="grid border-b border-border">{children}</div>;
}

/** Opción como fila de índice: número, título, explicación y cuántas bicis quedan. */
function Option({
  n, title, hint, count, selected, disabled, onClick,
}: { n: number; title: string; hint?: string; count?: number; selected: boolean; disabled?: boolean; onClick: () => void }) {
  const empty = count === 0;
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={empty || disabled}
      onClick={onClick}
      className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-x-2 gap-y-0.5 text-left border-t border-border px-1 py-2 cursor-pointer hover:bg-surface aria-pressed:bg-accent aria-pressed:text-on-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent -outline-offset-2"
    >
      <span className="eyebrow num">{pad(n)}</span>
      <span className="font-display text-h4 uppercase">{title}</span>
      <span className="eyebrow num text-right">
        {count === undefined ? (selected ? "✓" : "") : empty ? "Sin bicis" : `${count.toLocaleString("es-ES")} bicis`}
      </span>
      {hint && <span className="col-start-2 col-span-2 text-small">{hint}</span>}
    </button>
  );
}

function BudgetInput({ value, desde, onChange }: { value: number; desde: number | null; onChange: (v: number) => void }) {
  const id = useId();
  return (
    <div className="grid gap-2">
      <div className="grid gap-1">
        <label htmlFor={id} className="eyebrow">Presupuesto máximo (€)</label>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={BUDGET.min}
          max={BUDGET.max}
          step={BUDGET.step}
          value={value}
          aria-describedby={desde ? `${id}-hint` : undefined}
          onChange={(e) => onChange(Math.min(BUDGET.max, Math.max(BUDGET.min, Number(e.target.value) || BUDGET.min)))}
          className="input font-display text-display num max-w-50"
        />
        {desde && <p id={`${id}-hint`} className="text-small">Para lo que buscas, la más barata cuesta {eur(desde)}.</p>}
      </div>
      <input
        type="range"
        min={BUDGET.min}
        max={BUDGET.max}
        step={BUDGET.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Presupuesto"
        aria-valuetext={eur(value)}
        className="w-full h-6 cursor-pointer accent-[var(--ds-accent)]"
      />
      <div className="flex justify-between eyebrow num" aria-hidden="true">
        <span>{eur(BUDGET.min)}</span>
        <span>{eur(BUDGET.max)}</span>
      </div>
    </div>
  );
}

function HeightInput({ value, onChange }: { value?: number; onChange: (v: number | undefined) => void }) {
  const id = useId();
  const [raw, setRaw] = useState(value ? String(value) : "");
  const n = Number(raw);
  const invalid = raw !== "" && (!Number.isInteger(n) || n < HEIGHT.min || n > HEIGHT.max);
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="eyebrow">Altura (cm)</label>
      <div className="flex items-baseline gap-2">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={HEIGHT.min}
          max={HEIGHT.max}
          value={raw}
          placeholder="175"
          aria-invalid={invalid}
          aria-describedby={`${id}-hint`}
          autoFocus
          onChange={(e) => {
            setRaw(e.target.value);
            const v = Number(e.target.value);
            onChange(Number.isInteger(v) && v >= HEIGHT.min && v <= HEIGHT.max ? v : undefined);
          }}
          className="input font-display text-display num max-w-30 placeholder:opacity-40"
        />
        <span className="eyebrow" aria-hidden="true">cm</span>
      </div>
      <p id={`${id}-hint`} className={`text-small ${invalid ? "font-bold" : ""}`} role={invalid ? "alert" : undefined}>
        {invalid ? `Escribe una altura entre ${HEIGHT.min} y ${HEIGHT.max} cm.` : "Con ella elegimos la talla de cada bici."}
      </p>
    </div>
  );
}

function InseamInput({ value, onChange }: { value?: number; onChange: (v: number | undefined) => void }) {
  const id = useId();
  const [raw, setRaw] = useState(value ? String(value) : "");
  const n = Number(raw);
  const invalid = raw !== "" && (!Number.isInteger(n) || n < INSEAM.min || n > INSEAM.max);
  return (
    <div className="grid gap-1 border-t border-border pt-2">
      <label htmlFor={id} className="eyebrow">Entrepierna (cm) · opcional</label>
      <div className="flex items-baseline gap-2">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={INSEAM.min}
          max={INSEAM.max}
          value={raw}
          placeholder="80"
          aria-invalid={invalid}
          aria-describedby={`${id}-hint`}
          onChange={(e) => {
            setRaw(e.target.value);
            const v = Number(e.target.value);
            onChange(Number.isInteger(v) && v >= INSEAM.min && v <= INSEAM.max ? v : undefined);
          }}
          className="input font-display text-h2 num max-w-20 placeholder:opacity-40"
        />
        <span className="eyebrow" aria-hidden="true">cm</span>
      </div>
      <p id={`${id}-hint`} className={`text-small ${invalid ? "font-bold" : ""}`} role={invalid ? "alert" : undefined}>
        {invalid
          ? `Escribe una entrepierna entre ${INSEAM.min} y ${INSEAM.max} cm, o déjala vacía.`
          : "Descalzo y de pie contra la pared, del suelo a la entrepierna. Con ella comprobamos que pasas por encima del tubo y afinamos si estás entre dos tallas."}
      </p>
    </div>
  );
}
