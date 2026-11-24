import type { Metadata } from "next";

import { LegalPage } from "@/components/LegalPage";
import { LEGAL, pending } from "@/lib/legal";

export const metadata: Metadata = { title: "Aviso legal", alternates: { canonical: "/aviso-legal" } };

export default function LegalNoticePage() {
  return (
    <LegalPage title="Aviso legal" updated="24 de noviembre de 2026">
      <h2>Quién está detrás</h2>
      <ul>
        <li>Titular: {pending(LEGAL.titular)}</li>
        <li>NIF: {pending(LEGAL.nif)}</li>
        <li>Domicilio: {pending(LEGAL.domicilio)}</li>
        <li>Contacto: {LEGAL.email ? <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> : pending("")}</li>
      </ul>

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

      <h2>Marcas e imágenes</h2>
      <p>
        Los nombres, logotipos y fotos de las bicicletas pertenecen a sus marcas y se muestran solo para identificar
        cada producto. El diseño, los textos y el sistema de recomendación de Roodada pertenecen a su titular.
      </p>
    </LegalPage>
  );
}
