// Envío de eventos desde el navegador. Sin cookies ni almacenamiento: la "visita" es un número
// aleatorio en memoria, que se pierde al cerrar o recargar la pestaña. Sirve para unir los pasos de
// un mismo recorrido (guía → ficha → tienda) sin saber quién es nadie.
import { rutaLimpia, type Datos, type Evento } from "./eventos";

let visita: string | null = null;
// Última página apuntada por ActivityTracker. Los efectos de una página se ejecutan antes que los
// del layout, así que cuando una página apunta su evento (TrackEvent) aquí sigue la página anterior:
// justo "de dónde viene"
let rutaActual: string | null = null;

const getVisita = () => (visita ??= Math.random().toString(36).slice(2, 12) + Date.now().toString(36).slice(-4));

/** Quien pide no ser seguido (Global Privacy Control o Do Not Track) no se registra */
const noSeguir = () =>
  typeof navigator !== "undefined" &&
  ((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true || navigator.doNotTrack === "1");

export const getRutaActual = () => rutaActual;
export const setRutaActual = (ruta: string) => {
  rutaActual = ruta;
};

/** Apunta un evento. Nunca falla ni retrasa nada: si no se puede enviar, se pierde. */
export function track(nombre: Evento, datos: Datos = {}) {
  if (typeof window === "undefined" || noSeguir()) return;
  // En desarrollo no se envía nada, para no ensuciar los datos
  if (process.env.NODE_ENV !== "production") return;
  try {
    const body = JSON.stringify({ n: nombre, p: rutaLimpia(location.pathname), v: getVisita(), d: datos });
    const blob = new Blob([body], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/evento", blob)) {
      fetch("/api/evento", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  } catch {}
}
