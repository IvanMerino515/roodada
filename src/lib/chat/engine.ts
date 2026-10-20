// Motor del chat de la guía: decide qué responder a cada mensaje. Funciones puras, sin red ni IA:
// lee el texto (extract.ts), apunta los datos, da un consejo parcial si toca y pregunta lo que falta
// (como mucho 3 datos por turno). No cierra la recomendación sin los datos mínimos del perfil.
import { answersToSearch, type Answers, type LevelKey, type PriorityKey, type UseKey } from "../recommender/questions";
import { explainTerm, finalRecommendation, LEVEL_LABEL, partialTip, profileProse, slotPhrase, summary, USE_REACTION } from "./advice";
import { extract, isAffirmative, norm, SLOT_WORDS } from "./extract";
import type { BotMessage, ChatState, Level, SlotKey, Slots } from "./types";

const LEVELS: Level[] = ["novato", "curioso", "avanzado", "pro"];

/** Datos por grupos de preguntas relacionadas (máximo 3). Cada nivel suma un grupo. */
const GROUPS: SlotKey[][] = [
  ["uso", "presupuesto", "electrica"],
  ["duracion", "altura"],
  ["material", "cambio"],
  ["usoConcreto", "desarrollo", "peso"],
  ["necesidades"],
];

/** Datos mínimos según el nivel. En infantil solo uso, presupuesto y altura. */
export function required(s: Slots): SlotKey[] {
  if (!s.nivel) return ["nivel"];
  const keys = GROUPS.slice(0, 2 + LEVELS.indexOf(s.nivel)).flat();
  return s.uso === "infantil" ? keys.filter((k) => k === "uso" || k === "presupuesto" || k === "altura") : keys;
}

export const missing = (s: Slots): SlotKey[] => required(s).filter((k) => s[k] === undefined);

const GROUP_NAMES = ["Tu bici", "Tus salidas", "Gustos", "Al detalle", "Lo tuyo"];

/** Etapas de la conversación, como un perfil de etapa: perfil, un tramo por grupo de datos y meta. */
export function stages(s: Slots, phase: ChatState["phase"]): { name: string; done: boolean; current: boolean }[] {
  const need = new Set(missing(s));
  const groups = s.nivel ? GROUPS.slice(0, 2 + LEVELS.indexOf(s.nivel)) : [];
  const list = [
    { name: "Perfil", done: !!s.nivel },
    ...groups
      .map((g, i) => ({ g: g.filter((k) => required(s).includes(k)), name: GROUP_NAMES[i] }))
      .filter((x) => x.g.length)
      .map((x) => ({ name: x.name, done: x.g.every((k) => !need.has(k)) })),
    { name: "Meta", done: phase === "final" },
  ];
  const cur = list.findIndex((x) => !x.done);
  return list.map((x, i) => ({ ...x, current: i === cur }));
}

/** Lo siguiente que se pregunta: los datos que faltan del primer grupo incompleto. */
export function nextQuestions(s: Slots): SlotKey[] {
  const need = missing(s);
  if (need.includes("nivel")) return ["nivel"];
  for (const g of GROUPS) {
    const m = g.filter((k) => need.includes(k));
    if (m.length) return m;
  }
  return [];
}

/** Datos imprescindibles para recomendar (además de los del perfil): sin ellos nunca se cierra. */
export const canClose = (s: Slots) => !!s.nivel && !!s.uso && !!s.presupuesto && !!s.altura && missing(s).length === 0;

export function start(): { state: ChatState; messages: BotMessage[] } {
  return {
    state: { slots: {}, phase: "perfil", pending: ["nivel"], said: [], turn: 0 },
    messages: [
      { role: "bot", paragraphs: ["¡Hola! Soy Radio, el asistente de Roodada. Te ayudo a elegir bici hablando, sin formularios."] },
      {
        role: "bot",
        paragraphs: ["Para empezar, ¿cómo te definirías como ciclista? Novato, curioso, avanzado, pro… o cuéntamelo con tus palabras."],
        chips: ["Novato: empiezo de cero", "Curioso: salgo de vez en cuando", "Avanzado: salgo varias veces por semana", "Pro: compito", "No sé cuál soy"],
      },
    ],
  };
}

