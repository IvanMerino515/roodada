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
    <section aria-labelledby="para-ti" className="border border-border bg-surface">
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-2 py-2 border-b border-border">
        <h2 id="para-ti" className="font-display text-h2 uppercase leading-none">Por qué es para ti</h2>
        <p className="eyebrow num">
          {index === 0 ? "La que más encaja" : `Recomendación ${index + 1} de ${results.length}`} · Encaje {r.score}/100
        </p>
      </header>
      <div className="lg:grid lg:grid-cols-12">
        <div className="lg:col-span-7 p-2 md:p-3 grid gap-2 content-start lg:border-r border-border">
          {r.story.map((p) => (
            <p key={p}>{p}</p>
          ))}
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
