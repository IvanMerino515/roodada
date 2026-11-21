"use client";

import { useLinkStatus } from "next/link";

/**
 * Va dentro de un <Link>: mientras se abre la página, una barra fina abajo y, en la casilla que la
 * contiene (.casilla), un borde. Siempre montada y de tamaño fijo, para no mover nada al aparecer.
 */
export function LinkPending() {
  const { pending } = useLinkStatus();
  return <span className="enlace-pendiente" data-pendiente={pending || undefined} aria-hidden="true" />;
}
