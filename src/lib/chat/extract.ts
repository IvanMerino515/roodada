// Lee lo que escribe la persona en el chat y saca los datos del perfil. Sin IA: reglas sobre el texto
// normalizado (minúsculas y sin tildes). Solo apunta lo que la persona dice; si no está claro, no apunta nada.
import type { Duration, Electric, Gearing, Level, Material, Shifting, SlotKey, Slots, SpecificUse, Use, Weight } from "./types";

export const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();

const UNITS: Record<string, number> = {
  un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
  once: 11, doce: 12, quince: 15, veinte: 20,
};
const TENS: Record<string, number> = { treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90 };
const HUNDREDS: Record<string, number> = {
  cien: 100, ciento: 100, doscientos: 200, trescientos: 300, cuatrocientos: 400, quinientos: 500,
  seiscientos: 600, setecientos: 700, ochocientos: 800, novecientos: 900,
};
const alt = (o: Record<string, number>) => Object.keys(o).join("|");

/** "dos mil quinientos" → "2500", "una hora" → "1 hora", "un metro setenta y cinco" → "175 cm" */
export function wordsToDigits(t: string): string {
  return t
    .replace(
      new RegExp(`\\bun metro(?: (${alt(TENS)})(?: y (${alt(UNITS)}))?)?\\b`, "g"),
      (_, tens?: string, unit?: string) => `${100 + (tens ? TENS[tens] : 0) + (unit ? UNITS[unit] : 0)} cm`,
    )
    .replace(
      new RegExp(`\\b(?:(${alt(UNITS)}) )?mil(?: (${alt(HUNDREDS)}))?\\b`, "g"),
      (_, unit?: string, hundreds?: string) => String((unit ? UNITS[unit] : 1) * 1000 + (hundreds ? HUNDREDS[hundreds] : 0)),
    )
    .replace(new RegExp(`\\b(${alt(HUNDREDS)})\\b`, "g"), (m) => String(HUNDREDS[m]))
    .replace(new RegExp(`\\b(${alt(UNITS)})\\b(?= (hora|horas|h|kg|kilos|veces|km)\\b)`, "g"), (m) => String(UNITS[m]));
}

/** "1.500" → 1500 · "1,5" → 1.5 · "2.000,50" → 2000.5 · "1.75" → 1.75 */
export function parseNum(raw: string): number {
  const s = raw.trim();
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) return Number(s.replace(/\./g, "").replace(",", "."));
  if (/^\d+,\d+$/.test(s)) return Number(s.replace(",", "."));
  if (/^\d+\.\d{1,2}$/.test(s)) return Number(s);
  return Number(s.replace(/[^\d]/g, ""));
}

const NUM = String.raw`(\d[\d.,]*\d|\d)`;
const DOUBT = /\b(no se|ni idea|no lo (tengo|se) claro|no lo se|no estoy segur|no tengo claro|me da igual|lo que (sea|tu digas|recomiendes)|cualquiera|indiferente|no me importa|ayuda|que me recomiendas|no entiendo)\b/;
export const isDoubt = (t: string) => DOUBT.test(t);
export const isAffirmative = (t: string) =>
  /^(si|vale|ok|okay|correcto|perfecto|todo bien|esta bien|eso es|adelante|dale|genial|exacto|de acuerdo|asi es|bien|venga|busca\w*)\b/.test(t);
const isNothing = (t: string) => /^(no|nada|ninguna|ninguno|nada mas|eso es todo|no,? (nada|gracias)|nop?e?)\b\.?$/.test(t) || /^(nada mas|eso es todo|ya esta|nada en especial)/.test(t);

