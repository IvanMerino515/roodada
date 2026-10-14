// Pesos del recomendador (aprobados como punto de partida el 2026-10-11). Se ajustan aquí sin tocar la lógica.
import type { LevelKey } from "./questions";
import type { ScoreKey } from "./score";

/** Puntuación = 100 · (talla · T + calidad-precio · V + prioridades · P). Deben sumar 1. */
export const WEIGHTS = { talla: 0.25, valor: 0.2, prioridades: 0.55 } as const;

/** Valor de cada tipo de ajuste de talla */
export const SIZE_FIT_SCORE = { oficial: 1, estimada: 0.8, entre: 0.6 } as const;

/** Peso de una prioridad elegida por el usuario frente a una implícita por su nivel */
export const PRIORITY_WEIGHT = { elegida: 1, implicita: 0.5 } as const;

/**
 * Prioridades según el tipo de Roodador. `base`: las que cuentan si no elige ninguna (novato y curioso
 * nunca eligen). `implicitas`: se suman siempre con peso PRIORITY_WEIGHT.implicita.
 */
export const LEVEL_PRIORITIES: Record<LevelKey, { base: ScoreKey[]; implicitas: ScoreKey[] }> = {
  novato: { base: ["comodidad"], implicitas: ["ahorro"] },
  curioso: { base: ["comodidad", "componentes"], implicitas: [] },
  avanzado: { base: ["componentes", "ligereza"], implicitas: [] },
  experto: { base: ["componentes", "ligereza"], implicitas: ["componentes", "rendimiento"] },
};

/** Multiplicador si la bici supera el presupuesto (dentro de la tolerancia) */
export const OVER_BUDGET_FACTOR = 0.85;

/** Variantes del mismo modelo que pueden aparecer en los resultados: con 3–5 resultados, una */
export const MAX_PER_MODEL = 1;

/** Resultados de la guía: entre 3 y 5. Pasada la 3.ª, solo las que no se alejan más de maxGap puntos de la 1.ª */
export const RESULTS = { min: 3, max: 5, maxGap: 10 } as const;

/** Valor de un dato ausente: no penaliza ni premia */
export const NEUTRAL = 0.5;
