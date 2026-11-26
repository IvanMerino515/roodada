import type { Metadata } from "next";
import { FotoBici } from "@/components/FotoBici";
import Link from "next/link";
import { Suspense, ViewTransition } from "react";

import { LinkPending } from "@/components/LinkPending";
import { QualityBadge } from "@/components/QualityBadge";
import { CompareProvider, CompareToggle } from "@/components/Compare";
import { ContentEnter, ResultsSkeleton } from "@/components/Skeletons";
import { TrackEvent } from "@/components/TrackEvent";
import { alturaTramo, presupuestoTramo } from "@/lib/actividad/eventos";
import { getCatalog } from "@/lib/catalog/load";
import { eur, priceLabel } from "@/lib/format";
import { recommend, type Recommendation } from "@/lib/recommender";
import { answersToSearch, ELECTRIC, LEVELS, PRIORITIES, USES, parseAnswers, type Answers } from "@/lib/recommender/questions";

export const metadata: Metadata = {
  title: "Tus bicis recomendadas",
  robots: { index: false }, // cada combinación de respuestas es una URL distinta
};

export default function ResultsPage({ searchParams }: PageProps<"/guia/resultados">) {
  return (
    <Suspense fallback={<ResultsSkeleton />}>
      {searchParams.then((sp) => (
        <ContentEnter>
          <Results params={sp} />
        </ContentEnter>
      ))}
    </Suspense>
  );
}

async function Results({ params }: { params: Record<string, string | string[] | undefined> }) {
  const answers = parseAnswers(params);
  if (!answers) {
    return (
      <div className="wrap grid-swiss py-8">
        <h1 className="col-span-4 md:col-span-6 font-display text-h2">Faltan respuestas</h1>
        <p className="col-span-4 md:col-span-6 mt-2">
          No hemos podido leer tus respuestas. <Link href="/guia" className="link">Vuelve a la guía</Link>.
        </p>
      </div>
    );
  }

  const { results, matched } = recommend(await getCatalog(), answers);
  const shown = results.length;
  const query = answersToSearch(answers);

  return (
    <>
      {/* Presupuesto y altura en tramos, nunca la cifra exacta */}
      <TrackEvent
        key={query}
        nombre="resultados_mostrados"
        datos={{
          bicis: results.map((r) => r.bike.id),
          encajan: matched,
          nivel: answers.nivel,
          electrica: answers.electrica,
          uso: answers.uso,
          presupuesto: presupuestoTramo(answers.presupuesto),
          altura: alturaTramo(answers.altura),
          prioridades: answers.prioridades,
        }}
      />
      <div className="wrap grid-swiss gap-y-2 pt-4 pb-3 items-end">
        <h1 className="col-span-4 md:col-span-5 lg:col-span-8 text-display uppercase">
          {shown ? <>Tus {shown === 1 ? "bici" : <><span className="num">{shown}</span> bicis</>}</> : "Sin resultados"}
        </h1>
        <p className="col-span-4 md:col-span-3 lg:col-span-4 text-small">
          {matched > shown
            ? `De ${matched} bicis que encajan contigo, estas son las ${shown} que mejor cumplen lo que nos has contado.`
            : `${matched} ${matched === 1 ? "bici encaja" : "bicis encajan"} con tus respuestas.`}{" "}
          Cada una con lo bueno y lo malo frente a las demás.
        </p>
      </div>

      <Summary answers={answers} />

      {shown === 0 ? (
        <div className="wrap grid-swiss py-8">
          <p className="col-span-4 md:col-span-6 font-display text-h2">Ninguna bici encaja con todo.</p>
          <p className="col-span-4 md:col-span-6 mt-2">
            Prueba a subir el presupuesto, a cambiar si la quieres eléctrica o a revisar tu altura.{" "}
            <Link href="/guia" className="link">Cambiar respuestas</Link>
          </p>
        </div>
      ) : (
        <CompareProvider>
          <ol className="wrap list-none my-0 py-2 grid grid-cols-[minmax(0,1fr)] gap-2">
            {results.map((r, i) => (
              // Llegan una tras otra: 80 ms entre cada una
              <li key={r.bike.id} className="llegar" style={{ animationDelay: `${i * 80}ms` }}>
                <Pick r={r} n={i + 1} href={`/bici/${r.bike.slug}?${query}`} top={i === 0} />
              </li>
            ))}
          </ol>
        </CompareProvider>
      )}
    </>
  );
}