export function parseBudget(t: string, expected: boolean): number | undefined {
  const values: number[] = [];
  const range = t.match(new RegExp(`entre ${NUM} ?(k|mil|€|euros?)? (?:y|a|-) ${NUM} ?(k|mil|€|euros?)?`));
  if (range) {
    const k = range[2] === "k" || range[2] === "mil" || range[4] === "k" || range[4] === "mil" ? 1000 : 1;
    const top = parseNum(range[3]) * (parseNum(range[3]) < 50 ? k : 1);
    if (top >= 100 || range[4]) values.push(top);
  }
  for (const m of t.matchAll(new RegExp(`${NUM} ?(k|mil)\\b`, "g"))) values.push(parseNum(m[1]) * 1000);
  for (const m of t.matchAll(new RegExp(`${NUM} ?(€|eur\\b|euros?\\b|pavos)`, "g"))) values.push(parseNum(m[1]));
  for (const m of t.matchAll(new RegExp(`€ ?${NUM}`, "g"))) values.push(parseNum(m[1]));
  for (const m of t.matchAll(new RegExp(`(?:presupuesto|gastar(?:me)?|hasta|maximo|tope|alrededor de|sobre los|por unos|unos) (?:de |unos |los )?${NUM}(?! ?(cm|m\\b|metros|kg|kilos|km|min|h\\b|horas|x|"|pulgadas|veces|mm|[.,]\\d))`, "g"))) {
    // «mido unos 175» es altura, no dinero
    if (/(mido|mide|altura|estatura|peso|peso unos)\s*$/.test(t.slice(Math.max(0, (m.index ?? 0) - 12), m.index))) continue;
    const v = parseNum(m[1]);
    if (v >= 150) values.push(v);
  }
  if (!values.length && expected) {
    const bare = t.match(new RegExp(`^(?:unos |sobre |hasta |como mucho |maximo )?${NUM}$`));
    if (bare && parseNum(bare[1]) >= 100) values.push(parseNum(bare[1]));
  }
  const ok = values.filter((v) => v >= 100 && v <= 50000);
  return ok.length ? Math.round(Math.max(...ok)) : undefined;
}

