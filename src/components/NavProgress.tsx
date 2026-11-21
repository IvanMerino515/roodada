"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/** Evento para arrancar la barra desde código (router.push de la guía o de los filtros). */
export const NAV_START = "roodada:navegando";
export const startNavProgress = () => window.dispatchEvent(new Event(NAV_START));

/**
 * Barra fina arriba de la pantalla mientras se abre otra página. Arranca al pulsar un enlace interno
 * (o con startNavProgress) y termina cuando cambia la dirección. Es solo visual: el lector de pantalla
 * ya anuncia la página nueva, así que va oculta para él.
 */
export function NavProgress() {
  const here = `${usePathname()}?${useSearchParams().toString()}`;
  // Dirección desde la que se empezó a navegar; null = no se está navegando
  const [from, setFrom] = useState<string | null>(null);
  const estado = from === null ? undefined : from === here ? "cargando" : "hecho";

  useEffect(() => {
    const start = () => setFrom(`${location.pathname}?${new URLSearchParams(location.search).toString()}`);
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      // Mismo destino (o solo un ancla): no hay navegación que esperar
      if (url.pathname === location.pathname && url.search === location.search) return;
      // /ir/ lleva a la web de la marca: sale del sitio
      if (url.pathname.startsWith("/ir/")) return;
      start();
    };
    document.addEventListener("click", onClick);
    window.addEventListener(NAV_START, start);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener(NAV_START, start);
    };
  }, []);

  // Al terminar, la barra se desvanece y se recoge; si una navegación se cancela, no se queda colgada
  useEffect(() => {
    if (!estado) return;
    const t = setTimeout(() => setFrom(null), estado === "hecho" ? 500 : 15000);
    return () => clearTimeout(t);
  }, [estado]);

  return <div className="nav-progreso" data-estado={estado} aria-hidden="true" />;
}