const OPEN_NAMES: Partial<Record<SlotKey, string>> = {
  electrica: "lo de eléctrica", material: "el material", cambio: "el cambio", desarrollo: "los desarrollos", peso: "el peso",
};
const OPENERS = ["Apuntado", "Hecho", "Vale", "Me lo apunto"];
const LEVEL_INTRO: Record<Level, string> = {
  novato: "Empezamos desde cero: te iré explicando cada palabra rara.",
  curioso: "Ya tienes algo de rodaje: te preguntaré un par de cosas más técnicas, sin agobiar.",
  avanzado: "Iremos al detalle: uso concreto, desarrollos y peso.",
  pro: "Hablamos el mismo idioma. Iré al grano y al final te dejo un hueco para lo que necesites.",
};

/** Ejemplos de respuesta: solo orientan, siempre se puede escribir otra cosa. */
const CHIPS: Partial<Record<SlotKey, string[]>> = {
  uso: ["Carretera", "Caminos y gravel", "Montaña", "Ir al trabajo", "Paseo", "Para mi hijo", "No lo tengo claro"],
  presupuesto: ["Unos 800 €", "Unos 1.500 €", "Unos 3.000 €", "No lo sé"],
  electrica: ["Eléctrica", "Sin motor", "Me da igual"],
  duracion: ["Menos de 1 hora", "1-2 horas", "Toda la mañana"],
  material: ["Aluminio", "Carbono", "Acero", "No lo tengo claro"],
  cambio: ["Mecánico", "Electrónico", "Me da igual"],
  usoConcreto: ["Competición", "Triatlón", "Descensos", "Entrenamiento", "Cicloturismo", "Bikepacking", "Ir al trabajo"],
  desarrollo: ["Suaves para subir puertos", "Largos para llano", "Monoplato 1x", "Doble plato 2x", "No lo sé"],
  peso: ["Lo más ligera posible", "Menos de 8 kg", "Menos de 10 kg", "Me da igual el peso"],
  necesidades: ["Nada más"],
};

/** Sugerencias del campo libre del Roodador pro */
export const NEEDS_SUGGESTIONS = [
  "Potenciómetro de serie", "Ruedas y cubiertas tubeless", "Tija telescópica", "Patilla UDH", "Paso de rueda ancho (45 mm o más)",
  "Anclajes para bolsas y portabultos", "Manillar integrado aero", "Medidas de cuadro concretas (stack y reach)", "Peso máximo admitido alto",
  "Compatibilidad con rodillo inteligente", "Bielas más cortas", "Guardabarros y luces", "Batería extraíble", "Freno de disco de 160 mm delante",
];

function question(k: SlotKey, s: Slots): string {
  const novice = s.nivel === "novato";
  switch (k) {
    case "nivel": return "¿Cómo te definirías como ciclista: novato, curioso, avanzado o pro?";
    case "uso":
      return s.usoDuda
        ? "Sin problema, lo vemos juntos: ¿qué tienes cerca de casa y te apetece más, carreteras, caminos de tierra, monte con piedras o moverte por la ciudad?"
        : "¿Por dónde te ves rodando: asfalto, caminos de tierra, monte, ciudad… o es para un niño?";
    case "presupuesto": return "¿Cuánto te quieres gastar más o menos, solo en la bici?";
    case "electrica": return novice ? "¿La quieres eléctrica (un motor te ayuda cuando pedaleas) o sin motor?" : "¿Eléctrica o sin motor?";
    case "duracion": return "¿Cuánto suelen durar tus salidas, o cuánto te gustaría que duraran?";
    case "altura": return s.uso === "infantil" ? "¿Cuánto mide el niño o la niña? Con eso sé el tamaño de rueda." : "¿Cuánto mides? Con eso afino la talla.";
    case "material": return "¿Te interesa algún material de cuadro? Aluminio (resistente y económico), carbono (más ligero y caro), acero, titanio…";
    case "cambio": return "¿Y el cambio: mecánico (por cable, fácil de arreglar) o electrónico (con botones, más preciso y caro)?";
    case "usoConcreto": return "¿Para qué la vas a usar en concreto: competir, triatlón, descensos, entrenar, cicloturismo, bikepacking, ir al trabajo…?";
    case "desarrollo": return "¿Qué desarrollos buscas? Por ejemplo, suaves para puertos, largos para llano, monoplato (1x) o doble plato (2x).";
    case "peso": return "¿Tienes en mente un peso de bici o un máximo que no quieras pasar?";
    case "necesidades": return "¿Algo concreto que no te haya preguntado? Escríbelo tal cual: potenciómetro, tubeless, medidas de cuadro… Si no, dime «nada más».";
  }
}

