"use client";

import { useSearchParams } from "next/navigation";
import { useId, useState } from "react";

import { Alert, Field, Input, Stack, Text } from "../../design-system/react";
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

  return (
    <Stack>
      <Field label="¿Cuánto mides? (cm)" htmlFor={id} hint="Te decimos qué talla te encaja">
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          min={HEIGHT.min}
          max={HEIGHT.max}
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />
      </Field>
      <div aria-live="polite">
        {!published && <Text size="small">La marca no publica las alturas de cada talla.</Text>}
        {published && valid && !fit && (
          <Alert tone="warning" title="No hay talla para tu altura">
            Ninguna talla de esta bici cubre {cm} cm.
          </Alert>
        )}
        {fit && fit.fit === "oficial" && (
          <Alert tone="success" title={`Talla ${fit.size.label}`}>Según la tabla de tallas de la marca.</Alert>
        )}
        {fit && fit.fit === "estimada" && (
          <Alert tone="neutral" title={`Talla ${fit.size.label} (estimada)`}>
            La marca no publica tabla de tallas: es una estimación a partir de su geometría.
          </Alert>
        )}
        {fit && fit.fit === "entre" && (
          <Alert tone="warning" title={`Entre ${fit.size.label}${fit.alternative ? ` y ${fit.alternative.label}` : ""}`}>
            Estás entre dos tallas. La que tiene más stack es más cómoda; la de más reach, más deportiva. Si
            puedes, pruébala.
          </Alert>
        )}
      </div>
    </Stack>
  );
}
