import Link from "next/link";

import { getCatalog } from "@/lib/catalog/load";
import type { Bike } from "@/lib/catalog/types";
import { recommend } from "@/lib/recommender";
import { answersToSearch, parseAnswers } from "@/lib/recommender/questions";

/**
 * "Por qué es para ti": solo cuando se llega desde los resultados de la guía (las respuestas viajan en la URL).
 * Se recalcula la recomendación para comparar esta bici con las demás que le salieron.
 */
export async function WhyForYou({ bike, searchParams }: { bike: Bike; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const answers = parseAnswers(await searchParams);
  if (!answers) return null;
  const { results } = recommend(await getCatalog(), answers);
  const index = results.findIndex((r) => r.bike.id === bike.id);
  if (index === -1) return null;
  const r = results[index];
  const back = `/guia/resultados?${answersToSearch(answers)}`;

  return (
    <section aria-labelledby="para-ti" className="border border-border bg-white">
      {/* Cabecera en coral (lo tuyo); el texto largo, sobre blanco, que se lee mejor */}
      <header className="bg-choice text-on-choice flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-2 py-2 border-b border-border">
        <h2 id="para-ti" className="font-display text-h2 uppercase leading-none">Por qué es para ti</h2>
        <p className="eyebrow num">
          {index === 0 ? "La que más encaja" : `Recomendación ${index + 1} de ${results.length}`} · Encaje {r.score}/100
        </p>
      </header>
      <div className="lg:grid lg:grid-cols-12">
        <div className="lg:col-span-7 p-2 md:p-3 grid gap-2 content-start lg:border-r border-border">
          {/* El primer párrafo a la vista y el resto plegado: así la bici no queda debajo de un muro de texto */}
          {r.story[0] && <p>{r.story[0]}</p>}
          {r.story.length > 1 && (
            <details className="group">
              <summary className="eyebrow inline-flex items-center gap-1 min-h-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="link group-open:hidden">Leer la explicación completa</span>
                <span className="link hidden group-open:inline">Plegar la explicación</span>
                <span aria-hidden="true" className="inline-block group-open:rotate-45 transition-transform motion-reduce:transition-none">+</span>
              </summary>
              <div className="grid gap-2 mt-1">
                {r.story.slice(1).map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </details>
          )}
        </div>
        <div className="lg:col-span-5 p-2 md:p-3 grid gap-3 content-start text-small border-t lg:border-t-0 border-border">
          <div>
            <h3 className="eyebrow mb-1">A favor</h3>
            <ul className="grid gap-1 list-none m-0 p-0">
              {r.pros.map((p) => (
                <li key={p} className="grid grid-cols-[auto_1fr] gap-1"><span aria-hidden="true">+</span>{p}</li>
              ))}
            </ul>
          </div>
          {r.cons.length > 0 && (
            <div>
              <h3 className="eyebrow mb-1">En contra</h3>
              <ul className="grid gap-1 list-none m-0 p-0">
                {r.cons.map((c) => (
                  <li key={c} className="grid grid-cols-[auto_1fr] gap-1"><span aria-hidden="true">−</span>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <footer className="border-t border-border px-2 py-1">
        <Link href={back} className="eyebrow link inline-flex items-center min-h-6">
          <span aria-hidden="true">←&nbsp;</span>Volver a tus {results.length} bicis
        </Link>
      </footer>
    </section>
  );
}
