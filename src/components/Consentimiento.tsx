"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

import {
  EVENTO_ABRIR,
  GA_ID,
  HAY_OPCIONALES,
  SKIMLINKS_ID,
  abrirPreferencias,
  decisionDe,
  estadoConsentimiento,
  guardarConsentimiento,
  leerConsentimiento,
  suscribirConsentimiento,
  type Consentimiento,
} from "@/lib/consentimiento";

/**
 * Aviso de cookies poco invasivo: una tarjeta abajo a la izquierda, sin capa que tape la página ni
 * bloquee el scroll. Primera capa con Aceptar y Rechazar iguales (la AEPD pide que rechazar cueste lo
 * mismo que aceptar) y «Configurar» para elegir por categoría. Solo aparece si hay algo que aceptar
 * (HAY_OPCIONALES) y no se ha decidido aún, o al pulsar «Preferencias de cookies» en el pie.
 * Google Analytics y Skimlinks se cargan aquí mismo y solo con su permiso.
 */
export function Consentimiento() {
  // La decisión vive en el navegador; en el servidor (y al hidratar) no se sabe y no se enseña nada
  const estado = useSyncExternalStore(suscribirConsentimiento, estadoConsentimiento, () => null);
  const [abierto, setAbierto] = useState(false);
  const [configurar, setConfigurar] = useState(false);
  const [analitica, setAnalitica] = useState(false);
  const [afiliacion, setAfiliacion] = useState(false);
  const titulo = useId();
  const caja = useRef<HTMLElement>(null);
  const decision = decisionDe(estado);
  const visible = HAY_OPCIONALES && (estado === "pendiente" || abierto);
  const todo = (si: boolean) => ({ analitica: si, afiliacion: si });
  const prepararConfigurar = (c: Consentimiento | null) => {
    setAnalitica(c?.analitica ?? false);
    setAfiliacion(c?.afiliacion ?? false);
    setConfigurar(true);
  };

  // «Preferencias de cookies» en el pie: abre el aviso en la pantalla de configurar
  useEffect(() => {
    const onAbrir = () => {
      prepararConfigurar(leerConsentimiento());
      setAbierto(true);
      // El foco va al aviso para que se pueda usar con teclado y lector de pantalla
      requestAnimationFrame(() => caja.current?.focus());
    };
    window.addEventListener(EVENTO_ABRIR, onAbrir);
    return () => window.removeEventListener(EVENTO_ABRIR, onAbrir);
  }, []);

  const decidir = (c: Consentimiento) => {
    guardarConsentimiento(c);
    setAbierto(false);
    setConfigurar(false);
  };

  return (
    <>
      {decision?.analitica && GA_ID && <GoogleAnalytics />}
      {decision?.afiliacion && SKIMLINKS_ID && <Skimlinks />}
      {visible && (
        <section
          ref={caja}
          tabIndex={-1}
          aria-labelledby={titulo}
          className="fixed z-40 bottom-2 left-2 right-2 md:right-auto md:max-w-[28rem] bg-bg text-text border border-current p-2 grid gap-2 outline-none"
        >
          <h2 id={titulo} className="eyebrow">
            Cookies
          </h2>
          {!configurar ? (
            <>
              <p className="text-small">
                Si aceptas, usamos Google Analytics para saber qué partes de Roodada sirven y Skimlinks para que las
                tiendas sepan que llegaste desde aquí: así nos financiamos, sin publicidad. Puedes cambiarlo cuando
                quieras desde el pie de página.{" "}
                <Link href="/cookies" className="link">
                  Política de cookies
                </Link>
              </p>
              <div className="grid grid-cols-2 gap-1">
                <button type="button" className="btn justify-center" onClick={() => decidir(todo(false))}>
                  Rechazar
                </button>
                <button type="button" className="btn justify-center" onClick={() => decidir(todo(true))}>
                  Aceptar
                </button>
              </div>
              <button
                type="button"
                className="link text-small justify-self-start min-h-3"
                onClick={() => prepararConfigurar(decision)}
              >
                Configurar
              </button>
            </>
          ) : (
            <>
              <ul className="list-none m-0 p-0 grid gap-1 text-small">
                <li className="grid gap-0.5 border-t border-border pt-1">
                  <span className="flex items-center gap-1">
                    <input type="checkbox" checked disabled id={`${titulo}-tecnicas`} className="size-2" />
                    <label htmlFor={`${titulo}-tecnicas`} className="font-medium">
                      Técnicas · siempre activas
                    </label>
                  </span>
                  <span>Guardan tu selección del comparador y esta decisión. Sin ellas la web no funciona.</span>
                </li>
                <li className="grid gap-0.5 border-t border-border pt-1">
                  <span className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      id={`${titulo}-analitica`}
                      className="size-2"
                      checked={analitica}
                      onChange={(e) => setAnalitica(e.target.checked)}
                    />
                    <label htmlFor={`${titulo}-analitica`} className="font-medium">
                      Analítica · Google Analytics
                    </label>
                  </span>
                  <span>Cuenta visitas y recorridos, sin tus respuestas de la guía. Las cookies duran 13 meses.</span>
                </li>
                <li className="grid gap-0.5 border-t border-border pt-1">
                  <span className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      id={`${titulo}-afiliacion`}
                      className="size-2"
                      checked={afiliacion}
                      onChange={(e) => setAfiliacion(e.target.checked)}
                    />
                    <label htmlFor={`${titulo}-afiliacion`} className="font-medium">
                      Afiliación · Skimlinks
                    </label>
                  </span>
                  <span>Avisa a las tiendas de que llegaste desde Roodada para que nos paguen una comisión. A ti te cuesta lo mismo.</span>
                </li>
              </ul>
              <div className="grid grid-cols-2 gap-1">
                <button type="button" className="btn justify-center" onClick={() => decidir(todo(false))}>
                  Rechazar todo
                </button>
                <button type="button" className="btn justify-center" onClick={() => decidir({ analitica, afiliacion })}>
                  Guardar
                </button>
              </div>
              <Link href="/cookies" className="link text-small justify-self-start">
                Política de cookies
              </Link>
            </>
          )}
        </section>
      )}
    </>
  );
}

