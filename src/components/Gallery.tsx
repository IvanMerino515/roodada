"use client";

import { useState, ViewTransition } from "react";
import { FotoBici } from "./FotoBici";

type Photo = { url: string; alt: string | null };

/** Foto grande y miniaturas debajo: cada miniatura cambia la foto grande, sin salir de la página. */
/** `transitionName`: la foto de la casilla del catálogo "viaja" hasta la primera foto de aquí. */
export function Gallery({ photos, name, transitionName, bici }: { photos: Photo[]; name: string; transitionName?: string; bici?: number }) {
  const [current, setCurrent] = useState(0);
  const shown = photos.slice(0, 8);
  const main = shown[current] ?? shown[0];
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center p-2 md:p-4 min-h-40">
        <ViewTransition name={current === 0 ? transitionName : undefined} share="foto-bici" default="none">
          <FotoBici
            key={main.url}
            src={main.url}
            fallbacks={shown.filter((p) => p.url !== main.url).map((p) => p.url)}
            bici={bici}
            alt={main.alt ?? name}
            width={1200}
            height={800}
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="product w-full h-auto aspect-[3/2] object-contain"
            preload={current === 0}
          />
        </ViewTransition>
      </div>
      {shown.length > 1 && (
        <ul className="flex overflow-x-auto border-t border-border list-none m-0 p-0" aria-label="Fotos">
          {shown.map((p, i) => (
            <li key={p.url} className="shrink-0 w-12 md:w-16 border-r border-border">
              <button
                type="button"
                onClick={() => setCurrent(i)}
                aria-pressed={i === current}
                aria-label={`Ver foto ${i + 1} de ${shown.length}`}
                className="block w-full p-1 cursor-pointer aria-pressed:shadow-[inset_0_-4px_0_var(--ds-accent)] hover:opacity-80 focus-inset"
              >
                <FotoBici src={p.url} bici={bici} alt="" width={200} height={133} sizes="12vw" className="product w-full h-auto aspect-[3/2] object-contain" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
