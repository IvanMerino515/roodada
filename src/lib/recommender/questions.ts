// Las 6 preguntas de la guía (docs/data/ANALISIS.md §6). Única fuente para el formulario,
// la URL de resultados (?uso=…&electrica=…) y el algoritmo.
import { z } from "zod";

import type { Category, Discipline } from "../catalog/types";

export const USES = {
  "carretera-rapida": { label: "Carretera rápida", hint: "Velocidad, competición, salidas en grupo", category: "bici-carretera", disciplines: ["competicion", "aero", "triatlon"] },
  "carretera-comoda": { label: "Carretera larga y cómoda", hint: "Muchos kilómetros sin castigar la espalda", category: "bici-carretera", disciplines: ["endurance"] },
  gravel: { label: "Caminos y gravel", hint: "Asfalto y tierra en la misma salida", category: "bici-gravel", disciplines: ["gravel", "ciclocross"] },
  "montana-suave": { label: "Montaña suave", hint: "Pistas y senderos fáciles, rodar rápido", category: "bici-mtb", disciplines: ["xc"] },
  "montana-tecnica": { label: "Montaña técnica", hint: "Bajadas, raíces y piedras", category: "bici-mtb", disciplines: ["trail", "enduro", "descenso"] },
  ciudad: { label: "Ciudad y desplazamientos", hint: "Ir al trabajo, recados, día a día", category: "bici-urbana", disciplines: ["urbana", "cargo"] },
  paseo: { label: "Viajes y paseos", hint: "Rutas tranquilas, cicloturismo", category: "bici-urbana", disciplines: ["trekking"] },
  infantil: { label: "Para un niño o niña", hint: "Según su altura", category: "bici-infantil", disciplines: ["infantil"] },
} as const satisfies Record<string, { label: string; hint: string; category: Category; disciplines: Discipline[] }>;

export type UseKey = keyof typeof USES;

export const ELECTRIC = { si: "Sí, eléctrica", no: "No, sin motor", igual: "Me da igual" } as const;
export type ElectricKey = keyof typeof ELECTRIC;

export const LEVELS = {
  empiezo: { label: "Empiezo", hint: "Salgo poco o vuelvo después de años" },
  habitual: { label: "Salgo a menudo", hint: "Varias veces al mes" },
  compito: { label: "Compito o entreno en serio", hint: "Busco rendimiento" },
} as const;
export type LevelKey = keyof typeof LEVELS;

export const PRIORITIES = {
  comodidad: { label: "Comodidad", hint: "Postura más erguida" },
  ligereza: { label: "Ligereza", hint: "Menos kilos que mover" },
  componentes: { label: "Mejores componentes", hint: "Cambio y frenos de gama alta" },
  ahorro: { label: "Gastar lo menos posible", hint: "Dejar margen en el presupuesto" },
  versatilidad: { label: "Versatilidad", hint: "Cubiertas anchas, sirve para más terrenos" },
  autonomia: { label: "Autonomía", hint: "Batería grande", onlyElectric: true },
  ciudad: { label: "Lista para ciudad", hint: "Luces, guardabarros, portabultos, caballete", onlyUses: ["ciudad", "paseo"] },
} as const;
export type PriorityKey = keyof typeof PRIORITIES;

export const MAX_PRIORITIES = 2;
export const BUDGET = { min: 200, max: 15000, step: 100, tolerance: 0.1 } as const;
export const HEIGHT = { min: 90, max: 215 } as const;

const keys = <T extends object>(o: T) => Object.keys(o) as [keyof T & string, ...(keyof T & string)[]];

export const answersSchema = z.object({
  uso: z.enum(keys(USES)),
  electrica: z.enum(keys(ELECTRIC)),
  presupuesto: z.coerce.number().int().min(BUDGET.min).max(BUDGET.max),
  altura: z.coerce.number().int().min(HEIGHT.min).max(HEIGHT.max),
  nivel: z.enum(keys(LEVELS)),
  prioridades: z.array(z.enum(keys(PRIORITIES))).max(MAX_PRIORITIES),
});

export type Answers = z.infer<typeof answersSchema>;

/** Lee las respuestas de la URL. Devuelve null si falta o sobra algo (se vuelve a la guía). */
export function parseAnswers(params: Record<string, string | string[] | undefined>): Answers | null {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const prioridades = one(params.prioridades);
  const parsed = answersSchema.safeParse({
    uso: one(params.uso),
    electrica: one(params.electrica),
    presupuesto: one(params.presupuesto),
    altura: one(params.altura),
    nivel: one(params.nivel),
    prioridades: prioridades ? prioridades.split(",").filter(Boolean) : [],
  });
  return parsed.success ? parsed.data : null;
}

export function answersToSearch(a: Answers): string {
  const p = new URLSearchParams({
    uso: a.uso,
    electrica: a.electrica,
    presupuesto: String(a.presupuesto),
    altura: String(a.altura),
    nivel: a.nivel,
  });
  if (a.prioridades.length) p.set("prioridades", a.prioridades.join(","));
  return p.toString();
}

/** Prioridades que tienen sentido para estas respuestas (autonomía solo con eléctricas, etc.) */
export function availablePriorities(uso: UseKey, electrica: ElectricKey): PriorityKey[] {
  return (Object.keys(PRIORITIES) as PriorityKey[]).filter((k) => {
    const p = PRIORITIES[k] as { onlyElectric?: boolean; onlyUses?: readonly string[] };
    if (p.onlyElectric && electrica === "no") return false;
    if (p.onlyUses && !p.onlyUses.includes(uso)) return false;
    return true;
  });
}
