"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { setRutaActual, track } from "@/lib/actividad/cliente";
import { utmDe } from "@/lib/actividad/eventos";

/**
 * Apunta cada página vista (sin parámetros) y cada salida a tienda (/ir/). En la primera página de
 * la visita apunta también de qué web se viene (solo el dominio: google.com, instagram.com…).
 */
export function ActivityTracker() {
  const path = usePathname();
  const prev = useRef<string | null>(null);

  useEffect(() => {
    const first = prev.current === null;
    let origen: string | null = null;
    if (first && document.referrer) {
      try {
        const host = new URL(document.referrer).host;
        if (host !== location.host) origen = host.replace(/^www\./, "");
      } catch {}
    }
    // En la primera página de la visita, de dónde viene: dominio de origen y parámetros UTM (el navegador
    // de Instagram a menudo no dice de dónde viene, así que las UTM son la forma fiable)
    const utm = first ? utmDe(location.search) : {};
    track("pagina_vista", { ruta: path, desde: prev.current, ...(origen ? { origen } : {}), ...utm });
    setRutaActual(path);
    prev.current = path;
  }, [path]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !url.pathname.startsWith("/ir/")) return;
      track("salida_tienda", { slug: decodeURIComponent(url.pathname.slice(4)), desde: location.pathname });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
