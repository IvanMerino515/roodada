// Datos del titular de la web para el aviso legal y la privacidad (LSSI art. 10 y RGPD art. 13).
// PENDIENTE: rellenarlos antes de publicar; mientras falte alguno, las páginas lo dicen en claro.
export const LEGAL = {
  titular: "",
  nif: "",
  domicilio: "",
  email: "",
} as const;

export const pending = (v: string) => v || "[pendiente]";