/** Enlace del pie para volver a abrir el aviso. Solo existe si hay algo que aceptar */
export function PreferenciasCookies({ className }: { className?: string }) {
  if (!HAY_OPCIONALES) return null;
  return (
    <button type="button" className={className} onClick={abrirPreferencias}>
      Preferencias de cookies
    </button>
  );
}

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

/** Dirección sin parámetros ni ancla: en resultados y fichas llevan altura, entrepierna y presupuesto */
const limpia = (url: string) => url.split(/[?#]/)[0];

/**
 * Google Analytics 4, solo con consentimiento. Configuración de privacidad: sin Google Signals ni
 * personalización de anuncios, cookies de 13 meses y direcciones sin parámetros. Las páginas vistas
 * se envían a mano en cada cambio de ruta: en GA4 hay que desactivar «Cambios de página basados en
 * eventos del historial del navegador» (Flujo de datos → Medición mejorada → Páginas vistas →
 * Configuración avanzada), o GA mandaría la dirección completa.
 */
function GoogleAnalytics() {
  const path = usePathname();
  const anterior = useRef<string | null>(null);

  useEffect(() => {
    if (window.gtag) return;
    window.dataLayer = window.dataLayer ?? [];
    // gtag necesita el objeto arguments, no un array
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted",
    });
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: 395 * 24 * 60 * 60,
      page_location: location.origin + location.pathname,
      // De fuera, solo el dominio de origen (la dirección de origen puede llevar datos)
      page_referrer: document.referrer ? new URL(document.referrer).origin : "",
    });
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    const ubicacion = location.origin + limpia(path);
    window.gtag?.("set", { page_location: ubicacion, ...(anterior.current ? { page_referrer: anterior.current } : {}) });
    window.gtag?.("event", "page_view", { page_location: ubicacion, page_path: limpia(path) });
    anterior.current = ubicacion;
  }, [path]);

  return null;
}

/**
 * Skimlinks, solo con permiso de afiliación. Atribuye a Roodada las compras de quien llega a una tienda
 * desde aquí. Nuestros enlaces de compra pasan por /ir/, que el script no toca: sirve para que Skimlinks
 * verifique la web y mida. En su panel hay que dejar desactivado Skimwords (convierte palabras en enlaces).
 */
function Skimlinks() {
  useEffect(() => {
    if (document.querySelector("script[data-skimlinks]")) return;
    const s = document.createElement("script");
    s.async = true;
    s.dataset.skimlinks = "";
    s.src = `https://s.skimresources.com/js/${SKIMLINKS_ID}.skimlinks.js`;
    document.body.appendChild(s);
  }, []);
  return null;
}
