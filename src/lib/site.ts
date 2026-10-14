// Ajustes del sitio que dependen del entorno.

/** Modo prueba (ROODADA_MODO_PRUEBA=1): la web no se deja indexar mientras la prueban los testers. Ver next.config.ts. */
export const MODO_PRUEBA = process.env.ROODADA_MODO_PRUEBA === "1";
