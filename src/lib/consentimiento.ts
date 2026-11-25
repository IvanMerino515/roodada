// Consentimiento de cookies (LSSI art. 22.2 y guía de cookies de la AEPD, 2023).
// Dos categorías piden permiso: analítica (Google Analytics 4) y afiliación (Skimlinks, que atribuye las
// compras en tiendas a Roodada y guarda datos en el navegador). Lo demás no lo necesita:
// Vercel Web Analytics y el registro propio no usan cookies ni guardan nada en el navegador, y la
// selección del comparador y esta misma decisión son almacenamiento técnico.
//
// Reglas de la AEPD que cumple el aviso: Aceptar y Rechazar igual de visibles y en la primera capa,
// nada se carga antes de decidir, se puede cambiar de opinión en cualquier momento (pie de página) y
// la decisión caduca a los 12 meses, momento en que se vuelve a preguntar.

/**
 * ID de medición de GA4 (propiedad de Roodada, 25-11-2026). Es público: va en el código de la página.
 * Solo en compilaciones de producción y preview (en `next dev` no se mide nada). NEXT_PUBLIC_GA_ID lo
 * sustituye si se define. Sin ID no hay nada que aceptar y el aviso no aparece.
 */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || (process.env.NODE_ENV === "production" ? "G-ZR7CP7S1B2" : "");

/** ID de editor de Skimlinks (25-11-2026). Público, va en la dirección de su script. Solo en producción */
export const SKIMLINKS_ID = process.env.NODE_ENV === "production" ? "313666X1802414" : "";

/** ¿Hay algo que aceptar? Si no, el aviso no aparece */
export const HAY_OPCIONALES = Boolean(GA_ID || SKIMLINKS_ID);

/** Si cambian las categorías o los proveedores, subir la versión: se vuelve a preguntar a todos */
const VERSION = 2; // 2: Skimlinks (afiliación), 25-11-2026
const CLAVE = "roodada_consentimiento";
const CADUCIDAD_MS = 365 * 24 * 60 * 60 * 1000;
/** Evento del navegador que avisa de un cambio (o pide abrir las preferencias) */
export const EVENTO_CAMBIO = "roodada:consentimiento";
export const EVENTO_ABRIR = "roodada:preferencias-cookies";

export type Consentimiento = { analitica: boolean; afiliacion: boolean };
type Guardado = Consentimiento & { v: number; fecha: number };

// Copia en memoria por si el navegador bloquea el almacenamiento: la decisión vale al menos esta visita
let memoria: Guardado | null = null;

const vigente = (g: Partial<Guardado> | null): g is Guardado =>
  !!g && g.v === VERSION && typeof g.fecha === "number" && Date.now() - g.fecha <= CADUCIDAD_MS;

/** La decisión guardada, o null si no hay (o caducó, o es de otra versión): entonces hay que preguntar */
export function leerConsentimiento(): Consentimiento | null {
  let g: Partial<Guardado> | null = memoria;
  try {
    const raw = localStorage.getItem(CLAVE);
    if (raw) g = JSON.parse(raw) as Partial<Guardado>;
  } catch {}
  return vigente(g) ? { analitica: g.analitica === true, afiliacion: g.afiliacion === true } : null;
}

export function guardarConsentimiento(c: Consentimiento) {
  const anterior = leerConsentimiento();
  memoria = { ...c, v: VERSION, fecha: Date.now() };
  try {
    localStorage.setItem(CLAVE, JSON.stringify(memoria));
  } catch {}
  // Retirar un permiso: se borran las cookies de Google Analytics y se recarga para descargar los scripts
  if ((anterior?.analitica && !c.analitica) || (anterior?.afiliacion && !c.afiliacion)) {
    if (!c.analitica) borrarCookiesGA();
    location.reload();
    return;
  }
  window.dispatchEvent(new CustomEvent(EVENTO_CAMBIO, { detail: c }));
}

/**
 * Estado como texto, para useSyncExternalStore (necesita un valor que no cambie entre lecturas):
 * «pendiente» o dos cifras, analítica y afiliación («10» = solo analítica)
 */
export function estadoConsentimiento(): string {
  const c = leerConsentimiento();
  return c === null ? "pendiente" : `${c.analitica ? 1 : 0}${c.afiliacion ? 1 : 0}`;
}

/** Lo contrario: de texto a decisión (null si no hay) */
export const decisionDe = (estado: string | null): Consentimiento | null =>
  estado && estado !== "pendiente" ? { analitica: estado[0] === "1", afiliacion: estado[1] === "1" } : null;

/** Avisa de cada cambio de decisión, en esta pestaña y en las demás */
export function suscribirConsentimiento(avisar: () => void) {
  window.addEventListener(EVENTO_CAMBIO, avisar);
  window.addEventListener("storage", avisar);
  return () => {
    window.removeEventListener(EVENTO_CAMBIO, avisar);
    window.removeEventListener("storage", avisar);
  };
}

/** Abre de nuevo el aviso (enlace «Preferencias de cookies» del pie) */
export const abrirPreferencias = () => window.dispatchEvent(new Event(EVENTO_ABRIR));

function borrarCookiesGA() {
  const dominios = ["", location.hostname, `.${location.hostname.replace(/^www\./, "")}`];
  for (const nombre of document.cookie.split(";").map((c) => c.split("=")[0].trim())) {
    if (nombre !== "_ga" && !nombre.startsWith("_ga_")) continue;
    for (const d of dominios) {
      document.cookie = `${nombre}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
    }
  }
}
