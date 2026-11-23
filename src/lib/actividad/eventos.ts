// Registro anónimo de actividad: qué eventos hay, cómo se validan y cómo se agrupan los datos
// sensibles. La lista coincide con la de la función registrar_evento (supabase/sql/002_eventos.sql):
// si añades un evento aquí, añádelo también allí.
import { z } from "zod";

export const EVENTOS = [
  "pagina_vista",
  "guia_inicio",
  "guia_respuesta",
  "guia_fin",
  "resultados_mostrados",
  "comparador_busqueda",
  "comparar_marcar",
  "comparativa_abierta",
  "ficha_vista",
  "salida_tienda",
] as const;
export type Evento = (typeof EVENTOS)[number];

type Valor = string | number | boolean | null | Valor[] | { [k: string]: Valor };
export type Datos = Record<string, Valor>;

/** Lo que manda el navegador a /api/evento: nombre, página, visita y datos (pequeños) */
export const eventoSchema = z.object({
  n: z.enum(EVENTOS),
  p: z.string().max(200).optional(),
  v: z.string().max(40).optional(),
  d: z
    .record(z.string(), z.unknown())
    .optional()
    .refine((d) => d === undefined || JSON.stringify(d).length <= 3000, "Datos demasiado grandes"),
});

/** Presupuesto en tramos: nunca la cifra exacta */
export function presupuestoTramo(euros: number | null | undefined): string | null {
  if (euros === null || euros === undefined || !Number.isFinite(euros)) return null;
  const cortes = [1000, 2000, 3000, 5000, 8000];
  const i = cortes.findIndex((c) => euros < c);
  if (i === 0) return "<1000";
  if (i === -1) return `${cortes[cortes.length - 1]}+`;
  return `${cortes[i - 1]}-${cortes[i] - 1}`;
}

/** Altura en tramos de 5 cm: "170-174" */
export function alturaTramo(cm: number | null | undefined): string | null {
  if (cm === null || cm === undefined || !Number.isFinite(cm)) return null;
  const base = Math.floor(cm / 5) * 5;
  return `${base}-${base + 4}`;
}

/** Ruta sin parámetros: en resultados y fichas la dirección lleva las respuestas de la guía */
export const rutaLimpia = (url: string) => url.split(/[?#]/)[0];

/** Rastreadores y herramientas: no son personas */
export const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|curl|wget|python|headless|lighthouse/i;