/** Una recomendación: número, foto, datos y acciones, y a favor / en contra. La primera, en color. */
function Pick({ r, n, href, top }: { r: Recommendation; n: number; href: string; top: boolean }) {
  const name = `${r.bike.brand} ${r.bike.name}`;
  return (
    <article className={`casilla grid lg:grid-cols-12 border border-border ${top ? "bg-choice text-on-choice" : "bg-white"}`} aria-labelledby={`pick-${r.bike.id}`}>
      <div className="lg:col-span-4 grid grid-cols-[auto_1fr] border-b lg:border-b-0 lg:border-r border-border">
        <p className="font-display text-h1 num leading-none p-2 border-r border-border" aria-hidden="true">{String(n).padStart(2, "0")}</p>
        <Link href={href} tabIndex={-1} aria-hidden="true" className="bg-white flex items-center justify-center p-2">
          <ViewTransition name={`foto-${r.bike.id}`} share="foto-bici" default="none">
            <FotoBici src={r.bike.imageUrl} bici={r.bike.id} alt="" width={600} height={400} sizes="(min-width: 1024px) 25vw, 80vw" className="product w-full h-auto object-contain" preload={n <= 2} />
          </ViewTransition>
        </Link>
      </div>

      <div className="lg:col-span-4 p-2 md:p-3 grid gap-2 content-start border-b lg:border-b-0 lg:border-r border-border">
        <p className="eyebrow">{top ? `La que más encaja · ${r.score}/100` : `Encaje ${r.score}/100`}</p>
        <h2 id={`pick-${r.bike.id}`} className="font-display text-h3 uppercase leading-tight">
          <span className="block eyebrow normal-case">{r.bike.brand}</span>
          {r.bike.name}
        </h2>
        <p className="flex items-baseline justify-between gap-2 border-t border-border pt-1">
          <span className="font-display text-h3 num">{priceLabel(r.bike)}</span>
          <QualityBadge bike={r.bike} />
        </p>
        <div className="grid gap-1">
          <Link href={href} className="btn btn-solid w-full relative">
            Por qué es para ti <span aria-hidden="true">→</span>
            <LinkPending />
          </Link>
          <a href={`/ir/${r.bike.slug}`} rel="sponsored nofollow noopener" target="_blank" className="btn w-full">
            Web oficial de {r.bike.brand} <span aria-hidden="true">↗</span>
            <span className="sr-only">(se abre en otra pestaña)</span>
          </a>
          <div className="border border-border w-fit">
            <CompareToggle slug={r.bike.slug} name={name} />
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 p-2 md:p-3 grid gap-3 content-start text-small">
        <section aria-label={`A favor de ${name}`}>
          <h3 className="eyebrow mb-1">A favor</h3>
          <ul className="grid gap-1 list-none m-0 p-0">
            {r.pros.map((p) => (
              <li key={p} className="grid grid-cols-[auto_1fr] gap-1"><span aria-hidden="true">+</span>{p}</li>
            ))}
          </ul>
        </section>
        {r.cons.length > 0 && (
          <section aria-label={`En contra de ${name}`}>
            <h3 className="eyebrow mb-1">En contra</h3>
            <ul className="grid gap-1 list-none m-0 p-0">
              {r.cons.map((c) => (
                <li key={c} className="grid grid-cols-[auto_1fr] gap-1"><span aria-hidden="true">−</span>{c}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}

/** Tus respuestas, como la barra de filtros del catálogo. */
function Summary({ answers: a }: { answers: Answers }) {
  // [etiqueta, valor, valor que se entiende sin etiqueta (la línea de móvil)]
  type Item = [string, string, string?];
  const items: Item[] = [
    ["Roodador", LEVELS[a.nivel].label.replace("Roodador ", ""), LEVELS[a.nivel].label],
    ...(a.uso === "infantil" ? [] : [["Eléctrica", ELECTRIC[a.electrica], MOBILE_ELECTRIC[a.electrica]] as Item]),
    ["Hasta", eur(a.presupuesto * 100), `Hasta ${eur(a.presupuesto * 100)}`],
    ["Uso", USES[a.uso].label],
    ["Altura", `${a.altura} cm`, `Mides ${a.altura} cm`],
    ...(a.entrepierna ? [["Entrepierna", `${a.entrepierna} cm`, `entrepierna ${a.entrepierna} cm`] as Item] : []),
    ...(a.prioridades.length ? [["Prioridad", a.prioridades.map((p) => PRIORITIES[p].label).join(", ")] as Item] : []),
  ];
  // En móvil, una línea de valores ("Novato · 1.500 € · Ciudad…") para no empujar las bicis bajo el pliegue;
  // desde lg, la barra con etiqueta y valor como la de filtros del catálogo
  return (
    <div className="border-y border-border flex items-stretch">
      <dl className="flex-1 flex flex-wrap items-center gap-x-1 px-2 py-1 m-0 lg:flex-nowrap lg:gap-0 lg:p-0">
        {items.map(([k, v, alone], i) => (
          <div key={k} className="flex items-center gap-1 lg:min-h-6 lg:px-2 lg:border-r border-border">
            <dt className="eyebrow sr-only lg:not-sr-only">{k}:</dt>
            <dd className="m-0 eyebrow">
              <span className="lg:hidden">{alone ?? v}</span>
              <span className="hidden lg:inline">{v}</span>
              {i < items.length - 1 && <span aria-hidden="true" className="lg:hidden"> ·</span>}
            </dd>
          </div>
        ))}
      </dl>
      <Link href="/guia" className="eyebrow flex items-center justify-center text-center min-h-6 px-2 bg-accent text-on-accent hover:underline">
        Cambiar<span className="sr-only lg:not-sr-only">&nbsp;respuestas</span>
      </Link>
    </div>
  );
}

const MOBILE_ELECTRIC: Record<keyof typeof ELECTRIC, string> = { si: "Eléctrica", no: "Sin motor", igual: "Eléctrica o no" };
