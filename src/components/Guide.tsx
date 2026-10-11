"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { Alert, Button, Chip, Cluster, Field, Heading, Input, Stack, Text } from "../../design-system/react";
import {
  answersToSearch, availablePriorities, BUDGET, ELECTRIC, HEIGHT, LEVELS, MAX_PRIORITIES, PRIORITIES, USES,
  type Answers, type ElectricKey, type LevelKey, type PriorityKey, type UseKey,
} from "@/lib/recommender/questions";

type Counts = {
  funnel: Record<string, number>;
  porUso: Record<UseKey, number>;
  porElectrica: Record<ElectricKey, number> | null;
  desde: number | null;
};

const STEPS = ["uso", "electrica", "presupuesto", "altura", "nivel", "prioridades"] as const;
type Step = (typeof STEPS)[number];

const eur = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export function Guide() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("uso");
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
  // En infantil no se pregunta si es eléctrica ni el nivel
  const skipped = (st: Step) => a.uso === "infantil" && (st === "electrica" || st === "nivel");
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

  return (
    <Stack className="max-w-narrow">
      <div className="flex items-center justify-between gap-2">
        <Text size="label" as="p">Paso {index + 1} de {STEPS.length}</Text>
        {remaining !== null && (
          <Text size="small" as="p" aria-live="polite">
            {remaining.toLocaleString("es-ES")} bicis encajan
          </Text>
        )}
      </div>
      <progress className="w-full h-1 accent-[var(--ds-accent)]" max={STEPS.length} value={index + 1} aria-label="Progreso de la guía" />

      {step === "uso" && (
        <Question title="¿Para qué la quieres?">
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(USES) as UseKey[]).map((k) => (
              <Option
                key={k}
                selected={a.uso === k}
                title={USES[k].label}
                hint={USES[k].hint}
                count={counts?.porUso[k]}
                onClick={() => choose({ uso: k, electrica: k === "infantil" ? "no" : a.electrica }, k === "infantil" ? "presupuesto" : "electrica")}
              />
            ))}
          </div>
        </Question>
      )}

      {step === "electrica" && (
        <Question title="¿La quieres eléctrica?">
          <div className="grid gap-2">
            {(Object.keys(ELECTRIC) as ElectricKey[]).map((k) => (
              <Option
                key={k}
                selected={a.electrica === k}
                title={ELECTRIC[k]}
                count={counts?.porElectrica?.[k]}
                onClick={() => choose({ electrica: k }, "presupuesto")}
              />
            ))}
          </div>
        </Question>
      )}

      {step === "presupuesto" && (
        <Question title="¿Cuánto quieres gastar como máximo?">
          <BudgetInput
            value={a.presupuesto ?? 2500}
            desde={counts?.desde ?? null}
            onChange={(presupuesto) => setA((prev) => ({ ...prev, presupuesto }))}
          />
          <Text size="small">Incluimos bicis hasta un 10 % por encima, marcadas como tal.</Text>
        </Question>
      )}

      {step === "altura" && (
        <Question title={a.uso === "infantil" ? "¿Cuánto mide el niño o la niña?" : "¿Cuánto mides?"}>
          <HeightInput value={a.altura} onChange={(altura) => setA((prev) => ({ ...prev, altura }))} />
        </Question>
      )}

      {step === "nivel" && (
        <Question title="¿Cuánto montas?">
          <div className="grid gap-2">
            {(Object.keys(LEVELS) as LevelKey[]).map((k) => (
              <Option key={k} selected={a.nivel === k} title={LEVELS[k].label} hint={LEVELS[k].hint} onClick={() => choose({ nivel: k }, "prioridades")} />
            ))}
          </div>
        </Question>
      )}

      {step === "prioridades" && a.uso && a.electrica && (
        <Question title="¿Qué es lo más importante para ti?">
          <Text size="small">Elige hasta {MAX_PRIORITIES}, o ninguna si no lo tienes claro.</Text>
          <Cluster role="group" aria-label="Prioridades">
            {availablePriorities(a.uso, a.electrica).map((k) => {
              const selected = a.prioridades?.includes(k) ?? false;
              const full = (a.prioridades?.length ?? 0) >= MAX_PRIORITIES;
              return (
                <Chip
                  key={k}
                  selected={selected}
                  disabled={!selected && full}
                  title={PRIORITIES[k].hint}
                  onClick={() =>
                    setA((prev) => ({
                      ...prev,
                      prioridades: selected ? prev.prioridades!.filter((p) => p !== k) : [...(prev.prioridades ?? []), k as PriorityKey],
                    }))
                  }
                >
                  {PRIORITIES[k].label}
                </Chip>
              );
            })}
          </Cluster>
        </Question>
      )}

      {remaining === 0 && index >= STEPS.indexOf("presupuesto") && (
        <Alert tone="warning" title="No queda ninguna bici">
          Prueba a subir el presupuesto{counts?.desde ? ` (la más barata para este uso cuesta ${eur(counts.desde)})` : ""} o vuelve
          un paso atrás.
        </Alert>
      )}

      <Cluster className="justify-between">
        {index > 0 ? (
          <Button variant="ghost" onClick={back}>
            Atrás
          </Button>
        ) : (
          <span />
        )}
        {step === "presupuesto" && <Button onClick={() => go("altura")}>Siguiente</Button>}
        {step === "altura" && (
          <Button disabled={!a.altura} onClick={() => (a.uso === "infantil" ? choose({ nivel: "empiezo" }, "prioridades") : go("nivel"))}>
            Siguiente
          </Button>
        )}
        {step === "prioridades" && <Button onClick={() => finish(a)}>Ver mis bicis</Button>}
      </Cluster>
    </Stack>
  );
}

