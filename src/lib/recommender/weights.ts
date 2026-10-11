// Pesos del recomendador (aprobados como punto de partida el 2026-10-11). Se ajustan aquí sin tocar la lógica.

/** Puntuación = 100 · (talla · T + calidad-precio · V + prioridades · P). Deben sumar 1. */
export const WEIGHTS = { talla: 0.25, valor: 0.2, prioridades: 0.55 } as const;

/** Valor de cada tipo de ajuste de talla */
export const SIZE_FIT_SCORE = { oficial: 1, estimada: 0.8, entre: 0.6 } as const;

/** Peso de una prioridad elegida por el usuario frente a una implícita por su nivel */
export const PRIORITY_WEIGHT = { elegida: 1, implicita: 0.5 } as const;

/** Si no elige ninguna prioridad */
export const DEFAULT_PRIORITIES = ["componentes", "comodidad"] as const;

/** Multiplicador si la bici supera el presupuesto (dentro de la tolerancia) */
export const OVER_BUDGET_FACTOR = 0.85;

/** Variantes del mismo modelo que pueden aparecer en los resultados */
export const MAX_PER_MODEL = 2;

/** Valor de un dato ausente: no penaliza ni premia */
export const NEUTRAL = 0.5;
