// Datos del titular de la web para el aviso legal y la privacidad (LSSI art. 10 y RGPD art. 13).
// PENDIENTE: rellenarlos antes de publicar; mientras falte alguno, las páginas lo dicen en claro.
export const LEGAL = {
  titular: "",
  nif: "",
  domicilio: "",
  email: "",
} as const;

export const pending = (v: string) => v || "[pendiente]";

// Aviso junto al botón de compra cuando el enlace es de afiliado (LSSI: identificar la comunicación
// comercial). PENDIENTE: que lo revise el abogado antes de activar la afiliación.
export const AFFILIATE_NOTICE =
  "Si compras desde este enlace, Roodada puede cobrar una comisión. A ti te cuesta lo mismo y no cambia el orden de las recomendaciones.";
