import Link from "next/link";
import type { ReactNode } from "react";

import { BikeCard } from "@/components/BikeCard";
import { JsonLd } from "@/components/JsonLd";
import type { Bike } from "@/lib/catalog/types";
import type { Pregunta } from "@/lib/landings";
import { abs, breadcrumbJsonLd } from "@/lib/seo";

/**
 * Página de entrada (tipo de bici o marca): la respuesta arriba con cifras, las mejores por
 * calidad-precio, enlaces a lo relacionado, preguntas frecuentes y la guía. Misma retícula que el
 * comparador.
 */
export function LandingView({
  eyebrow,
  titulo,
  intro,
  mejores,
  relacionados,
  preguntas,
  migas,
  verTodas,
  path,
}: {
  eyebrow: string;
  titulo: string;
  intro: string[];
  mejores: Bike[];
  relacionados: { titulo: string; enlaces: { href: string; texto: string; n?: number }[] }[];
  preguntas: Pregunta[];
  migas: { name: string; path: string }[];
  verTodas: { href: string; texto: string };
  path: string;
}) {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(migas),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${titulo}: mejores por calidad-precio`,
            url: abs(path),
            itemListElement: mejores.map((b, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/bici/${b.slug}`), name: `${b.brand} ${b.name}` })),
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: preguntas.map((p) => ({ "@type": "Question", name: p.q, acceptedAnswer: { "@type": "Answer", text: p.a } })),
          },
        ]}
      />

      <nav aria-label="Estás en" className="wrap pt-2 eyebrow">
        <ol className="flex flex-wrap gap-1 list-none m-0 p-0">
          {migas.slice(0, -1).map((m) => (
            <li key={m.path}>
              <Link href={m.path} className="link inline-flex items-center min-h-3">{m.name}</Link> /
            </li>
          ))}
          <li aria-current="page" className="inline-flex items-center min-h-3">{migas.at(-1)?.name}</li>
        </ol>
      </nav>

      <header className="wrap grid-swiss gap-y-2 pt-2 pb-3 items-end">
        <div className="col-span-4 md:col-span-5 lg:col-span-7 grid gap-1">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="text-display uppercase">{titulo}</h1>
        </div>
        <div className="col-span-4 md:col-span-3 lg:col-span-5 grid gap-1">
          {intro.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
      </header>

      <section aria-labelledby="mejores" className="wrap py-2 grid gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border pt-2">
          <h2 id="mejores" className="font-display text-h3 uppercase">Las mejores por calidad-precio</h2>
          <Link href={verTodas.href} className="btn">
            {verTodas.texto} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-2 list-none m-0 p-0">
          {mejores.map((b, i) => (
            <li key={b.id}>
              <BikeCard bike={b} preload={i < 4} />
            </li>
          ))}
        </ul>
        <p className="text-small">Una por modelo, ordenadas por la nota calidad-precio frente a bicis de su tipo.</p>
      </section>

      {relacionados.filter((r) => r.enlaces.length).map((r) => (
        <Section key={r.titulo} titulo={r.titulo}>
          <ul className="flex flex-wrap gap-1 list-none m-0 p-0">
            {r.enlaces.map((e) => (
              <li key={e.href}>
                <Link href={e.href} className="btn">
                  {e.texto}
                  {e.n !== undefined && <span className="num opacity-70">{e.n.toLocaleString("es-ES", { useGrouping: "always" })}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ))}

      <Section titulo="Preguntas frecuentes">
        <dl className="m-0 grid gap-2 max-w-[70ch]">
          {preguntas.map((p) => (
            <div key={p.q} className="grid gap-0.5">
              <dt className="font-display font-semibold">{p.q}</dt>
              <dd className="m-0">{p.a}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <section className="wrap py-4">
        <div className="bg-surface border border-border p-2 md:p-4 grid gap-2 md:grid-cols-[1fr_auto] items-center">
          <p className="font-display text-h3">¿No sabes cuál? Responde unas preguntas y te decimos cuáles te encajan, en qué talla y por qué.</p>
          <Link href="/guia" className="btn btn-solid btn-lg">
            Empezar la guía <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}

function Section({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="wrap py-2 grid gap-2">
      <h2 className="font-display text-h3 uppercase border-t border-border pt-2">{titulo}</h2>
      {children}
    </section>
  );
}
