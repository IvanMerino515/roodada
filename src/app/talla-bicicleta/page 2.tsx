import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/JsonLd";
import { TallaCalculator } from "@/components/TallaCalculator";
import { getCatalog } from "@/lib/catalog/load";
import type { Category } from "@/lib/catalog/types";
import { int } from "@/lib/format";
import { CATEGORY_SLUG } from "@/lib/landings";
import { breadcrumbJsonLd } from "@/lib/seo";
import { calcularTalla, tablaPorAltura } from "@/lib/talla";

export const metadata: Metadata = {
  title: "Talla de bicicleta según tu altura: calculadora con la tabla oficial de cada marca",
  description:
    "Calcula tu talla de bici con tu altura y tu entrepierna. Te decimos la talla en carretera, gravel, montaña, urbana e infantil, y la de cada marca, con las tablas oficiales de miles de bicis.",
  alternates: { canonical: "/talla-bicicleta" },
};

// [tipo, título de la tabla, cómo se dice en una pregunta: «bici de carretera»]
const TABLAS: [Category, string, string][] = [
  ["bici-carretera", "Carretera", "bici de carretera"],
  ["bici-gravel", "Gravel", "bici de gravel"],
  ["bici-mtb", "Montaña", "bici de montaña"],
  ["bici-urbana", "Urbana y paseo", "bici urbana o de paseo"],
];
const m = (cm: number) => `${(cm / 100).toLocaleString("es-ES", { minimumFractionDigits: 2 })} m`;

