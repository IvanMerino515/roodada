"use client";

import { Analytics } from "@vercel/analytics/next";

/**
 * Visitas por página con Vercel Web Analytics: sin cookies ni identificadores, así que no pide
 * consentimiento. Se quitan los parámetros de la URL: en resultados y fichas llevan las respuestas
 * de la guía (altura, presupuesto…) y no hacen falta para medir el embudo.
 */
export function SiteAnalytics() {
  return <Analytics beforeSend={(e) => ({ ...e, url: e.url.split("?")[0] })} />;
}
