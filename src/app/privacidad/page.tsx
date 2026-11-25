import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/LegalPage";
import { CONTACTO, TITULARES, pending, titularesEnFrase } from "@/lib/legal";

export const metadata: Metadata = { title: "Privacidad", alternates: { canonical: "/privacidad" } };

// PENDIENTE: revisión del abogado antes de activar la afiliación
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacidad" updated="25 de noviembre de 2026">
      <p>
        En corto: Roodada no te pide registrarte ni guarda quién eres. Nuestra medición propia es anónima y no usa
        cookies. Google Analytics solo se activa si lo aceptas en el aviso de cookies.
      </p>

      <h2>Responsables</h2>
      <p>
        {titularesEnFrase()}, titulares de Roodada, son corresponsables del tratamiento y responden por igual de tus
        datos:
      </p>
      <ul>
        {TITULARES.map((t) => (
          <li key={t.nif}>
            {t.nombre} · NIF {pending(t.nif)} · {pending(t.domicilio)}
          </li>
        ))}
      </ul>
      <p>
        Para cualquier cuestión de privacidad, escribe a <a href={`mailto:${CONTACTO}`}>{CONTACTO}</a>. Te responde
        cualquiera de los dos.
      </p>

      <h2>Qué datos tratamos y para qué</h2>
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
          <strong>Uso de la web</strong>: apuntamos qué páginas y fichas se ven, cómo se responde la guía (el presupuesto
          y la altura, por tramos: «2.000–2.999 €», «170–174 cm»), qué filtros se usan, qué bicis se recomiendan o se
          comparan y de qué web o campaña se llega (solo el dominio y las etiquetas utm). Para unir los pasos de una misma
          visita usamos un número aleatorio que solo existe mientras la pestaña está abierta: no se guarda en tu navegador
          ni sirve para saber quién eres. Si tu navegador pide no ser seguido (Global Privacy Control o Do Not Track), no
          apuntamos nada.
        </li>
        <li>
          <strong>Salidas a tiendas</strong>: cuando pulsas un enlace de compra, apuntamos qué oferta era, desde qué
          página de Roodada saliste y el precio de ese momento. Sin tu IP ni ningún identificador.
        </li>
        <li>
          <strong>Google Analytics, solo si lo aceptas</strong>: guarda en tu navegador un identificador aleatorio
          (cookies _ga, 13 meses) para contar visitas y recorridos. Le enviamos la dirección de cada página sin
          parámetros, así que nunca recibe tus respuestas de la guía. Tenemos desactivadas las señales de Google y la
          personalización de anuncios, y los datos se borran a los 2 meses. Google usa tu IP para saber el país y la
          ciudad aproximada y no la guarda.
        </li>
        <li>
          <strong>Bicis que marcas para comparar</strong>: se guardan solo en tu navegador mientras dura la visita
          (almacenamiento de sesión), para no perderlas al cambiar de página. No nos llegan y se borran al cerrar la
          pestaña.
        </li>
        <li>
          <strong>Correos que nos escribes</strong>: tu dirección y lo que nos cuentes, solo para responderte.
        </li>
        <li>
          <strong>Datos técnicos</strong>: como cualquier web, el servidor recibe tu IP y la dirección que pides. El
          proveedor de alojamiento los usa para servir la página y por seguridad (por ejemplo, para frenar abusos), y los
          borra en poco tiempo.
        </li>
      </ul>

      <h2>Enlaces de afiliado</h2>
      <p>
        Algunos enlaces de compra pasan por una red de afiliación (por ejemplo, Awin) antes de llegar a la tienda. Al
        pulsarlos sales de Roodada: la red y la tienda pueden guardar cookies en su propia web para saber que la compra
        llegó desde aquí y pagarnos la comisión. Lo hacen como responsables de su propio tratamiento y con sus políticas
        de privacidad y cookies. A nosotros solo nos llegan cifras de ventas y comisiones, nunca quién compró.
      </p>

      <h2>Con qué base legal</h2>
      <ul>
        <li>
          Medición anónima, salidas a tiendas, datos técnicos y seguridad: nuestro interés legítimo en que la web
          funcione, sea segura y recomiende bien (art. 6.1.f del RGPD).
        </li>
        <li>
          Google Analytics: tu consentimiento (art. 6.1.a del RGPD y art. 22.2 de la LSSI). Puedes retirarlo cuando
          quieras desde «Preferencias de cookies», en el pie de página.
        </li>
        <li>Correos: atender lo que nos pides (art. 6.1.b del RGPD).</li>
      </ul>

      <h2>Cuánto tiempo</h2>
      <p>
        Google Analytics: 2 meses. Correos: lo que tardemos en resolver tu consulta y, después, solo lo que obliguen las
        leyes. La medición propia y las salidas a tiendas no identifican a nadie.
      </p>

      <h2>Proveedores</h2>
      <ul>
        <li>
          Vercel Inc.: alojamiento y medición de visitas. Puede tratar datos técnicos en EE. UU., con cláusulas
          contractuales tipo de la Comisión Europea.
        </li>
        <li>
          Supabase: base de datos del catálogo y del registro anónimo de uso y de salidas, alojada en la Unión Europea
          (Irlanda).
        </li>
        <li>
          Google Ireland Ltd.: Google Analytics, solo con tu consentimiento. Puede transferir datos a EE. UU. al amparo
          del Marco de Privacidad de Datos UE-EE. UU.
        </li>
        <li>IONOS: correo electrónico, en la Unión Europea.</li>
      </ul>
      <p>No vendemos ni cedemos datos a nadie más.</p>

      <h2>Tus derechos</h2>
      <p>
        Puedes pedir acceso, rectificación, supresión, oposición, limitación o portabilidad escribiendo a{" "}
        <a href={`mailto:${CONTACTO}`}>{CONTACTO}</a>. Como no guardamos datos que te identifiquen, normalmente no
        tendremos nada tuyo salvo tus correos. Si crees que no hemos atendido bien tu petición, puedes reclamar ante la
        Agencia Española de Protección de Datos (aepd.es).
      </p>
      <p>
        Más detalle sobre lo que se guarda en tu navegador: <Link href="/cookies">política de cookies</Link>.
      </p>
    </LegalPage>
  );
}