function help(k: SlotKey, s: Slots): string | null {
  switch (k) {
    case "nivel":
      return "Te ayudo: novato, si empiezas de cero; curioso, si ya has rodado y quieres hacer más rutas; avanzado, si sales 2 o 3 veces por semana y quieres mejorar; pro, si compites o vas a tope en la grupeta.";
    case "uso":
      return "Piensa por dónde vas a rodar más: asfalto (carretera), caminos de tierra (gravel), monte con piedras y raíces (MTB), ir al trabajo (ciudad) o rutas tranquilas (paseo).";
    case "presupuesto":
      return "Para orientarte: hasta 600 € hay bicis sencillas para empezar; entre 800 y 1.500 €, muy buena relación calidad-precio; de 1.500 a 3.000 €, gama media-alta; y por encima, gama alta. Las eléctricas cuestan bastante más.";
    case "duracion":
      return "Por ejemplo: «media hora para ir al trabajo», «un par de horas el finde» o «toda la mañana». Si no sales todavía, dime cuánto te gustaría.";
    case "altura":
      return `La necesito para ${s.uso === "infantil" ? "el tamaño de rueda" : "la talla"}: una talla equivocada molesta más que una pieza peor. Vale aproximada, por ejemplo «1,72 m».`;
    case "usoConcreto":
      return "Por ejemplo: «competir en carreras de XC», «entrenar para marchas», «viajar con alforjas» o «bajar en bike park».";
    default:
      return null;
  }
}