function lastCount(funnel: Record<string, number>) {
  for (const k of ["altura", "presupuesto", "electrica", "uso", "total"]) if (k in funnel) return funnel[k];
  return null;
}

function Question({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-3 border-0 p-0 m-0">
      <legend className="p-0 mb-2">
        <Heading level={1} size="h2">{title}</Heading>
      </legend>
      {children}
    </fieldset>
  );
}

function Option({ title, hint, count, selected, onClick }: { title: string; hint?: string; count?: number; selected: boolean; onClick: () => void }) {
  const empty = count === 0;
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={empty}
      onClick={onClick}
      className={`ds-card text-left grid gap-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 hover:bg-surface-alt aria-pressed:bg-surface`}
    >
      <span className="text-h4 font-display">{title}</span>
      {hint && <span className="text-small">{hint}</span>}
      {count !== undefined && <span className="text-label">{empty ? "Sin bicis" : `${count.toLocaleString("es-ES")} bicis`}</span>}
    </button>
  );
}

function BudgetInput({ value, desde, onChange }: { value: number; desde: number | null; onChange: (v: number) => void }) {
  const id = useId();
  return (
    <Stack>
      <Field label="Presupuesto (€)" htmlFor={id} hint={desde ? `Para lo que buscas, la más barata cuesta ${eur(desde)}` : undefined}>
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          min={BUDGET.min}
          max={BUDGET.max}
          step={BUDGET.step}
          value={value}
          onChange={(e) => onChange(Math.min(BUDGET.max, Math.max(BUDGET.min, Number(e.target.value) || BUDGET.min)))}
        />
      </Field>
      <input
        type="range"
        min={BUDGET.min}
        max={BUDGET.max}
        step={BUDGET.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Presupuesto"
        className="w-full accent-[var(--ds-accent)]"
      />
      <Text size="label" as="p">Hasta {eur(value)}</Text>
    </Stack>
  );
}

function HeightInput({ value, onChange }: { value?: number; onChange: (v: number | undefined) => void }) {
  const id = useId();
  const [raw, setRaw] = useState(value ? String(value) : "");
  const n = Number(raw);
  const invalid = raw !== "" && (!Number.isInteger(n) || n < HEIGHT.min || n > HEIGHT.max);
  return (
    <Field label="Altura (cm)" htmlFor={id} hint="Con ella elegimos la talla de cada bici" error={invalid ? `Entre ${HEIGHT.min} y ${HEIGHT.max} cm` : undefined}>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={HEIGHT.min}
        max={HEIGHT.max}
        value={raw}
        invalid={invalid}
        autoFocus
        onChange={(e) => {
          setRaw(e.target.value);
          const v = Number(e.target.value);
          onChange(Number.isInteger(v) && v >= HEIGHT.min && v <= HEIGHT.max ? v : undefined);
        }}
      />
    </Field>
  );
}
