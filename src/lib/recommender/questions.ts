// Las preguntas de la guía, en orden: tipo de Roodador, eléctrica, presupuesto, uso, altura y prioridades.
// Avanzado y experto ven además los usos detallados, la entrepierna (opcional) y las prioridades. Única fuente para el formulario,
// la URL de resultados (?uso=…&electrica=…) y el algoritmo.
import { z } from "zod";

import type { Category, Discipline } from "../catalog/types";

// Quién ve cada uso: el Roodador novato o curioso elige entre pocas opciones amplias;
// el avanzado y el experto, entre las detalladas.
export const USES = {
  carretera: { label: "Carretera", hint: "Asfalto: salidas, puertos y kilómetros", category: "bici-carretera", disciplines: ["competicion", "aero", "triatlon", "endurance"], audience: "basico" },
  "carretera-rapida": { label: "Carretera rápida", hint: "Velocidad, competición, salidas en grupo", category: "bici-carretera", disciplines: ["competicion", "aero", "triatlon"], audience: "detallado" },
  "carretera-comoda": { label: "Carretera larga y cómoda", hint: "Muchos kilómetros sin castigar la espalda", category: "bici-carretera", disciplines: ["endurance"], audience: "detallado" },
  gravel: { label: "Caminos y gravel", hint: "Asfalto y tierra en la misma salida", category: "bici-gravel", disciplines: ["gravel", "ciclocross"], audience: "todos" },
  montana: { label: "Montaña", hint: "Pistas, senderos y monte", category: "bici-mtb", disciplines: ["xc", "trail", "enduro", "descenso"], audience: "basico" },
  "montana-suave": { label: "Montaña suave", hint: "Pistas y senderos fáciles, rodar rápido", category: "bici-mtb", disciplines: ["xc"], audience: "detallado" },
  "montana-tecnica": { label: "Montaña técnica", hint: "Bajadas, raíces y piedras", category: "bici-mtb", disciplines: ["trail", "enduro", "descenso"], audience: "detallado" },
  ciudad: { label: "Ciudad y desplazamientos", hint: "Ir al trabajo, recados, día a día", category: "bici-urbana", disciplines: ["urbana", "cargo"], audience: "todos" },
  paseo: { label: "Viajes y paseos", hint: "Rutas tranquilas, cicloturismo", category: "bici-urbana", disciplines: ["trekking"], audience: "todos" },
  infantil: { label: "Para un niño o niña", hint: "Según su altura", category: "bici-infantil", disciplines: ["infantil"], audience: "todos" },
} as const satisfies Record<string, { label: string; hint: string; category: Category; disciplines: Discipline[]; audience: "basico" | "detallado" | "todos" }>;

export type UseKey = keyof typeof USES;

export const ELECTRIC = { si: "Sí, eléctrica", no: "No, sin motor", igual: "Me da igual" } as const;
export type ElectricKey = keyof typeof ELECTRIC;

/** Tipo de Roodador (bicicletero). Cuanto más experto, más detalle se le pregunta. */
export const LEVELS = {
  novato: { label: "Roodador novato", hint: "Todavía te cuesta quitarte los ruedines: sabes montar en bici, pero entras desde cero." },
  curioso: { label: "Roodador curioso", hint: "Te empieza a picar el gusanillo: ya has rodado alguna vez y tienes ganas de hacer más rutas." },
  avanzado: { label: "Roodador avanzado", hint: "Sales 2 o 3 veces por semana, sabes lo que es un KOM/QOM y quieres mejorar lo que tienes en casa." },
  experto: { label: "Roodador experto", hint: "En tu grupeta partes el bacalao, compites y en las marchas miras a los pros de tú a tú." },
} as const;
export type LevelKey = keyof typeof LEVELS;

/** Avanzado y experto: usos detallados, prioridades y entrepierna */
export const isDetailed = (nivel: LevelKey) => nivel === "avanzado" || nivel === "experto";

export function usesFor(nivel: LevelKey): UseKey[] {
  const want = isDetailed(nivel) ? "detallado" : "basico";
  return (Object.keys(USES) as UseKey[]).filter((k) => USES[k].audience === "todos" || USES[k].audience === want);
}

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
/** Presupuesto solo para la bici (en el futuro, accesorios aparte) */
export const BUDGET = { min: 200, max: 15000, step: 100, tolerance: 0.1 } as const;
export const HEIGHT = { min: 90, max: 215 } as const;
/** Entrepierna: opcional, solo para avanzado y experto */
export const INSEAM = { min: 40, max: 110 } as const;

const keys = <T extends object>(o: T) => Object.keys(o) as [keyof T & string, ...(keyof T & string)[]];

export const answersSchema = z.object({
  uso: z.enum(keys(USES)),
  electrica: z.enum(keys(ELECTRIC)),
  presupuesto: z.coerce.number().int().min(BUDGET.min).max(BUDGET.max),
  altura: z.coerce.number().int().min(HEIGHT.min).max(HEIGHT.max),
  nivel: z.enum(keys(LEVELS)),
  prioridades: z.array(z.enum(keys(PRIORITIES))).max(MAX_PRIORITIES),
  entrepierna: z.coerce.number().int().min(INSEAM.min).max(INSEAM.max).optional(),
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
    entrepierna: one(params.entrepierna) || undefined,
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
  if (a.entrepierna) p.set("entrepierna", String(a.entrepierna));
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