/** Respuesta «no sé / me da igual» que ya vale como dato (se deja abierto y se propone lo que mejor salga). */
function openAnswer(k: SlotKey): Partial<Slots> | null {
  switch (k) {
    case "electrica": return { electrica: "igual" };
    case "material": return { material: "indiferente" };
    case "cambio": return { cambio: "indiferente" };
    case "desarrollo": return { desarrollo: { kind: "indiferente" } };
    case "peso": return { peso: { indifferent: true, text: "sin preferencia" } };
    case "necesidades": return { necesidades: [] };
    default: return null;
  }
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function joinEs(items: string[]): string {
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} y ${items.at(-1)}`;
}

/** Bloque de preguntas (máximo 3) con ejemplos del primer dato. */
function ask(keys: SlotKey[], s: Slots, prefix?: string): BotMessage {
  const qs = keys.slice(0, 3).map((k) => question(k, s));
  const paragraphs = prefix ? [prefix, ...qs] : qs;
  const first = keys[0];
  const chips = first === "uso" && s.usoDuda ? ["Carreteras", "Caminos de tierra", "Monte", "Ciudad"] : CHIPS[first];
  return { role: "bot", paragraphs, chips, autocomplete: first === "necesidades" };
}

function confirmMessage(s: Slots): BotMessage[] {
  return [
    { role: "bot", paragraphs: ["¡Ya lo tengo!", profileProse(s)], summary: summary(s) },
    { role: "bot", paragraphs: ["¿Lo he pillado bien? Si algo no cuadra, dímelo con tus palabras (por ejemplo, «mejor hasta 2.000 €»)."], chips: ["Sí, búscame bicis", "Cambiar algo"] },
  ];
}

function finalMessages(s: Slots): BotMessage[] {
  return [{ role: "bot", paragraphs: ["Vamos allá. Busco en el catálogo las bicis que mejor te encajan…"], final: finalRecommendation(s), fetchPicks: true }];
}

/** Responde a un mensaje. Devuelve el estado nuevo (no modifica el anterior) y los mensajes del asistente. */
export function reply(prev: ChatState, text: string): { state: ChatState; messages: BotMessage[]; changed: (keyof Slots)[] } {
  const state: ChatState = { ...prev, slots: { ...prev.slots }, said: [...prev.said], turn: prev.turn + 1 };
  const s = state.slots;
  const t = norm(text);
  const ex = extract(text, prev.pending);

  // Un nivel deducido de pistas no pisa uno ya dicho
  if (ex.levelInferred && s.nivel) delete ex.patch.nivel;

  const changed: (keyof Slots)[] = [];
  for (const [k, v] of Object.entries(ex.patch) as [keyof Slots, unknown][]) {
    if (k === "usosExtra") continue;
    if (!same(s[k], v)) {
      (s as Record<string, unknown>)[k] = v;
      changed.push(k);
    }
  }
  if (ex.patch.uso) {
    s.usosExtra = ex.patch.usosExtra;
    s.usoDuda = false;
  }

  // «No sé»: en los datos que lo admiten, se deja abierto; en el resto, se ayuda con ejemplos
  const helps: string[] = [];
  const opened: SlotKey[] = [];
  for (const k of ex.doubtSlots) {
    if (ex.patch[k] !== undefined || !required(s).includes(k)) continue;
    const open = openAnswer(k);
    if (open && s[k] === undefined) {
      Object.assign(s, open);
      changed.push(k);
      opened.push(k);
    } else if (k === "uso" && !s.uso) {
      s.usoDuda = true;
    } else if (s[k] === undefined) {
      const h = help(k, s);
      if (h) helps.push(h);
    }
  }

  // «Cambiar el presupuesto» (sin decir cuánto): se borra el dato y se vuelve a preguntar
  const wantsChange = /\b(cambi\w*|corrig\w*|modific\w*|otr[oa] cosa|no es asi|me he equivocado)\b/.test(t);
  const toClear = wantsChange
    ? (Object.keys(SLOT_WORDS) as SlotKey[]).filter((k) => k !== "nivel" && SLOT_WORDS[k]!.test(t) && !changed.includes(k) && s[k] !== undefined)
    : [];
  if (/\b(cambi\w*|otro) (de )?(nivel|perfil)\b/.test(t)) toClear.push("nivel");
  for (const k of toClear) delete s[k];

  const intro: string[] = [];
  const term = explainTerm(t);

  const ORDER: (keyof Slots)[] = ["nivel", "uso", "usoConcreto", "presupuesto", "electrica", "duracion", "altura", "material", "cambio", "desarrollo", "peso", "necesidades"];
  const phrases = [...changed]
    .sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b))
    .filter((k) => (k !== "nivel" || !ex.levelInferred) && !opened.includes(k as SlotKey))
    .map((k) => slotPhrase(s, k))
    .filter((p): p is string => !!p);
  if (changed.includes("uso") && s.uso) intro.push(USE_REACTION[s.uso]);
  if (phrases.length) intro.push(`${OPENERS[state.turn % OPENERS.length]}: ${joinEs(phrases)}.`);
  if (opened.length) {
    const what = joinEs(opened.map((k) => OPEN_NAMES[k] ?? k));
    intro.push(opened.includes("necesidades") && opened.length === 1 ? "Sin problema, nada más." : `Sin problema: ${what}, lo dejo abierto y te propongo lo que mejor salga por tu presupuesto.`);
  }
  if (changed.includes("nivel") && s.nivel) {
    if (ex.levelInferred) intro.push(`Por lo que cuentas, te veo como ${LEVEL_LABEL[s.nivel].toLowerCase()} (si no es así, dímelo).`);
    if (!state.said.includes(`nivel-${s.nivel}`)) {
      intro.push(LEVEL_INTRO[s.nivel]);
      state.said.push(`nivel-${s.nivel}`);
    }
  }
  intro.push(...helps);

  const tip = state.phase === "final" ? null : partialTip(s, state.said, changed);
  if (tip) state.said.push(tip.key);

  const messages: BotMessage[] = [];
  const understood = changed.length > 0 || toClear.length > 0 || !!term || helps.length > 0;
  const lead: BotMessage[] = intro.length || term || tip ? [{ role: "bot", paragraphs: intro, term: term ?? undefined, tip: tip?.text }] : [];

  // Tras la recomendación final: un cambio rehace la recomendación; si falta un dato, se vuelve a preguntar
  if ((state.phase === "final" || state.phase === "confirmar") && canClose(s)) {
    if (state.phase === "confirmar" && !changed.length && !toClear.length && isAffirmative(t)) {
      state.phase = "final";
      state.pending = [];
      return { state, messages: [...lead, ...finalMessages(s)], changed };
    }
    if (changed.length) {
      if (state.phase === "final") return { state, messages: [...lead, ...finalMessages(s)], changed };
      return { state, messages: [...lead, ...confirmMessage(s)], changed };
    }
    if (state.phase === "final") {
      return {
        state,
        messages: [...lead, { role: "bot", paragraphs: ["Si quieres afinar, cambia cualquier dato con tus palabras (por ejemplo, «sube el presupuesto a 2.500 €») y rehago la recomendación."] }],
        changed,
      };
    }
    state.pending = [];
    return {
      state,
      messages: [...lead, { role: "bot", paragraphs: ["Claro. ¿Qué cambio? Puedes decírmelo directamente, por ejemplo «mido 1,80» o «mejor una de montaña»."], chips: ["Cambiar presupuesto", "Cambiar uso", "Cambiar altura"] }],
      changed,
    };
  }

  const next = nextQuestions(s);
  if (next.length === 0) {
    state.phase = "confirmar";
    state.pending = [];
    return { state, messages: [...lead, ...confirmMessage(s)], changed };
  }

  state.phase = s.nivel ? "datos" : "perfil";
  state.pending = next.slice(0, 3);
  messages.push(...lead);

  // No se ha entendido nada: se repregunta con ejemplos, sin repetir la pregunta tal cual
  if (!understood) {
    const h = next.map((k) => help(k, s)).find(Boolean);
    const lostPrefix = ex.doubt ? "Tranquilo, para eso estoy." : "No te he pillado del todo.";
    messages.push(ask(next, s, h ? `${lostPrefix} ${h}` : lostPrefix));
    return { state, messages, changed };
  }

  // Si ha contestado a medias, se le dice qué falta
  const partial = prev.pending.length > 1 && next.some((k) => prev.pending.includes(k)) && changed.some((k) => prev.pending.includes(k as SlotKey));
  messages.push(ask(next, s, partial ? (next.length === 1 ? "Y una cosa más:" : "Me faltan un par de cosas:") : undefined));
  return { state, messages, changed };
}

// ─── De la conversación a la guía de siempre (bicis reales del catálogo) ───────────────

/** Uso de la guía de siempre (`questions.ts`) a partir del uso y el uso concreto. */
export function guideUse(s: Slots): UseKey | null {
  const sp = s.usoConcreto?.kind;
  switch (s.uso) {
    case "carretera":
      return sp === "competicion" || sp === "triatlon" ? "carretera-rapida" : sp === "cicloturismo" ? "carretera-comoda" : "carretera";
    case "mtb":
      return sp === "descensos" ? "montana-tecnica" : sp === "competicion" ? "montana-suave" : "montana";
    case "gravel": return "gravel";
    case "urbana": return "ciudad";
    case "paseo": return "paseo";
    case "infantil": return "infantil";
    default: return null;
  }
}

/** Convierte el perfil en las respuestas de `/guia/resultados`. null si faltan datos. */
export function toAnswers(s: Slots): Answers | null {
  const uso = guideUse(s);
  if (!canClose(s) || !uso) return null;
  const nivel: LevelKey = s.nivel === "pro" ? "experto" : s.nivel!;
  const prioridades: PriorityKey[] = [];
  // La guía solo usa prioridades con avanzado y experto (y nunca en infantil)
  if ((nivel === "avanzado" || nivel === "experto") && uso !== "infantil") {
    const long = (s.duracion?.minutes ?? 0) >= 150;
    if (s.peso?.kg || s.peso?.light) prioridades.push("ligereza");
    if (s.cambio === "electronico") prioridades.push("componentes");
    if (long) prioridades.push("comodidad");
    if (s.electrica === "si" && long) prioridades.push("autonomia");
    if (s.usoConcreto?.kind === "commuting" && (uso === "ciudad" || uso === "paseo")) prioridades.push("ciudad");
  }
  return {
    uso,
    electrica: uso === "infantil" ? "igual" : (s.electrica ?? "igual"),
    presupuesto: Math.min(15000, Math.max(200, Math.round(s.presupuesto!))),
    altura: s.altura!,
    nivel,
    prioridades: prioridades.slice(0, 2),
  };
}

export const resultsHref = (s: Slots) => {
  const a = toAnswers(s);
  return a ? `/guia/resultados?${answersToSearch(a)}` : null;
};

/** Consulta para el contador en vivo (`/api/contador`): solo con lo que ya se sabe. */
export function counterQuery(s: Slots): string | null {
  const uso = guideUse(s);
  if (!uso) return null;
  const p = new URLSearchParams({ uso });
  if (s.electrica && uso !== "infantil") p.set("electrica", s.electrica);
  if (s.presupuesto) p.set("presupuesto", String(Math.min(15000, Math.max(200, Math.round(s.presupuesto)))));
  if (s.altura) p.set("altura", String(s.altura));
  return p.toString();
}

