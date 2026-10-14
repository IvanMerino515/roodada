import type { Metadata } from "next";

import { LegalPage } from "@/components/LegalPage";
import { LEGAL, pending } from "@/lib/legal";

export const metadata: Metadata = { title: "Aviso legal", alternates: { canonical: "/aviso-legal" } };

export default function LegalNoticePage() {
  return (
    <LegalPage title="Aviso legal" updated="14 de octubre de 2026">
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

      <h2>Marcas e imágenes</h2>
      <p>
        Los nombres, logotipos y fotos de las bicicletas pertenecen a sus marcas y se muestran solo para identificar
        cada producto. El diseño, los textos y el sistema de recomendación de Roodada pertenecen a su titular.
      </p>
    </LegalPage>
  );
}
