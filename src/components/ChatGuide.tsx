"use client";

// Guía conversacional (prueba): el asistente «Radio» pregunta en abierto, apunta lo que entiende y, al final,
// trae las bicis reales del catálogo (/api/recomendar, el mismo recomendador que /guia/resultados) y explica
// por qué encaja cada una con lo que la persona ha contado. Sin IA: src/lib/chat/.
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { eur, LEVEL_LABEL, slotPhrase } from "@/lib/chat/advice";
import { DEMOS } from "@/lib/chat/demos";
import { counterQuery, NEEDS_SUGGESTIONS, reply, required, stages, start, toAnswers } from "@/lib/chat/engine";
import type { BotMessage, ChatPick, ChatState, FinalRec, Level, Message, SlotKey, Slots, SummaryItem } from "@/lib/chat/types";
import { picksIntro, whyForYou } from "@/lib/chat/why";
import { answersToSearch } from "@/lib/recommender/questions";

/** Pausa antes de cada mensaje del asistente: da ritmo de conversación. Sin pausa si se pide menos movimiento. */
const TYPING_MS = 550;

const SLOT_LABEL: Record<SlotKey, string> = {
  nivel: "Perfil", uso: "Uso", presupuesto: "Presupuesto", electrica: "Eléctrica", duracion: "Salidas", altura: "Altura",
  material: "Cuadro", cambio: "Cambio", usoConcreto: "Uso concreto", desarrollo: "Desarrollos", peso: "Peso", necesidades: "Lo que necesitas",
};

type Picks = { status: "ok" | "error"; picks: ChatPick[]; matched: number; slots: Slots };

const reduceMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ChatGuide() {
  // El saludo sale ya pintado; lo siguiente llega con el indicador de «escribiendo»
  const [initial] = useState(start);
  const [state, setState] = useState<ChatState>(initial.state);
  const [messages, setMessages] = useState<Message[]>(initial.messages);
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState("");
  const [script, setScript] = useState<string[]>([]);
  const [fresh, setFresh] = useState<(keyof Slots)[]>([]);
  const [picks, setPicks] = useState<Record<string, Picks>>({});
  const [counterData, setCounterData] = useState<{ query: string; n: number; desde: number | null } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const logRef = useRef<HTMLOListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const listId = useId();

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  /** Bicis reales del catálogo para una recomendación final (`key` la identifica). Sin entrada = cargando. */
  const fetchPicks = useCallback((key: string, slots: Slots) => {
    const a = toAnswers(slots);
    if (!a) return;
    fetch(`/api/recomendar?${answersToSearch(a)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: { picks: ChatPick[]; matched: number }) =>
        setPicks((prev) => ({ ...prev, [key]: { status: "ok", picks: d.picks, matched: d.matched, slots } })),
      )
      .catch(() => setPicks((prev) => ({ ...prev, [key]: { status: "error", picks: [], matched: 0, slots } })));
  }, []);

  /** Añade los mensajes del asistente de uno en uno, con indicador de «escribiendo». */
  const deliver = useCallback(
    (bot: BotMessage[], slots: Slots) => {
      const wait = reduceMotion() ? 0 : TYPING_MS;
      setTyping(true);
      bot.forEach((m, i) => {
        timers.current.push(
          setTimeout(() => {
            if (m.fetchPicks) {
              const key = `${Date.now()}-${i}`;
              setMessages((prev) => [...prev, { ...m, picksKey: key, picksSlots: slots }]);
              fetchPicks(key, slots);
            } else setMessages((prev) => [...prev, m]);
            if (i === bot.length - 1) setTyping(false);
          }, wait * (i + 1)),
        );
      });
    },
    [fetchPicks],
  );

  const reset = useCallback(() => {
    clearTimers();
    const s = start();
    setState(s.state);
    setMessages(s.messages);
    setScript([]);
    setText("");
    setFresh([]);
    setPicks({});
    setTyping(false);
  }, []);

  const send = useCallback(
    (raw: string) => {
      const value = raw.trim();
      if (!value || typing) return;
      setMessages((prev) => [...prev, { role: "user", text: value }]);
      setText("");
      const r = reply(state, value);
      setState(r.state);
      setFresh(r.changed);
      deliver(r.messages, r.state.slots);
    },
    [state, typing, deliver],
  );

  // Conversación de ejemplo: manda el siguiente mensaje cuando el asistente termina de contestar
  useEffect(() => {
    if (typing || script.length === 0) return;
    const t = setTimeout(() => {
      send(script[0]);
      setScript((s) => s.slice(1));
    }, 800);
    return () => clearTimeout(t);
  }, [typing, script, send]);

  // Siempre a la vista lo último
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduceMotion() ? "auto" : "smooth" });
  }, [messages, typing, picks]);

  // Contador en vivo: cuántas bicis del catálogo encajan con lo que ya se sabe
  const query = counterQuery(state.slots);
  useEffect(() => {
    if (!query) return;
    const ctrl = new AbortController();
    fetch(`/api/contador?${query}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { funnel: Record<string, number>; desde: number | null } | null) => {
        if (!d) return;
        const n = ["altura", "uso", "presupuesto", "electrica", "total"].map((k) => d.funnel[k]).find((v) => v !== undefined);
        if (n !== undefined) setCounterData({ query, n, desde: d.desde });
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [query]);
  const counter = query && counterData?.query === query ? counterData : null;

  const lastBot = [...messages].reverse().find((m): m is BotMessage => m.role === "bot");
  const chips = !typing && messages.at(-1)?.role === "bot" && script.length === 0 ? lastBot?.chips : undefined;
  const autocomplete = !!lastBot?.autocomplete && state.pending.includes("necesidades");
  const route = stages(state.slots, state.phase);
  const playDemo = (level: Level) => {
    reset();
    setScript(DEMOS[level].messages);
  };

  return (
    <div className="grid-swiss gap-y-3">
      <header className="col-span-4 md:col-span-8 lg:col-span-12 grid gap-1 lg:grid-cols-12 lg:gap-x-3 items-end">
        <div className="lg:col-span-8 grid gap-1">
          <p className="eyebrow">Guía conversacional · prueba</p>
          <h1 className="text-display uppercase leading-none">Habla con Radio</h1>
        </div>
        <p className="lg:col-span-4 text-small">
          Cuéntale cómo montas, como se lo contarías a un amigo de la tienda. Te pregunta lo justo y al final te enseña
          bicis reales y por qué te encajan. <Link href="/guia" className="link">Prefiero la guía de preguntas</Link>
        </p>
      </header>

      <section aria-label="Chat con Radio" className="col-span-4 md:col-span-8 lg:col-span-8 border border-border bg-white flex flex-col min-w-0">
        <Route route={route} counter={counter?.n ?? null} />

        <ol ref={logRef} role="log" aria-live="polite" aria-label="Conversación" className="list-none m-0 p-2 md:p-3 grid gap-2 content-start overflow-y-auto min-h-50 max-h-[min(68dvh,820px)]">
          {messages.map((m, i) => (
            <li key={i} className={`chat-in ${m.role === "user" ? "flex justify-end" : "grid gap-1"}`}>
              {m.role === "user" ? (
                <p className="bg-choice text-on-choice px-2 py-1 max-w-70">
                  <span className="sr-only">Tú: </span>
                  {m.text}
                </p>
              ) : (
                <Bot
                  m={m}
                  showName={messages[i - 1]?.role !== "bot"}
                  picks={m.picksKey ? picks[m.picksKey] : undefined}
                  onReset={reset}
                  onRetry={() => {
                    if (!m.picksKey || !m.picksSlots) return;
                    const key = m.picksKey;
                    setPicks((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== key)));
                    fetchPicks(key, m.picksSlots);
                  }}
                />
              )}
            </li>
          ))}
          {typing && (
            <li className="flex items-center gap-1" aria-label="Radio está escribiendo">
              <span className="eyebrow mr-1">Radio</span>
              {[0, 1, 2].map((d) => <span key={d} className="chat-dot block w-1 h-1 bg-accent" aria-hidden="true" />)}
            </li>
          )}
        </ol>

        <div className="border-t border-border p-2 md:px-3 grid gap-2 bg-bg">
          {chips && chips.length > 0 && (
            <div role="group" aria-label="Ejemplos de respuesta (también puedes escribir la tuya)" className="chat-in flex flex-wrap gap-1">
              {chips.map((c) => (
                <button key={c} type="button" className="btn px-2 bg-white" onClick={() => { send(c); inputRef.current?.focus(); }}>
                  {c}
                </button>
              ))}
            </div>
          )}
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(text);
            }}
          >
            <div className="grid flex-1 min-w-0">
              <label htmlFor={inputId} className="eyebrow">
                {autocomplete ? "Escribe lo que necesites (con sugerencias)" : "Tu respuesta, con tus palabras"}
              </label>
              <input
                ref={inputRef}
                id={inputId}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                list={autocomplete ? listId : undefined}
                autoComplete="off"
                enterKeyHint="send"
                maxLength={500}
                placeholder={autocomplete ? "Potenciómetro, tubeless…" : "Ej.: quiero salir por caminos los findes, unos 1.200 €"}
                className="input text-body placeholder:text-text-muted"
              />
              {autocomplete && (
                <datalist id={listId}>
                  {NEEDS_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
                </datalist>
              )}
            </div>
            <button type="submit" className="btn btn-solid" disabled={typing || !text.trim()}>
              Enviar <span aria-hidden="true">→</span>
            </button>
          </form>
        </div>
      </section>

      <aside aria-label="Lo que he entendido" className="col-span-4 md:col-span-8 lg:col-span-4 grid gap-3 content-start lg:sticky lg:top-10">
        <Ficha slots={state.slots} fresh={fresh} />
        {counter && (
          <div className="border border-border bg-surface p-2 grid gap-1">
            <p className="eyebrow">Bicis del catálogo que encajan</p>
            <Ticker value={counter.n} />
            {counter.desde !== null && state.slots.presupuesto !== undefined && counter.desde > state.slots.presupuesto ? (
              <p className="text-small">Para lo que buscas, la más barata cuesta {eur(counter.desde)}: sube un poco el presupuesto.</p>
            ) : (
              <p className="text-small">Bajan con cada cosa que me cuentas.</p>
            )}
          </div>
        )}
        <div className="border-t border-border pt-2 grid gap-1">
          <p className="eyebrow">Probar con un ejemplo</p>
          <div className="flex flex-wrap gap-1">
            {(Object.keys(DEMOS) as Level[]).map((l) => (
              <button key={l} type="button" className="btn px-2" onClick={() => playDemo(l)} title={DEMOS[l].title}>
                {LEVEL_LABEL[l].replace("Roodador ", "")}
              </button>
            ))}
          </div>
          <button type="button" className="link text-small text-left w-fit min-h-6 cursor-pointer bg-transparent border-0 p-0" onClick={reset}>
            Empezar de nuevo
          </button>
        </div>
      </aside>
    </div>
  );
}