export function parseHeight(t: string, expected: boolean): number | undefined {
  const cm = (v: number) => (v >= 90 && v <= 215 ? Math.round(v) : undefined);
  let m = t.match(/(\d{2,3}) ?(cm|centimetros)\b/);
  if (m) return cm(Number(m[1]));
  m = t.match(/\b([12])[.,'](\d{1,2}) ?(m\b|mt?s?\b|metros?)/);
  if (m) return cm(Number(m[1]) * 100 + Number(m[2].padEnd(2, "0")));
  m = t.match(/\b(mido|mide|altura(?: de)?|estatura(?: de)?) (?:unos |casi |sobre )?(?:([12])[.,'](\d{1,2})|(\d{2,3}))\b/);
  if (m) return cm(m[4] ? Number(m[4]) : Number(m[2]) * 100 + Number(m[3].padEnd(2, "0")));
  if (expected) {
    m = t.match(/^(?:unos |sobre |casi )?(?:([12])[.,'](\d{1,2})|(\d{2,3}))$/);
    if (m) return cm(m[3] ? Number(m[3]) : Number(m[1]) * 100 + Number(m[2].padEnd(2, "0")));
  }
  return undefined;
}

export function parseDuration(t: string, expected: boolean): Duration | undefined {
  const hours = (h: number, text: string): Duration => ({ minutes: Math.round(h * 60), text });
  let m = t.match(/(\d+(?:[.,]\d+)?) ?(?:-|a|o) ?(\d+(?:[.,]\d+)?) ?(h\b|horas?)/);
  if (m) return hours((parseNum(m[1]) + parseNum(m[2])) / 2, `${m[1]}–${m[2]} h`);
  if (/\bun par de horas\b/.test(t)) return hours(2, "un par de horas");
  m = t.match(/(\d+) horas? y media/);
  if (m) return hours(Number(m[1]) + 0.5, `${m[1]} h y media`);
  if (/\bhora y media\b/.test(t)) return hours(1.5, "hora y media");
  if (/\bmedia hora\b/.test(t)) return hours(0.5, "media hora");
  m = t.match(/(\d+(?:[.,]\d+)?) ?(h\b|horas?)/);
  if (m) return hours(parseNum(m[1]), `${m[1]} h`);
  m = t.match(/(\d+) ?(min\b|minutos)/);
  if (m) return { minutes: Number(m[1]), text: `${m[1]} min` };
  m = t.match(/(\d+) ?(km|kilometros)\b/);
  if (m) return { km: Number(m[1]), text: `${m[1]} km` };
  if (/todo el dia|dias enteros|varios dias|etapas/.test(t)) return { minutes: 360, text: "todo el día" };
  if (/media jornada|toda la manana|mananas enteras|toda la tarde/.test(t)) return { minutes: 240, text: "media jornada" };
  if (/\b(un rato|poco rato|ratos cortos|trayectos cortos|cortas?)\b/.test(t)) return { minutes: 40, text: "salidas cortas" };
  if (/\b(largas?|muchos km|muchos kilometros)\b/.test(t)) return { minutes: 180, text: "salidas largas" };
  if (expected) {
    m = t.match(/^(?:unas? |sobre |casi )?(\d+(?:[.,]\d+)?)$/);
    if (m && parseNum(m[1]) <= 12) return hours(parseNum(m[1]), `${m[1]} h`);
  }
  return undefined;
}

/** Usos en el orden en que aparecen: el primero es el principal. */
export function parseUses(t: string): Use[] {
  // "subir puertos de montaña" habla de desarrollos, no de bici de montaña
  const s = t.replace(/(subir|puertos?( de)?|desarrollos? para)( las?)? montanas?/g, "$1");
  const found: [number, Use][] = [];
  const add = (re: RegExp, u: Use) => {
    const i = s.search(re);
    if (i >= 0) found.push([i, u]);
  };
  // «Para mi hijo» es infantil; «salgo con mis hijos» no
  add(/\b(para (?:mi |mis |un |una |el |la |los )?(?:hij[oa]s?|nin[oa]s?|peques?|sobrin[oa]s?|crios?|chaval\w*)|infantil|bici de nin[oa]|de nin[oa]s?)\b/, "infantil");
  add(/\b(e-?mtb|mtb|btt|montana|monte|senderos?|trail|enduro|descens\w*|bajadas|singletrack|mountain ?bike)\b/, "mtb");
  add(/\b(e-?gravel|gravel|caminos?|tierra|pistas?|grava)\b/, "gravel");
  add(/\b(carretera|asfalto|road|grupeta|ciclismo de ruta)\b/, "carretera");
  add(/\b(ciudad|urban\w*|trabajo|oficina|commut\w*|recados|desplaz\w*|ir a clase|universidad|dia a dia|movilidad)\b/, "urbana");
  add(/\b(paseo|pasear|cicloturismo|viajes?|trekking|vias? verdes?|tranquil\w*|alforjas)\b/, "paseo");
  if (!found.length && /\bpuertos?\b/.test(s)) add(/\bpuertos?\b/, "carretera");
  return found.sort((a, b) => a[0] - b[0]).map(([, u]) => u).filter((u, i, a) => a.indexOf(u) === i);
}

export function parseElectric(t: string): Electric | undefined {
  const word = /(electric\w*|e-?bike|ebike|motor|asistid\w*|asistencia|bateria|e-?mtb|e-?gravel|e-?road)/;
  if (new RegExp(`\\b(sin |nada de |no (quiero |necesito |me hace falta )?(una |el |un )?)${word.source}`).test(t) || /\b(muscular|sin motor|a pedales?|a pulmon|normal,? sin)\b/.test(t)) return "no";
  if (new RegExp(`${word.source}.{0,25}(me da igual|me es igual|lo que sea|indiferente|no lo se|no se|no lo tengo claro)`).test(t)) return "igual";
  if (new RegExp(`(me da igual|no se|no lo se|no lo tengo claro).{0,25}${word.source}`).test(t)) return "igual";
  if (new RegExp(`${word.source},? (no|tampoco|ni hablar|ni de broma|para nada|que va|nunca|paso)\\b`).test(t)) return "no";
  if (new RegExp(`\\b${word.source}`).test(t)) return "si";
  return undefined;
}

export function parseLevel(t: string): { level: Level; explicit: boolean } | undefined {
  const explicit: [RegExp, Level][] = [
    [/\bnovat[oa]s?\b/, "novato"],
    [/\bcurios[oa]s?\b/, "curioso"],
    [/\bavanzad[oa]s?\b/, "avanzado"],
    [/\b(pro|profesional|expert[oa])\b/, "pro"],
  ];
  for (const [re, level] of explicit) if (re.test(t)) return { level, explicit: true };
  const hints: [RegExp, Level][] = [
    [/\b(compito|federad[oa]|elite|corro carreras|licencia)\b/, "pro"],
    [/\b(varias veces|[2-7] veces (a|por) (la )?semana|entreno|kom|qom|strava|grupeta|marchas)\b/, "avanzado"],
    [/\b(de vez en cuando|alguna vez|algo he|me pica|aficionad[oa]|ocasional\w*|los findes|fines de semana)\b/, "curioso"],
    [/\b(principiante|empezar|empiezo|desde cero|nunca he|no tengo experiencia|primera bici|hace anos que no|poca experiencia)\b/, "novato"],
  ];
  for (const [re, level] of hints) if (re.test(t)) return { level, explicit: false };
  return undefined;
}

export function parseMaterial(t: string): Material | undefined {
  if (/\b(carbono|carbon)\b/.test(t)) return "carbono";
  if (/\b(aluminio|alu)\b/.test(t)) return "aluminio";
  if (/\b(acero|cromoly|cr-?mo)\b/.test(t)) return "acero";
  if (/\btitanio\b/.test(t)) return "titanio";
  return undefined;
}

export function parseShifting(t: string): Shifting | undefined {
  if (/\b(electronic\w*|di2|axs|inalambric\w*|etap)\b/.test(t)) return "electronico";
  if (/\b(mecanic\w*|por cable|de cable|cables)\b/.test(t)) return "mecanico";
  return undefined;
}

export function parseSpecificUse(t: string): SpecificUse | undefined {
  const map: [RegExp, SpecificUse][] = [
    [/\b(triatl\w*|crono|contrarreloj|ironman)\b/, "triatlon"],
    [/\b(descens\w*|enduro|bike ?park|bajadas)\b/, "descensos"],
    [/\b(bikepack\w*|aventura|bolsas)\b/, "bikepacking"],
    [/\b(compet\w*|carreras?|race|rally|xco?)\b/, "competicion"],
    [/\b(cicloturis\w*|viajar|alforjas)\b/, "cicloturismo"],
    [/\b(commut\w*|ir al trabajo|oficina|desplaz\w*)\b/, "commuting"],
    [/\b(entren\w*|mejorar|ponerme en forma|marchas|strava)\b/, "entrenamiento"],
  ];
  for (const [re, u] of map) if (re.test(t)) return u;
  return undefined;
}

export function parseGearing(t: string): Gearing | undefined {
  const detail = t.match(/\b(1x\d*|2x\d*|monoplato|un plato|doble plato|dos platos|compacto|semicompacto|\d{2} ?[/-] ?\d{2}(?: ?[/-] ?\d{2})?)\b/)?.[1];
  let kind: Gearing["kind"] | undefined;
  if (/\b(subir|puertos?|desnivel\w*|cuestas?|rampas?|suaves?|molinillo|montanas?)\b/.test(t)) kind = "subir";
  else if (/\b(llano|velocidad|rapid\w* en llano|desarrollos? largos?)\b/.test(t)) kind = "velocidad";
  if (!kind && !detail) return undefined;
  return { kind: kind ?? "mixto", detail };
}

export function parseWeight(t: string): { bike?: Weight; riderKg?: number } {
  const m = t.match(/(\d+(?:[.,]\d+)?) ?(kg|kilos?)\b/);
  if (m) {
    const kg = parseNum(m[1]);
    if (kg <= 30) return { bike: { kg, text: `${/menos|maximo|como mucho|por debajo/.test(t) ? "menos de " : ""}${m[1]} kg` } };
    if (/\b(peso|pes[oa]|yo)\b/.test(t)) return { riderKg: kg };
  }
  if (/\b(lo mas ligera|muy ligera|ligerisima|ligera|poco peso|que pese poco)\b/.test(t)) return { bike: { light: true, text: "lo más ligera posible" } };
  if (/(el peso|del peso|peso).{0,15}(me da igual|no me importa|indiferente)|(me da igual|no me importa).{0,15}peso/.test(t)) return { bike: { indifferent: true, text: "sin preferencia" } };
  return {};
}

/** Palabras que dicen de qué dato habla una frase (para aplicar un «no sé» al dato correcto). */
export const SLOT_WORDS: Partial<Record<SlotKey, RegExp>> = {
  uso: /\b(uso|terreno|para que|donde|tipo de bici)\b/,
  presupuesto: /\b(presupuesto|precio|dinero|gastar|euros|€)\b/,
  electrica: /\b(electric\w*|motor|asistencia|bateria)\b/,
  duracion: /\b(salidas?|duracion|horas|tiempo|rato)\b/,
  altura: /\b(altura|mido|mide|estatura|talla)\b/,
  material: /\b(material|cuadro|aluminio|carbono|acero|titanio)\b/,
  cambio: /\b(cambio|transmision|grupo|electronico|mecanico)\b/,
  usoConcreto: /\b(uso concreto|para que en concreto|competi\w*|disciplina)\b/,
  desarrollo: /\b(desarrollos?|platos?|pinones|cassette|relacion)\b/,
  peso: /\b(peso|kilos|kg|ligera)\b/,
  nivel: /\b(nivel|perfil|tipo de ciclista)\b/,
};

export type Extracted = {
  patch: Partial<Slots>;
  /** El nivel se ha deducido de pistas, no lo ha dicho: se le dice para que lo corrija */
  levelInferred?: boolean;
  doubtSlots: SlotKey[];
  doubt: boolean;
};

/** Saca del texto los datos que dice, teniendo en cuenta qué se le acaba de preguntar (`pending`). */
export function extract(raw: string, pending: SlotKey[]): Extracted {
  const t = wordsToDigits(norm(raw));
  const patch: Partial<Slots> = {};
  const expects = (k: SlotKey) => pending.includes(k);
  const clauses = t.split(/[,.;!?]| y | pero | aunque /).map((c) => c.trim()).filter(Boolean);

  const lvl = parseLevel(t);
  let levelInferred = false;
  if (lvl) {
    patch.nivel = lvl.level;
    levelInferred = !lvl.explicit;
  }

  const budget = parseBudget(t, expects("presupuesto"));
  if (budget) patch.presupuesto = budget;

  const height = parseHeight(t, expects("altura"));
  if (height) patch.altura = height;

  const uses = parseUses(t);
  if (uses.length) {
    patch.uso = uses[0];
    patch.usosExtra = uses.slice(1);
  }

  const el = parseElectric(t);
  if (el) patch.electrica = el;

  const dur = parseDuration(t, expects("duracion"));
  if (dur) patch.duracion = dur;

  const mat = parseMaterial(t);
  if (mat) patch.material = mat;

  const sh = parseShifting(t);
  if (sh) patch.cambio = sh;

  // «Entreno varias veces por semana» describe el nivel, no el uso concreto: los usos poco claros solo
  // cuentan si se acaba de preguntar por el uso concreto
  const sp = parseSpecificUse(t);
  if (sp && (expects("usoConcreto") || !["entrenamiento", "commuting"].includes(sp))) patch.usoConcreto = { kind: sp, text: sp };

  const gear = parseGearing(t);
  if (gear && (expects("desarrollo") || gear.detail || /desarroll|plato|pinon|cassette/.test(t))) patch.desarrollo = gear;

  const w = parseWeight(t);
  if (w.bike) patch.peso = w.bike;
  if (w.riderKg) patch.pesoCiclista = w.riderKg;

  // «No sé» / «me da igual»: se aplica al dato del que habla la frase; si la frase no nombra ninguno,
  // a lo que se acaba de preguntar y no ha contestado
  const doubtSlots: SlotKey[] = [];
  for (const c of clauses) {
    if (!isDoubt(c)) continue;
    const named = (Object.keys(SLOT_WORDS) as SlotKey[]).filter((k) => SLOT_WORDS[k]!.test(c));
    doubtSlots.push(...(named.length ? named : pending.filter((k) => patch[k] === undefined)));
  }
  const doubt = isDoubt(t);

  // Uso concreto «otro» y necesidades del Roodador pro: texto libre si no se ha entendido otra cosa
  const nothingElse = Object.keys(patch).length === 0 && !doubt;
  if (expects("usoConcreto") && !patch.usoConcreto && nothingElse && t.length > 2) patch.usoConcreto = { kind: "otro", text: raw.trim() };
  if (expects("necesidades")) {
    if (isNothing(t)) patch.necesidades = [];
    else if (t.length > 2 && !isAffirmative(t) && !(doubt && Object.keys(patch).length === 0)) patch.necesidades = [raw.trim()];
  }

  return { patch, levelInferred, doubtSlots: [...new Set(doubtSlots)], doubt };
}
