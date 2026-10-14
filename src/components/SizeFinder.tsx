"use client";

import { useSearchParams } from "next/navigation";
import { useId, useState } from "react";

import type { Size } from "@/lib/catalog/types";
import { HEIGHT } from "@/lib/recommender/questions";
import { fitSize } from "@/lib/recommender/sizing";

/** "¿Es para ti?": dime cuánto mides y te digo qué talla, y con qué seguridad. */
export function SizeFinder({ sizes }: { sizes: Size[] }) {
  const id = useId();
  // Desde los resultados de la guía llega ?altura=; la ficha sigue siendo estática
  const fromGuide = useSearchParams().get("altura");
  const [height, setHeight] = useState(fromGuide ?? "");
  const cm = Number(height);
  const valid = Number.isInteger(cm) && cm >= HEIGHT.min && cm <= HEIGHT.max;
  const fit = valid ? fitSize(sizes, cm) : null;
  const published = sizes.some((s) => s.heightMin !== null);

  if (!published) return <p className="italic">La marca no publica las alturas de cada talla.</p>;

  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-small">¿Cuánto mides?</label>
      <div className="flex items-baseline gap-1 max-w-20">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={HEIGHT.min}
          max={HEIGHT.max}
          value={height}
          placeholder="175"
          aria-describedby={`${id}-res`}
          onChange={(e) => setHeight(e.target.value)}
          className="input font-display text-h3 num placeholder:opacity-40"
        />
        <span className="eyebrow" aria-hidden="true">cm</span>
      </div>
      <div id={`${id}-res`} aria-live="polite" className="min-h-6">
        {!valid && <p className="text-small">Escribe tu altura y te decimos la talla.</p>}
        {valid && !fit && <Result title="Sin talla">Ninguna talla de esta bici cubre {cm} cm.</Result>}
        {fit && fit.fit === "oficial" && <Result title={`Talla ${fit.size.label}`}>Según la tabla de tallas de la marca.</Result>}
        {fit && fit.fit === "estimada" && (
          <Result title={`Talla ${fit.size.label} · estimada`}>
            La marca no publica tabla de tallas: la estimamos a partir de su geometría.
          </Result>
        )}
        {fit && fit.fit === "entre" && (
          <Result title={`Entre ${fit.size.label}${fit.alternative ? ` y ${fit.alternative.label}` : ""}`}>
            La de más stack es más cómoda; la de más reach, más deportiva. Si puedes, pruébala.
          </Result>
        )}
      </div>
    </div>
  );
}

function Result({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-0.5">
      <p className="font-display text-h4 uppercase">{title}</p>
      <p className="text-small">{children}</p>
    </div>
  );
}
