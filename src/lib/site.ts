// Ajustes del sitio que dependen del entorno.

/**
 * ¿Se impide indexar esta web? (cabecera X-Robots-Tag, meta robots y robots.txt). Roodada se lanzó el
 * 25-11-2026: en Vercel, la producción (roodada.com) siempre se deja indexar y las previews nunca, sin
 * depender de ninguna variable. Fuera de Vercel (en local) manda ROODADA_MODO_PRUEBA=1.
 */
export const MODO_PRUEBA = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV !== "production"
  : process.env.ROODADA_MODO_PRUEBA === "1";
