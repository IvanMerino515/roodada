import type { Metadata } from "next";
import Link from "next/link";

import { PreferenciasCookies } from "@/components/Consentimiento";
import { LegalPage } from "@/components/LegalPage";
import { GA_ID } from "@/lib/consentimiento";

export const metadata: Metadata = { title: "Cookies", alternates: { canonical: "/cookies" } };

// Lista de lo que se guarda en el navegador. Si se añade una cookie o un servicio nuevo (un píxel, un
// vídeo incrustado…), añadirlo aquí y subir VERSION en src/lib/consentimiento.ts para volver a preguntar.
const TECNICAS: [string, string, string][] = [
  ["roodada_consentimiento", "Guarda si aceptaste o rechazaste las cookies de analítica.", "12 meses"],
  ["roodada-comparar", "Las bicis que marcas para comparar, para no perderlas al cambiar de página.", "Hasta cerrar la pestaña"],
];

const ANALITICA: [string, string, string][] = [
  ["_ga", "Google Analytics: identificador aleatorio para contar visitas y recorridos.", "13 meses"],
  ["_ga_<ID>", "Google Analytics: estado de la visita en curso.", "13 meses"],
];

function Tabla({ filas }: { filas: [string, string, string][] }) {
  return (
    <table className="w-full text-small border-collapse [&_th]:text-left [&_th]:eyebrow [&_th]:pb-1 [&_td]:align-top [&_td]:py-1 [&_td]:pr-2 [&_tr]:border-b [&_tr]:border-border">
      <thead>
        <tr>
          <th scope="col">Nombre</th>
          <th scope="col">Para qué</th>
          <th scope="col">Duración</th>
        </tr>
      </thead>
      <tbody>
        {filas.map(([nombre, para, dura]) => (
          <tr key={nombre}>
            <td className="font-mono break-all">{nombre}</td>
            <td>{para}</td>
            <td>{dura}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function CookiesPage() {
  return (
    <LegalPage title="Cookies" updated="25 de noviembre de 2026">
      <p>
        Las cookies y el almacenamiento del navegador son pequeños datos que una web guarda en tu dispositivo. Roodada usa
        los mínimos: los técnicos, que hacen falta para que la web funcione, y los de analítica, solo si los aceptas.
        No usamos cookies de publicidad.
      </p>

      <h2>Técnicas · no necesitan permiso</h2>
      <p>Se guardan en el almacenamiento de tu navegador, no como cookies, y nunca salen de él.</p>
      <Tabla filas={TECNICAS} />

      <h2>Analítica · solo si aceptas</h2>
      <p>
        Son de Google Analytics (Google Ireland Ltd.). No se cargan hasta que pulsas «Aceptar» y, si rechazas, no se
        guarda ninguna. Las usamos para contar visitas sin tus respuestas de la guía, con las señales de Google y la
        personalización de anuncios desactivadas.
      </p>
      <Tabla filas={ANALITICA} />

      <h2>Medición sin cookies</h2>
      <p>
        Además contamos visitas con Vercel Web Analytics y con un registro propio. Ninguno de los dos guarda nada en tu
        navegador ni te identifica, así que funcionan sin pedirte permiso. Los detalles están en la{" "}
        <Link href="/privacidad">política de privacidad</Link>.
      </p>

      <h2>Al salir a una tienda</h2>
      <p>
        Cuando pulsas un enlace de compra sales de Roodada. Si el enlace es de afiliado, la red de afiliación (por
        ejemplo, Awin) y la tienda pueden guardar sus propias cookies para saber que la compra llegó desde aquí. Son
        suyas y las gestionan con sus políticas de cookies y en sus avisos.
      </p>

      <h2>Cómo cambiar de opinión</h2>
      <p>
        Puedes cambiar tu elección cuando quieras desde «Preferencias de cookies», en el pie de cada página. Si retiras el
        permiso, borramos las cookies de Google Analytics de tu navegador. También puedes borrarlas tú desde los ajustes
        del navegador. Te volvemos a preguntar pasados 12 meses.
      </p>
      {GA_ID && <PreferenciasCookies className="btn justify-self-start" />}
    </LegalPage>
  );
}
