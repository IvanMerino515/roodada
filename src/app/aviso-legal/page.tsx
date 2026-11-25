import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/LegalPage";
import { CONTACTO, TITULARES, pending } from "@/lib/legal";

export const metadata: Metadata = { title: "Aviso legal", alternates: { canonical: "/aviso-legal" } };

export default function LegalNoticePage() {
  return (
    <LegalPage title="Aviso legal" updated="25 de noviembre de 2026">
      <h2>Quién está detrás</h2>
      <p>
        Roodada (roodada.com) es un proyecto de dos personas, que son sus titulares (Ley 34/2002 de servicios de la
        sociedad de la información, art. 10):
      </p>
      <ul>
        {TITULARES.map((t) => (
          <li key={t.nif}>
            {t.nombre} · NIF {pending(t.nif)} · {pending(t.domicilio)}
          </li>
        ))}
      </ul>
      <p>
        Contacto para cualquier asunto: <a href={`mailto:${CONTACTO}`}>{CONTACTO}</a>.
      </p>

      <h2>Qué es Roodada</h2>
      <p>
        Roodada es una guía para elegir bicicleta. Compara los datos que publica cada marca (medidas, componentes y
        precio) y recomienda las bicis que encajan con tus respuestas. Roodada no vende bicicletas: los enlaces de
        compra llevan a la web de cada marca o tienda.
      </p>

      <h2>Precios, stock y datos técnicos</h2>
      <p>
        Mostramos el precio y la disponibilidad que publica cada tienda el día que lo comprobamos, y lo indicamos en
        cada ficha. Pueden cambiar sin aviso: el precio y las condiciones que valen son los de la tienda en el momento
        de comprar. Si una marca no publica un dato, lo decimos; nunca lo inventamos. Las tallas marcadas como
        estimadas son una orientación: confírmalas con la tienda.
      </p>

      <h2>Enlaces a otras webs</h2>
      <p>
        Las webs a las que enlazamos son responsabilidad de sus titulares. Roodada no controla su contenido ni sus
        condiciones de venta.
      </p>

      {/* PENDIENTE: revisión del abogado antes del lanzamiento */}
      <h2>Uso de los contenidos y de la base de datos</h2>
      <p>
        Puedes consultar Roodada, enlazar cualquier página y citar sus datos indicando la fuente. Los buscadores y los
        asistentes de inteligencia artificial pueden leerla y citarla con enlace, como indica nuestro archivo robots.txt.
      </p>
      <p>
        Roodada es una base de datos cuya obtención, verificación y presentación han supuesto una inversión sustancial,
        protegida por el derecho sui generis de los artículos 133 a 137 de la Ley de Propiedad Intelectual. Sin permiso
        escrito del titular no está permitido extraer o reutilizar la totalidad o una parte sustancial de su contenido,
        ni hacerlo de forma repetida y sistemática con programas automáticos (scraping, rastreadores no autorizados o
        descargas masivas), para crear otros productos o servicios. Aplicamos límites técnicos para impedirlo.
      </p>

      <h2>Enlaces de afiliado</h2>
      <p>
        Algunos enlaces a tiendas son de afiliado: si compras después de pulsarlos, la tienda puede pagar a Roodada una
        comisión. No cambia tu precio ni el orden de las recomendaciones. Cuando un enlace es de afiliado, lo decimos
        junto al botón. Cómo ordenamos y cómo nos financiamos: <Link href="/transparencia">transparencia</Link>.
      </p>

      <h2>Marcas e imágenes</h2>
      <p>
        Los nombres, logotipos y fotos de las bicicletas pertenecen a sus marcas y se muestran solo para identificar
        cada producto. El diseño, los textos y el sistema de recomendación de Roodada pertenecen a su titular.
      </p>
      <h2>Condiciones de uso</h2>
      <p>
        Usar Roodada es gratis y no necesita registro. Al usarla aceptas no emplearla para nada ilegal ni para dañar la
        web o a otras personas, y respetar el apartado de uso de los contenidos. Ponemos todo el cuidado en que los datos
        sean correctos, pero salen de lo que publica cada marca y tienda y pueden tener errores o haber cambiado:
        compruébalos antes de comprar. Roodada no responde de las compras que hagas en otras webs ni de su contenido. Si
        ves un error, escríbenos y lo corregimos.
      </p>
      <p>
        Estas condiciones se rigen por la ley española. Si eres consumidor, conservas los derechos que te da la ley de tu
        lugar de residencia.
      </p>
    </LegalPage>
  );
}