/** Perfil de etapa: dónde va la conversación, y el contador en pequeño (en móvil el panel queda abajo). */
function Route({ route, counter }: { route: ReturnType<typeof stages>; counter: number | null }) {
  const done = route.filter((r) => r.done).length;
  return (
    <div className="border-b border-border">
      <div className="flex items-baseline justify-between gap-2 px-2 md:px-3 pt-1">
        <p className="eyebrow num" aria-live="polite">
          Etapa {Math.min(done + 1, route.length)} de {route.length} · {route.find((r) => r.current)?.name ?? "Meta"}
        </p>
        {counter !== null && <p className="eyebrow num lg:hidden">{counter.toLocaleString("es-ES")} bicis</p>}
      </div>
      <ol className="list-none m-0 p-0 flex" aria-hidden="true">
        {route.map((r) => (
          <li key={r.name} className="flex-1 grid gap-0.5 px-0.5 pt-1 pb-1 first:pl-2 md:first:pl-3 last:pr-2 md:last:pr-3">
            <span className={`block h-0.5 transition-colors motion-reduce:transition-none ${r.done ? "bg-choice" : r.current ? "bg-accent" : "bg-border"}`} />
            <span className={`hidden md:block eyebrow truncate ${r.current ? "" : "text-text-muted"}`}>{r.name}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Número que cuenta hacia el nuevo valor (sin animación si se pide menos movimiento). */
function Ticker({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (reduceMotion()) {
      from.current = value;
      const t = setTimeout(() => setShown(value), 0);
      return () => clearTimeout(t);
    }
    const start = from.current;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 700);
      // A saltos, como el resto: 8 pasos
      const v = Math.round(start + (value - start) * (Math.floor(k * 8) / 8));
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <p className="font-display text-display num leading-none" aria-live="polite">
      {shown.toLocaleString("es-ES")}
    </p>
  );
}

/** Mensaje del asistente: texto, glosario y consejo en casillas aparte, y al final las bicis. */
function Bot({ m, showName, picks, onReset, onRetry }: { m: BotMessage; showName: boolean; picks?: Picks; onReset: () => void; onRetry: () => void }) {
  return (
    <div className="grid gap-1 max-w-80 w-full">
      {showName && <p className="eyebrow" aria-hidden="true">Radio</p>}
      {m.paragraphs.length > 0 && (
        <div className="border border-border bg-bg px-2 py-1 grid gap-1 w-fit max-w-full">
          <span className="sr-only">Radio: </span>
          {m.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          {m.summary && <Rows items={m.summary} />}
        </div>
      )}
      {m.term && (
        <div className="border border-border bg-white px-2 py-1 grid gap-0.5 w-fit max-w-full">
          <p className="eyebrow">Glosario · {m.term.word}</p>
          <p className="text-small">{m.term.text}</p>
        </div>
      )}
      {m.tip && (
        <div className="bg-surface px-2 py-1 grid gap-0.5 w-fit max-w-full">
          <p className="eyebrow">Consejo de Radio</p>
          <p className="text-small">{m.tip}</p>
        </div>
      )}
      {m.final && <Results final={m.final} slots={m.picksSlots} picks={picks} onReset={onReset} onRetry={onRetry} />}
    </div>
  );
}

function Rows({ items }: { items: SummaryItem[] }) {
  return (
    <dl className="grid m-0 border-t border-border">
      {items.map((it) => (
        <div key={it.label} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-2 border-b border-border py-1">
          <dt className="eyebrow">{it.label}</dt>
          <dd className="m-0 text-small">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** La recomendación: bicis reales (la mejor primero y en grande) y, aparte, qué mirar si buscas en otras tiendas. */
function Results({ final, slots, picks, onReset, onRetry }: { final: FinalRec; slots?: Slots; picks?: Picks; onReset: () => void; onRetry: () => void }) {
  const a = slots ? toAnswers(slots) : null;
  const query = a ? answersToSearch(a) : "";
  return (
    <div className="grid gap-2 w-full">
      {!picks && (
        <p className="eyebrow flex items-center gap-1">
          Buscando en el catálogo
          {[0, 1, 2].map((d) => <span key={d} className="chat-dot block w-1 h-1 bg-accent" aria-hidden="true" />)}
        </p>
      )}
      {picks?.status === "error" && (
        <div className="border border-border p-2 grid gap-1">
          <p>No he podido traer las bicis del catálogo ahora mismo.</p>
          <button type="button" className="btn w-fit" onClick={onRetry}>Reintentar</button>
        </div>
      )}
      {picks?.status === "ok" && picks.picks.length === 0 && (
        <div className="border border-border p-2 grid gap-1">
          <p className="font-display text-h4 uppercase">Ninguna bici encaja con todo</p>
          <p className="text-small">Prueba a decirme otro presupuesto («mejor hasta 1.500 €») o a cambiar si la quieres eléctrica.</p>
        </div>
      )}
      {picks?.status === "ok" && picks.picks.length > 0 && slots && (
        <>
          <div className="border border-border bg-bg px-2 py-1 w-fit max-w-full chat-in">
            <p>{picksIntro(picks.picks, picks.matched, slots)}</p>
          </div>
          <ol className="list-none m-0 p-0 grid gap-2">
            {picks.picks.map((p, i) => (
              <li key={p.slug} className="chat-in" style={{ animationDelay: `calc(var(--ds-duration-slow) * ${i})` }}>
                <PickCard p={p} rank={i} all={picks.picks} slots={slots} query={query} />
              </li>
            ))}
          </ol>
        </>
      )}

      <details className="border border-border bg-white group">
        <summary className="cursor-pointer list-none flex items-center justify-between gap-2 px-2 min-h-6 eyebrow">
          Qué buscar si miras en otras tiendas
          <span aria-hidden="true" className="group-open:rotate-45 transition-transform motion-reduce:transition-none">+</span>
        </summary>
        <div className="grid">
          <section className="p-2 grid gap-1 border-t border-border bg-choice text-on-choice">
            <h3 className="eyebrow">Tipo de bici</h3>
            <p className="font-display text-h4 uppercase leading-tight">{final.tipo.nombre}</p>
            <p className="text-small">{final.tipo.porque}</p>
          </section>
          <section className="p-2 grid gap-1 border-t border-border">
            <h3 className="eyebrow">Características clave (orientativas)</h3>
            <Rows items={final.caracteristicas} />
          </section>
          <section className="p-2 grid gap-1 border-t border-border">
            <h3 className="eyebrow">Según presupuesto</h3>
            <ul className="list-none m-0 p-0 grid">
              {final.alternativas.map((x) => (
                <li key={x.titulo} className="grid gap-0.5 border-t border-border py-1 first:border-t-0">
                  <p className="flex justify-between gap-2"><span className="eyebrow">{x.titulo}</span><span className="eyebrow num">{x.precio}</span></p>
                  <p className="text-small">{x.texto}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </details>

      <div className="border border-border bg-white p-2 grid gap-2">
        <div className="grid gap-1">
          <p className="eyebrow">Antes de comprar, confirma</p>
          <ul className="m-0 pl-2 grid gap-0.5 text-small">
            {final.pendientes.map((x) => <li key={x}>{x}</li>)}
          </ul>
        </div>
        <p className="bg-surface px-2 py-1"><span className="eyebrow">Consejo de Radio · </span>{final.consejo}</p>
        <div className="flex flex-wrap gap-1">
          {query && (
            <Link href={`/guia/resultados?${query}`} className="btn btn-solid">
              Ver todas en el catálogo <span aria-hidden="true">→</span>
            </Link>
          )}
          <button type="button" className="btn" onClick={onReset}>Empezar de nuevo</button>
        </div>
        <p className="text-small">¿Quieres afinar? Escríbeme abajo, por ejemplo «mejor hasta 2.000 €» o «mido 1,80».</p>
      </div>
    </div>
  );
}

/** Una bici: la primera, en coral (lo que más te encaja) y con todo; las demás, más compactas. */
function PickCard({ p, rank, all, slots, query }: { p: ChatPick; rank: number; all: ChatPick[]; slots: Slots; query: string }) {
  const w = whyForYou(p, slots, rank, all);
  const top = rank === 0;
  const name = `${p.brand} ${p.name}`;
  return (
    <article aria-labelledby={`pick-${p.slug}`} className={`border border-border grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] ${top ? "bg-choice text-on-choice" : "bg-white"}`}>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] border-b md:border-b-0 md:border-r border-border">
        <p className="font-display text-h2 num leading-none p-1 border-r border-border" aria-hidden="true">{String(rank + 1).padStart(2, "0")}</p>
        <Link href={`/bici/${p.slug}?${query}`} tabIndex={-1} aria-hidden="true" className="bg-white flex items-center justify-center p-1">
          <Image src={p.imageUrl} alt="" width={480} height={320} sizes="(min-width: 1024px) 22vw, 80vw" className="product w-full h-auto object-contain" />
        </Link>
      </div>
      <div className="p-2 grid gap-1 content-start min-w-0">
        <p className="eyebrow">{w.headline} · encaje {p.score}/100</p>
        <h3 id={`pick-${p.slug}`} className="font-display text-h4 uppercase leading-tight">
          <span className="block eyebrow normal-case">{p.brand}</span>
          {p.name}
        </h3>
        <p className="flex flex-wrap items-baseline gap-x-2 border-t border-border pt-1">
          <span className="font-display text-h4 num">{eur(Math.round(p.priceCents / 100))}</span>
          {p.size.fit !== "entre" && <span className="eyebrow">Tu talla: {p.size.label}</span>}
        </p>
        <section aria-label={`Por qué te encaja la ${name}`} className="grid gap-0.5">
          <h4 className="eyebrow">Por qué te encaja</h4>
          <ul className="list-none m-0 p-0 grid gap-0.5 text-small">
            {(top ? w.reasons : w.reasons.slice(0, 3)).map((r) => (
              <li key={r} className="grid grid-cols-[auto_1fr] gap-1"><span aria-hidden="true">+</span>{r}</li>
            ))}
          </ul>
        </section>
        {w.watch.length > 0 && (
          <section aria-label={`Qué mirar de la ${name}`} className="grid gap-0.5">
            <h4 className="eyebrow">Ojo con</h4>
            <ul className="list-none m-0 p-0 grid gap-0.5 text-small">
              {(top ? w.watch : w.watch.slice(0, 2)).map((r) => (
                <li key={r} className="grid grid-cols-[auto_1fr] gap-1"><span aria-hidden="true">−</span>{r}</li>
              ))}
            </ul>
          </section>
        )}
        <div className="flex flex-wrap gap-1 pt-1">
          <Link href={`/bici/${p.slug}?${query}`} className={`btn ${top ? "btn-solid" : ""}`}>
            Ver ficha <span aria-hidden="true">→</span>
          </Link>
          <a href={`/ir/${p.slug}`} rel="nofollow noopener" target="_blank" className="btn">
            Web de {p.brand} <span aria-hidden="true">↗</span>
            <span className="sr-only">(se abre en otra pestaña)</span>
          </a>
        </div>
      </div>
    </article>
  );
}

/** Panel lateral: la ficha que se va rellenando, como la etiqueta de producto de la web. */
function Ficha({ slots, fresh }: { slots: Slots; fresh: (keyof Slots)[] }) {
  const keys = required(slots).filter((k) => k !== "nivel");
  const done = keys.filter((k) => slots[k] !== undefined).length;
  return (
    <section className="border border-border bg-white">
      <h2 className="eyebrow flex justify-between gap-2 px-2 py-1 border-b border-border bg-accent text-on-accent">
        <span>Tu ficha</span>
        {slots.nivel && <span className="num">{done}/{keys.length}</span>}
      </h2>
      <dl className="grid m-0 px-2">
        <Row label="Perfil" value={slots.nivel ? LEVEL_LABEL[slots.nivel] : null} flash={fresh.includes("nivel")} />
        {slots.nivel && keys.map((k) => <Row key={k} label={SLOT_LABEL[k]} value={valueOf(slots, k)} flash={fresh.includes(k)} />)}
      </dl>
      {!slots.nivel && <p className="text-small px-2 pb-2">Según cómo te definas, te preguntaré más o menos detalle.</p>}
    </section>
  );
}

function valueOf(s: Slots, k: SlotKey): string | null {
  if (k === "uso" && !s.uso && s.usoDuda) return "lo vemos juntos";
  const p = slotPhrase(s, k);
  return p ? p.replace(/^(unos |mides |mide )/, "") : null;
}

function Row({ label, value, flash }: { label: string; value: string | null; flash: boolean }) {
  return (
    <div className={`grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-2 border-b border-border last:border-b-0 py-1 ${flash && value ? "chat-flash" : ""}`}>
      <dt className="eyebrow">{label}</dt>
      <dd className={`m-0 text-small ${value ? "" : "text-text-muted"}`}>
        {value ?? <><span aria-hidden="true">—</span><span className="sr-only">pendiente</span></>}
      </dd>
    </div>
  );
}