export default async function TallaPage() {
  const bikes = await getCatalog();
  // La cifra con la que abre la página: 1,75 m, todas las bicis de adulto
  const adultos = bikes.filter((b) => b.category !== "bici-infantil");
  const r175 = calcularTalla(adultos, 175);
  const top = r175.letras[0];
  const otras = top ? 100 - top.pct : 0;
  const marcas = new Set(bikes.filter((b) => b.sizes.length).map((b) => b.brandSlug)).size;
  const conTabla = bikes.filter((b) => b.inStock && b.sizes.some((s) => s.heightMin !== null)).length;

  // Ejemplo real de que la talla cambia entre marcas (carretera, 1,75 m)
  const carretera = calcularTalla(bikes, 175, undefined, "bici-carretera");
  const distintas = [...new Map(carretera.marcas.map((x) => [x.label, x])).values()].slice(0, 3);

  const tablas = TABLAS.map(([c, nombre, frase]) => ({ c, nombre, frase, filas: tablaPorAltura(bikes, c) }));
  const infantil = tablaPorAltura(bikes, "bici-infantil");

  const preguntas = [
    ...tablas
      .filter((t) => t.filas.some((f) => f.altura === 175))
      .map((t) => {
        const f = t.filas.find((x) => x.altura === 175)!;
        return {
          q: `¿Qué talla de ${t.frase} necesito si mido 1,75 m?`,
          a: `Una ${f.letra?.label ?? "—"} en la mayoría de las marcas (${f.letra?.pct ?? 0} % de las bicis)${f.cm ? `, o una talla ${f.cm.label} en las que miden en centímetros` : ""}. Depende de la geometría de cada modelo: compruébalo en su ficha.`,
        };
      }),
    {
      q: "¿Por qué la talla cambia según la marca?",
      a: `Porque cada marca diseña su geometría y pone sus propios rangos de altura. Con 1,75 m, en carretera, ${distintas.map((x) => `${x.marca} te da una ${x.label}`).join(", ")}. Por eso conviene mirar la tabla de cada modelo.`,
    },
    {
      q: "¿Para qué sirve la entrepierna?",
      a: "Para decidir cuando estás entre dos tallas: con ella comprobamos que pasas con margen por encima del tubo horizontal. Se mide descalzo, de pie contra la pared, del suelo a la entrepierna.",
    },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Talla de bicicleta", path: "/talla-bicicleta" }]),
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: preguntas.map((p) => ({ "@type": "Question", name: p.q, acceptedAnswer: { "@type": "Answer", text: p.a } })),
          },
        ]}
      />

      <header className="wrap grid-swiss gap-y-2 pt-4 pb-3 items-end">
        <div className="col-span-4 md:col-span-5 lg:col-span-7 grid gap-1">
          <p className="eyebrow">Calculadora</p>
          <h1 className="text-display uppercase">Talla de bicicleta según tu altura</h1>
        </div>
        <div className="col-span-4 md:col-span-3 lg:col-span-5 grid gap-1">
          {top && (
            <p>
              Con 1,75 m, la talla más habitual es la <strong>{top.label}</strong>, en el {top.pct} % de las bicis de adulto. Pero en {otras} de cada 100
              te toca otra: cada marca tiene su tabla.
            </p>
          )}
          <p className="text-small">
            Calculado con las tablas oficiales de {int(marcas)} marcas y {int(conTabla)} bicis a la venta. Cuando una marca no publica la altura de una
            talla, la estimamos con su geometría.
          </p>
        </div>
      </header>

      <section className="wrap pb-4" aria-label="Calculadora de talla">
        <TallaCalculator />
      </section>

      <section className="wrap py-2 grid gap-3" aria-labelledby="tablas">
        <h2 id="tablas" className="font-display text-h3 uppercase border-t border-border pt-2">Tabla de tallas por altura</h2>
        <p className="max-w-[70ch]">
          La talla que más se repite para cada altura en las bicis del catálogo. Las marcas usan dos sistemas: letras (S, M, L…) y centímetros de
          cuadro; damos los dos. Es una orientación: la de cada modelo está en su ficha.
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {tablas.map((t) => (
            <div key={t.c} className="grid gap-1 min-w-0">
              <h3 className="font-display text-h4 uppercase">
                <Link href={`/bicis/${CATEGORY_SLUG[t.c]}`} className="link">{t.nombre}</Link>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-small num">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="eyebrow font-normal py-1 pr-2">Altura</th>
                      <th className="eyebrow font-normal py-1 pr-2">Letras</th>
                      <th className="eyebrow font-normal py-1">Centímetros</th>
                    </tr>
                  </thead>
                  <tbody>
                    {t.filas.map((f) => (
                      <tr key={f.altura} className="border-b border-border">
                        <td className="py-0.5 pr-2">{m(f.altura)}</td>
                        <td className="py-0.5 pr-2">{f.letra ? <><strong>{f.letra.label}</strong> <span className="opacity-70">({f.letra.pct} %)</span></> : "—"}</td>
                        <td className="py-0.5">{f.cm ? <><strong>{f.cm.label}</strong> <span className="opacity-70">({f.cm.pct} %)</span></> : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {infantil.length > 0 && (
            <div className="grid gap-1 min-w-0">
              <h3 className="font-display text-h4 uppercase">
                <Link href="/bicis/infantiles" className="link">Infantil</Link>
              </h3>
              <table className="w-full border-collapse text-small num">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="eyebrow font-normal py-1 pr-2">Altura</th>
                    <th className="eyebrow font-normal py-1">Rueda</th>
                  </tr>
                </thead>
                <tbody>
                  {infantil.map((f) => (
                    <tr key={f.altura} className="border-b border-border">
                      <td className="py-0.5 pr-2">{m(f.altura)}</td>
                      <td className="py-0.5">{f.pulgadas ? <><strong>{f.pulgadas.label}</strong> <span className="opacity-70">({f.pulgadas.pct} %)</span></> : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="wrap py-2 grid gap-2">
        <h2 className="font-display text-h3 uppercase border-t border-border pt-2">Preguntas frecuentes</h2>
        <dl className="m-0 grid gap-2 max-w-[70ch]">
          {preguntas.map((p) => (
            <div key={p.q} className="grid gap-0.5">
              <dt className="font-display font-semibold">{p.q}</dt>
              <dd className="m-0">{p.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
