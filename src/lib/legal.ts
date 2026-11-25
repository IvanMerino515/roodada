// Datos de los titulares de la web para el aviso legal y la privacidad (LSSI art. 10 y RGPD art. 13).
// Roodada tiene dos titulares (decisión de Iván, 25-11-2026): son corresponsables del tratamiento.
// Un dato vacío se muestra como «[pendiente]»: no se lanza la web mientras quede alguno.
export const TITULARES = [
  { nombre: "Iván Merino Díaz", nif: "11859890D", domicilio: "Calle Virgen de Belén 39, 28019 Madrid" },
  // PENDIENTE: código postal y ciudad de Edgar
  { nombre: "Edgar Ahmed Mora", nif: "50233775G", domicilio: "Calle Antonio López 45, [código postal y ciudad pendientes]" },
] as const;

/** Correo de contacto para todo lo legal: dudas, derechos de privacidad, retirada de contenidos */
export const CONTACTO = "info@roodada.com";

/** Nombres de los titulares en una frase: «Iván Merino Díaz y Edgar Ahmed Mora» */
export const titularesEnFrase = () => TITULARES.map((t) => t.nombre).join(" y ");

export const pending = (v: string) => v || "[pendiente]";

// Aviso junto al botón de compra cuando el enlace es de afiliado (LSSI: identificar la comunicación
// comercial). PENDIENTE: que lo revise el abogado antes de activar la afiliación.
export const AFFILIATE_NOTICE =
  "Si compras desde este enlace, Roodada puede cobrar una comisión. A ti te cuesta lo mismo y no cambia el orden de las recomendaciones.";
