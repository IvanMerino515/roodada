import type { Metadata } from "next";
import Link from "next/link";

import { DESTACADOS, FIJOS, type Enlace } from "@/lib/enlaces";

// La página de la bio de Instagram: no aporta nada en Google, así que no se indexa
export const metadata: Metadata = {
  title: "Enlaces",
  description: "Calculadora de talla, guía, rebajas y todo Roodada.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/enlaces" },
};

/**
 * Enlaces de la bio. Llegas aquí con UTM (por ejemplo ?utm_source=instagram&utm_medium=social&utm_campaign=bio):
 * el registro de actividad las apunta en la primera página, así que los enlaces de dentro no las necesitan.
 */
export default function EnlacesPage() {
  return (
    <div className="wrap max-w-[560px] mx-auto py-4 grid gap-3">
      <header className="grid gap-1 text-center">
        <p className="eyebrow">Roodada</p>
        <h1 className="text-h2 uppercase">Elige bici con datos, no con anuncios</h1>
      </header>
      {DESTACADOS.length > 0 && <Lista titulo="Esta semana" enlaces={DESTACADOS} destacado />}
      <Lista titulo="Siempre a mano" enlaces={FIJOS} />
    </div>
  );
}

function Lista({ titulo, enlaces, destacado = false }: { titulo: string; enlaces: Enlace[]; destacado?: boolean }) {
  return (
    <section className="grid gap-1" aria-label={titulo}>
      <h2 className="eyebrow">{titulo}</h2>
      <ul className="grid gap-1 list-none m-0 p-0">
        {enlaces.map((e) => (
          <li key={e.href}>
            <Link
              href={e.href}
              className={`group grid gap-0.5 border border-border p-2 no-underline focus-inset ${destacado ? "bg-surface" : "bg-white"} hover:bg-accent hover:text-on-accent transition-colors duration-200 ease-ds motion-reduce:transition-none`}
            >
              <span className="font-display text-h4 uppercase flex justify-between gap-1">
                {e.titulo} <span aria-hidden="true" className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none">→</span>
              </span>
              {e.texto && <span className="text-small">{e.texto}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
