import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/LegalPage";
import { CONTACTO } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Cómo ordenamos y cómo nos financiamos",
  description: "Qué decide el orden de las bicis en Roodada, de dónde salen los precios y cómo ganamos dinero.",
  alternates: { canonical: "/transparencia" },
};

// Información sobre los parámetros de clasificación (Ley General para la Defensa de los Consumidores,
// art. 20, tras la directiva Ómnibus) y sobre la afiliación. Si cambia la lógica de src/lib/recommender
// o los pesos de score_formulas, revisar esta página (y docs/RECOMENDADOR.md).
export default function TransparencyPage() {
  return (
    <LegalPage title="Cómo ordenamos y cómo nos financiamos" updated="25 de noviembre de 2026">
      <p>
        En corto: el orden lo deciden tus respuestas y los datos de cada bici. Nadie paga por salir antes, y las
        comisiones no cuentan para ordenar.
      </p>

      <h2>Cómo ordena la guía</h2>
      <ol className="grid gap-1 pl-3 list-decimal">
        <li>
          Quitamos las bicis que no encajan: otro uso, eléctrica o no según lo que pidas, más de un 10 % por encima de tu
          presupuesto, sin stock o sin una talla para tu altura.
        </li>
        <li>
          Puntuamos las que quedan: la talla (25 %), la nota calidad-precio (20 %) y lo que más te importa (55 %:
          comodidad, ligereza, componentes, autonomía…, según tu tipo de ciclista y lo que elijas). Si se pasa de tu
          presupuesto, baja un 15 %.
        </li>
        <li>Te enseñamos de 3 a 5, una por modelo, con lo que tienen a favor y en contra frente a las demás.</li>
      </ol>

      <h2>Cómo se calcula la nota calidad-precio</h2>
      <p>
        Es una nota de 0 a 10 que compara cada bici con las de su mismo tipo: componentes (30 %), precio (25 %), material
        del cuadro (20 %) y peso (15 %). Si falta un dato, cuenta como término medio y lo indicamos en la ficha. En bicis
        infantiles no la mostramos.
      </p>

      <h2>Cómo ordena el comparador y las páginas de tipos y marcas</h2>
      <p>
        Por defecto, por la nota calidad-precio. Puedes cambiar el orden (precio, peso…) y los filtros. En las páginas de
        tipos, precios y marcas destacamos las de mejor nota que están a la venta.
      </p>

      <h2>De dónde salen los precios</h2>
      <p>
        De la web oficial de cada marca o tienda, el día que lo comprobamos, que indicamos en cada ficha. Cuando mostramos
        una rebaja, el precio anterior es el que la propia tienda publica como precio anterior. El precio y las
        condiciones que valen son los de la tienda en el momento de comprar.
      </p>

      <h2>Cómo nos financiamos</h2>
      <p>
        Roodada es gratis para ti. Algunos enlaces a tiendas son de afiliado: si compras después de pulsarlos, la tienda
        nos paga una pequeña comisión. Te cuesta lo mismo y lo indicamos junto al botón de compra. Las comisiones no
        cuentan para el orden: el recomendador y la nota calidad-precio no saben qué enlaces son de afiliado. No
        aceptamos pagos de marcas o tiendas por aparecer ni por subir posiciones.
      </p>
      <p>
        ¿Ves algo que no cuadra? Escríbenos a <a href={`mailto:${CONTACTO}`}>{CONTACTO}</a>. Más detalles legales en el{" "}
        <Link href="/aviso-legal">aviso legal</Link>.
      </p>
    </LegalPage>
  );
}
