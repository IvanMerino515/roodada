import type { Metadata } from "next";

import { LegalPage } from "@/components/LegalPage";
import { LEGAL, pending } from "@/lib/legal";

export const metadata: Metadata = { title: "Privacidad", alternates: { canonical: "/privacidad" } };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacidad" updated="14 de octubre de 2026">
      <p>
        En corto: Roodada no te pide registrarte, no usa cookies y no guarda quién eres. Lo que medimos es anónimo y
        sirve para mejorar las recomendaciones.
      </p>

      <h2>Responsable</h2>
      <p>
        {pending(LEGAL.titular)} (NIF {pending(LEGAL.nif)}).{" "}
        Contacto: {LEGAL.email ? <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> : pending("")}.
      </p>

      <h2>Qué datos tratamos</h2>
      <ul>
        <li>
          <strong>Tus respuestas de la guía</strong> (tipo de ciclista, presupuesto, uso, altura y, si la das, la
          entrepierna). Viajan en la dirección de la página para calcular tus resultados y poder compartirlos. No las
          guardamos.
        </li>
        <li>
          <strong>Visitas</strong>: contamos qué páginas se visitan con Vercel Web Analytics, que no usa cookies ni
          identifica a nadie. Quitamos de la dirección tus respuestas antes de medir.
        </li>
        <li>
          <strong>Salidas a tiendas</strong>: cuando pulsas un enlace de compra, apuntamos qué oferta era, desde qué
          página de Roodada saliste y el precio de ese momento. Sin tu IP ni ningún identificador.
        </li>
        <li>
          <strong>Datos técnicos</strong>: como cualquier web, el servidor recibe tu IP y la dirección que pides. El
          proveedor de alojamiento los usa para servir la página y por seguridad, y los borra en poco tiempo.
        </li>
      </ul>

      <h2>Para qué y con qué base</h2>
      <p>
        Para que la web funcione y para saber si las recomendaciones sirven (interés legítimo, art. 6.1.f del RGPD). Como
        las mediciones son anónimas y no usamos cookies ni almacenamos nada en tu navegador, no necesitamos pedirte
        consentimiento.
      </p>

      <h2>Proveedores</h2>
      <ul>
        <li>Vercel Inc.: alojamiento y medición de visitas. Puede tratar datos técnicos en EE. UU., con cláusulas contractuales tipo de la Comisión Europea.</li>
        <li>Supabase: base de datos del catálogo y del registro anónimo de salidas, alojada en la Unión Europea (Irlanda).</li>
      </ul>

      <h2>Tus derechos</h2>
      <p>
        Puedes pedir acceso, rectificación, supresión, oposición o limitación escribiendo al contacto de arriba. Como
        no guardamos datos que te identifiquen, normalmente no tendremos nada tuyo. Si crees que no hemos atendido bien
        tu petición, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).
      </p>
    </LegalPage>
  );
}
