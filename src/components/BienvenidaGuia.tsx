"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

/** Se guarda en el navegador que ya la ha visto (localStorage). No es una cookie ni un dato personal: no pide permiso. */
const CLAVE = "roodada_bienvenida_guia";

const visto = () => {
  try {
    return localStorage.getItem(CLAVE) === "1";
  } catch {
    return false;
  }
};

/**
 * Bienvenida del recomendador (texto de Edgar, 26-11-2026): sale solo la primera vez en cada navegador.
 * Se cierra con «Empezar», la ✕, Esc o pulsando fuera; cualquiera de ellas la marca como vista.
 */
export function BienvenidaGuia() {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d || visto()) return;
    d.showModal();
  }, []);

  const cerrar = () => {
    try {
      localStorage.setItem(CLAVE, "1");
    } catch {}
    ref.current?.close();
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby="bienvenida-titulo"
      onClose={cerrar}
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrar(); // pulsar fuera (en el fondo oscuro)
      }}
      className="m-auto p-0 w-[min(40rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] bg-white text-text border border-border shadow-[8px_8px_0_var(--ds-roodada-textos)] backdrop:bg-[rgb(55_52_53/0.45)] open:flex flex-col"
    >
      <div className="flex items-center justify-between gap-2 px-2 py-1.5 border-b border-border">
        <span className="eyebrow">Recomendador · Antes de empezar</span>
        <button type="button" onClick={cerrar} aria-label="Cerrar" className="inline-flex items-center justify-center size-4 border border-border cursor-pointer hover:bg-surface">
          <span aria-hidden="true">✕</span>
        </button>
      </div>
      <div className="overflow-y-auto px-2 md:px-3 py-2 grid gap-1.5">
        <h2 id="bienvenida-titulo" className="font-display text-h3 uppercase leading-tight text-balance">
          ¡Hola! Bienvenido al <span className="bg-choice text-on-choice px-0.5">recomendador</span> de Roodada
        </h2>
        <h3 className="eyebrow font-semibold mt-0.5">¿Qué hacemos aquí?</h3>
        <p>
          Te hacemos unas preguntas según tu nivel de Roodador (lo metido que estés en este mundillo) y te recomendamos la bici que
          mejor te puede encajar.
        </p>
        <p>Te preguntaremos:</p>
        <ul className="list-none m-0 p-0 flex flex-wrap gap-1">
          {["¿Cuántas veces sales por semana?", "¿Qué presupuesto tienes?", "¿Qué tipo de bici buscas?"].map((t) => (
            <li key={t} className="border border-border px-1 py-0.5 text-small">{t}</li>
          ))}
        </ul>
        <p>Al final te enseñamos hasta 5 bicis que creemos que van mejor con lo que buscas.</p>
        <h3 className="eyebrow font-semibold mt-0.5">¿Buscas algo que no está o no hemos dado en el clavo?</h3>
        <p>Puedes entrar en nuestro catálogo o en el comparador.</p>
        <p className="bg-surface px-1.5 py-1 font-semibold">¡Nuestra misión es que puedas tomar una decisión con la mejor información posible!</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-1.5 px-2 md:px-3 py-1.5 border-t border-border">
        <button type="button" onClick={cerrar} className="btn btn-solid" autoFocus>
          Empezar <span aria-hidden="true">→</span>
        </button>
        <span className="text-small">
          <Link href="/bicis" className="link" onClick={cerrar}>Ver el catálogo</Link> ·{" "}
          <Link href="/comparador" className="link" onClick={cerrar}>Ir al comparador</Link>
        </span>
      </div>
    </dialog>
  );
}
