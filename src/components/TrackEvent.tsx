"use client";

import { useEffect, useRef } from "react";

import { getRutaActual, track } from "@/lib/actividad/cliente";
import type { Datos, Evento } from "@/lib/actividad/eventos";

/**
 * Apunta un evento una vez al aparecer, desde una página de servidor (ficha vista, resultados
 * mostrados…). Añade de qué página de Roodada se venía. No pinta nada.
 */
export function TrackEvent({ nombre, datos = {} }: { nombre: Evento; datos?: Datos }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    // Todavía es la página anterior (ver cliente.ts): de dónde se viene
    track(nombre, { ...datos, desde: getRutaActual() });
  }, [nombre, datos]);
  return null;
}
