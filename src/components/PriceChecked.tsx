"use client";

import { useSyncExternalStore } from "react";

import { day } from "@/lib/format";

/** A partir de estos días, avisamos de que el precio puede haber cambiado */
const STALE_DAYS = 14;
const DAY = 86_400_000;
const noop = () => () => {};
/** Estable durante todo el día: useSyncExternalStore no vuelve a pintar sin motivo */
const todayNumber = () => Math.floor(Date.now() / DAY);

/**
 * Fila «Actualizado»: la fecha sale en el HTML (la ficha está en caché) y los días que han pasado se
 * cuentan en el navegador, para que no se queden congelados con la página.
 */
export function PriceChecked({ iso }: { iso: string }) {
  // En el servidor (y al hidratar) no hay "hoy": null; en el navegador, el día de hoy en número de días
  const today = useSyncExternalStore(noop, todayNumber, () => null);
  const days = today === null ? null : Math.max(0, today - Math.floor(new Date(iso).getTime() / DAY));
  const ago = days === null ? null : days === 0 ? "hoy" : days === 1 ? "ayer" : `hace ${days} días`;
  return (
    <>
      Comprobado el {day(iso)}
      {ago && <> ({ago})</>}
      {days !== null && days >= STALE_DAYS && (
        <span className="block text-small">Puede haber cambiado: confírmalo en la web de la tienda.</span>
      )}
    </>
  );
}
