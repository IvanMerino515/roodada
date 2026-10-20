// Textos del asistente: cómo se nombra cada dato, el glosario, los consejos parciales y la recomendación final.
// Las cifras de gamas, ruedas y pesos son orientaciones generales del mercado, no datos de una bici concreta:
// las bicis reales, con su ficha oficial, salen del catálogo (enlace al final del chat).
import type { Duration, FinalRec, Level, Slots, SummaryItem, Use } from "./types";

export const eur = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
/** «Gravel polivalente» → «gravel polivalente», pero «MTB de XC» se queda igual */
const lowerFirst = (t: string) => (/^[A-ZÁÉÍÓÚ][a-záéíóúñ]/.test(t) ? t[0].toLowerCase() + t.slice(1) : t);
const cm = (n: number) => `${(n / 100).toFixed(2).replace(".", ",")} m`;

export const LEVEL_LABEL: Record<Level, string> = {
  novato: "Roodador novato", curioso: "Roodador curioso", avanzado: "Roodador avanzado", pro: "Roodador pro",
};
export const USE_LABEL: Record<Use, string> = {
  carretera: "carretera", gravel: "gravel y caminos", mtb: "montaña (MTB)", urbana: "ciudad", paseo: "paseo y viajes", infantil: "bici infantil",
};
const SPECIFIC_LABEL = {
  competicion: "competición", triatlon: "triatlón", descensos: "descensos", entrenamiento: "entrenamiento",
  cicloturismo: "cicloturismo", bikepacking: "bikepacking", commuting: "ir al trabajo", otro: "otro",
} as const;

export const durationLabel = (d: Duration) => (d.text.startsWith("salidas") ? d.text : `salidas de ${d.text}`);

/** Cómo se dice cada dato en una frase ("Apuntado: gravel, unos 2.000 €…") */
export function slotPhrase(s: Slots, k: keyof Slots): string | null {
  switch (k) {
    case "nivel": return s.nivel ? LEVEL_LABEL[s.nivel].replace("Roodador ", "perfil ") : null;
    case "presupuesto": return s.presupuesto ? `unos ${eur(s.presupuesto)}` : null;
    case "uso": return s.uso ? USE_LABEL[s.uso] : null;
    case "electrica": return s.electrica ? { si: "eléctrica", no: "sin motor", igual: "eléctrica o no, te da igual" }[s.electrica] : null;
    case "duracion": return s.duracion ? durationLabel(s.duracion) : null;
    case "altura": return s.altura ? (s.uso === "infantil" ? `mide ${s.altura} cm` : `mides ${cm(s.altura)}`) : null;
    case "material": return s.material ? (s.material === "indiferente" ? "material abierto" : `cuadro de ${s.material}`) : null;
    case "cambio": return s.cambio ? (s.cambio === "indiferente" ? "cambio abierto" : `cambio ${s.cambio === "mecanico" ? "mecánico" : "electrónico"}`) : null;
    case "usoConcreto": return s.usoConcreto ? (s.usoConcreto.kind === "otro" ? `uso: «${s.usoConcreto.text}»` : SPECIFIC_LABEL[s.usoConcreto.kind]) : null;
    case "desarrollo": return s.desarrollo ? gearingText(s.desarrollo) : null;
    case "peso": return s.peso ? (s.peso.indifferent ? "peso sin preferencia" : `peso: ${s.peso.text}`) : null;
    case "necesidades": return s.necesidades ? (s.necesidades.length ? `«${s.necesidades.join("; ")}»` : "nada más que añadir") : null;
    default: return null;
  }
}

function gearingText(g: NonNullable<Slots["desarrollo"]>): string {
  const kind = { subir: "desarrollos suaves para subir", velocidad: "desarrollos largos para llano", mixto: "desarrollos", indiferente: "desarrollos sin preferencia" }[g.kind];
  return g.detail ? `${kind} (${g.detail})` : kind;
}

/** Glosario: términos técnicos explicados en una frase. */
export const GLOSSARY: [RegExp, string, string][] = [
  [/\bgravel\b/, "Gravel", "una bici con manillar de carretera pero ruedas anchas con taco: va bien en asfalto y en caminos de tierra."],
  [/\b(mtb|btt)\b/, "MTB", "bici de montaña: ruedas gruesas, suspensión y manillar plano para senderos y pistas."],
  [/doble suspension|suspension total|full/, "Doble suspensión", "suspensión delante y detrás. Más control y comodidad en bajadas; pesa y cuesta más."],
  [/\brigida\b|hardtail/, "Rígida (hardtail)", "solo suspensión delantera. Más ligera, barata y con menos mantenimiento."],
  [/hidraulic/, "Freno hidráulico", "frena con aceite en lugar de cable: más potencia con menos fuerza en la maneta."],
  [/freno.* disco|\bdiscos?\b/, "Freno de disco", "frena sobre un disco en el buje: frena igual con lluvia o barro."],
  [/carbono/, "Carbono", "material de cuadro ligero y rígido. Más caro y más delicado ante golpes."],
  [/aluminio/, "Aluminio", "el material más habitual: resistente, económico y algo más pesado que el carbono."],
  [/\bacero\b/, "Acero", "pesa más, pero es cómodo, duradero y fácil de reparar. Típico en viajes."],
  [/titanio/, "Titanio", "ligero, cómodo y casi eterno. Caro."],
  [/electronic/, "Cambio electrónico", "cambias con botones y un motor mueve la cadena: más preciso, sin ajustes de cable. Necesita carga."],
  [/mecanic/, "Cambio mecánico", "cambias con palancas y cables. Más barato y fácil de arreglar en cualquier taller."],
  [/desarrollo/, "Desarrollo", "lo que avanzas en cada pedalada según el plato (delante) y el piñón (detrás). Suave = subes fácil; largo = vas más rápido en llano."],
  [/\b1x\b|monoplato/, "1x (monoplato)", "un solo plato delante. Más sencillo y menos averías; algo menos de margen entre marchas."],
  [/\b2x\b|doble plato/, "2x (doble plato)", "dos platos delante: más marchas y saltos más finos entre ellas."],
  [/plato/, "Platos", "las ruedas dentadas de los pedales. Más pequeños = más fácil subir."],
  [/pinon|cassette/, "Piñones (cassette)", "las ruedas dentadas de la rueda trasera. Más dientes en el grande = más fácil subir."],
  [/\btalla\b/, "Talla", "el tamaño del cuadro. Va según tu altura y cada marca la mide distinto."],
  [/\bstack\b/, "Stack", "la altura del manillar respecto a los pedales. Más stack = postura más erguida y cómoda."],
  [/\breach\b/, "Reach", "lo lejos que queda el manillar. Más reach = postura más estirada y deportiva."],
  [/endurance/, "Endurance", "bici de carretera con postura más alta y cómoda para muchos kilómetros."],
  [/tubeless/, "Tubeless", "cubiertas sin cámara con líquido sellante: tapan pinchazos pequeños solas."],
  [/horquilla/, "Horquilla", "la pieza que sujeta la rueda delantera. En MTB lleva la suspensión."],
  [/potenciometro/, "Potenciómetro", "mide la fuerza que haces al pedalear (vatios). Sirve para entrenar con datos."],
  [/tija telescopica|dropper/, "Tija telescópica", "baja el sillín con un botón para las bajadas y lo sube para pedalear."],
  [/\budh\b/, "UDH", "patilla de cambio universal. Facilita encontrar recambio y montar cambios modernos."],
  [/\bwh\b|bateria/, "Batería (Wh)", "su capacidad. Más Wh = más autonomía, pero más peso."],
  [/\bnm\b|par motor/, "Par del motor (Nm)", "la fuerza del motor. 85 Nm empuja mucho en subidas; 40-60 Nm es una ayuda suave."],
  [/aero/, "Aero", "bici con tubos perfilados para cortar el viento. Más rápida en llano, algo menos cómoda."],
];

export function explainTerm(t: string): { word: string; text: string } | null {
  if (!/\b(que (es|son|significa|quiere decir)|no entiendo|explica|eso que es|a que te refieres)\b/.test(t)) return null;
  const hit = GLOSSARY.find(([re]) => re.test(t));
  return hit ? { word: hit[1], text: hit[2].charAt(0).toUpperCase() + hit[2].slice(1) } : null;
}

/** Reacción corta al uso que cuenta: para que no suene a formulario. */
export const USE_REACTION: Record<Use, string> = {
  carretera: "Asfalto y kilómetros: buen plan.",
  gravel: "Gravel: asfalto y tierra en la misma salida, lo más versátil que hay ahora.",
  mtb: "Monte: de lo más divertido que se puede hacer en bici.",
  urbana: "Para el día a día: una buena bici te cambia los desplazamientos.",
  paseo: "Rutas tranquilas: aquí manda la comodidad.",
  infantil: "Una bici para los peques: aquí lo que importa es el tamaño de rueda y que pese poco.",
};

/** El perfil contado en una frase, en segunda persona. */
export function profileProse(s: Slots): string {
  const parts: string[] = [];
  if (s.nivel) parts.push(`eres ${LEVEL_LABEL[s.nivel].toLowerCase()}`);
  if (s.uso) {
    const extra = s.usosExtra?.length ? ` (y algo de ${s.usosExtra.map((u) => USE_LABEL[u]).join(" y ")})` : "";
    const sp = s.usoConcreto ? `, sobre todo para ${s.usoConcreto.kind === "otro" ? `«${s.usoConcreto.text}»` : SPECIFIC_LABEL[s.usoConcreto.kind]}` : "";
    parts.push(s.uso === "infantil" ? "buscas una bici infantil" : `buscas una bici de ${USE_LABEL[s.uso]}${extra}${sp}`);
  }
  if (s.presupuesto) parts.push(`sin pasar de unos ${eur(s.presupuesto)}`);
  if (s.electrica && s.uso !== "infantil") parts.push({ si: "eléctrica", no: "sin motor", igual: "con o sin motor, lo dejamos abierto" }[s.electrica]);
  if (s.duracion) parts.push(`con ${durationLabel(s.duracion)}`);
  if (s.altura) parts.push(s.uso === "infantil" ? `para alguien de ${s.altura} cm` : `y mides ${cm(s.altura)}`);
  const prefs = [
    s.material && s.material !== "indiferente" && `cuadro de ${s.material}`,
    s.cambio && s.cambio !== "indiferente" && `cambio ${s.cambio === "mecanico" ? "mecánico" : "electrónico"}`,
    s.desarrollo && s.desarrollo.kind !== "indiferente" && gearingText(s.desarrollo),
    s.peso && !s.peso.indifferent && `peso: ${s.peso.text}`,
  ].filter(Boolean) as string[];
  const needs = s.necesidades?.length ? ` Y me pides: ${s.necesidades.join("; ")}.` : "";
  return `Te resumo: ${joinList(parts)}.${prefs.length ? ` Te importa: ${joinList(prefs)}.` : ""}${needs}`;
}
const joinList = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} ${xs.at(-1)!.startsWith("y ") ? "" : "y "}${xs.at(-1)}` : (xs[0] ?? ""));

// ─── Gamas orientativas por presupuesto ───────────────────────────────────────

type Family = "asfalto" | "mtb" | "ciudad" | "infantil";
const family = (u: Use): Family => (u === "carretera" || u === "gravel" ? "asfalto" : u === "mtb" ? "mtb" : u === "infantil" ? "infantil" : "ciudad");

/** Presupuesto a partir del que empiezan a salir bicis decentes de ese tipo (orientativo). */
export function minBudget(u: Use, electric: boolean): number {
  if (u === "infantil") return 150;
  if (electric) return { carretera: 2500, gravel: 2500, mtb: 2500, urbana: 1300, paseo: 1600 }[u];
  return { carretera: 700, gravel: 800, mtb: 550, urbana: 350, paseo: 450 }[u];
}

function transmission(u: Use, budget: number, electric: boolean): string {
  const b = electric ? budget * 0.55 : budget; // en una eléctrica, buena parte del dinero va al motor y la batería
  switch (family(u)) {
    case "asfalto":
      if (b < 900) return "Shimano Claris o Sora (8-9 velocidades): sencillo y fiable";
      if (b < 1600) return "Shimano Tiagra, GRX 400 o SRAM Apex: 10-12 velocidades";
      if (b < 3500) return "Shimano 105, GRX 600-800 o SRAM Rival: 12 velocidades, la gama que más se recomienda";
      if (b < 6500) return "Shimano 105 Di2, Ultegra o SRAM Force AXS: cambio electrónico";
      return "Shimano Dura-Ace o SRAM Red: lo más alto, electrónico";
    case "mtb":
      if (b < 800) return "Shimano Cues o Deore de 9-10 velocidades, monoplato";
      if (b < 1800) return "Shimano Deore 12v o SRAM SX/NX: monoplato con piñón grande para subir";
      if (b < 3500) return "Shimano SLX/XT o SRAM GX: más ligero y preciso";
      return "Shimano XT/XTR o SRAM Transmission (inalámbrico)";
    case "ciudad":
      return b < 1200 ? "Shimano Altus o Alivio, o cambio interno en el buje (casi sin mantenimiento)" : "cambio interno en el buje o correa: limpio y sin mantenimiento";
    case "infantil":
      return "pocas marchas (o ninguna en ruedas pequeñas): fácil de entender para un niño";
  }
}

/** La gama explicada sin nombres de grupos, para quien empieza */
function plainTier(u: Use, budget: number, electric: boolean): string {
  const b = electric ? budget * 0.55 : budget;
  const f = family(u);
  if (f === "ciudad" || f === "infantil") return "un cambio sencillo o interno en el buje (casi sin mantenimiento)";
  if (b < (f === "mtb" ? 800 : 900)) return "un cambio sencillo y fiable de 8 a 10 marchas";
  if (b < (f === "mtb" ? 1800 : 1600)) return "10 a 12 marchas que cambian suave";
  if (b < 3500) return "un cambio de gama media de 12 marchas, el que más se recomienda";
  return "cambio de gama alta, incluso electrónico";
}

function brakes(u: Use, budget: number): string {
  if (u === "infantil") return "V-brake o disco mecánico, con manetas pequeñas que se accionan sin fuerza";
  if (budget < 600) return "disco mecánico o V-brake; si llegas, mejor disco hidráulico";
  return "disco hidráulico: frena fuerte con poco esfuerzo y con lluvia";
}

function frame(s: Slots, budget: number): string {
  const u = s.uso!;
  const pick = s.material && s.material !== "indiferente" ? s.material : null;
  const carbonFrom = family(u) === "asfalto" ? 2000 : family(u) === "mtb" ? 2800 : Infinity;
  const natural = budget >= carbonFrom ? "carbono" : "aluminio";
  if (u === "infantil") return "aluminio: ligero, para que el niño la mueva sin pelearse";
  if (!pick) return natural === "carbono" ? "carbono: con tu presupuesto ya compensa por peso y rigidez" : `aluminio${family(u) === "asfalto" ? " con horquilla de carbono" : ""}: la mejor relación calidad-precio a este precio`;
  if (pick === "carbono" && budget < carbonFrom) return `carbono, aunque con ${eur(budget)} saldría un carbono básico con piezas modestas; un buen aluminio puede salir mejor montado`;
  if (pick === "titanio" && budget < 3500) return "titanio: a este precio casi solo hay cuadros sueltos; cuenta con subir presupuesto";
  return `${pick}, como buscas`;
}

function wheels(s: Slots): string {
  const h = s.altura ?? 175;
  switch (s.uso) {
    case "infantil":
      if (h < 100) return 'ruedas de 12": bici de equilibrio o primera bici';
      if (h < 115) return 'ruedas de 16"';
      if (h < 130) return 'ruedas de 20"';
      if (h < 145) return 'ruedas de 24"';
      return 'ruedas de 26" o una talla XS de adulto';
    case "carretera": return "700c con cubiertas de 28-32 mm: rápidas y cómodas";
    case "gravel": return `700c con cubiertas de 40-45 mm${h < 160 ? " (o 650b en tallas pequeñas)" : ""}`;
    case "mtb": return h < 160 ? '27,5" o mixtas (29" delante): más manejables en tallas pequeñas' : '29": pasan mejor por piedras y raíces';
    case "urbana": return "700c con cubiertas de 35-45 mm y antipinchazos";
    default: return "700c (28\") con cubiertas anchas y cómodas";
  }
}

function weightHint(s: Slots, budget: number): string {
  const el = s.electrica === "si";
  if (s.uso === "infantil") return "cuanto más ligera, mejor: que no pese más del 40 % de lo que pesa el niño";
  if (el) return s.uso === "carretera" || s.uso === "gravel" ? "12-15 kg (eléctrica ligera)" : "20-26 kg: el motor y la batería pesan";
  const carbon = frame(s, budget).startsWith("carbono");
  const range: Record<Use, string> = {
    carretera: carbon ? "7,5-8,5 kg" : "9-10 kg",
    gravel: carbon ? "8,5-9,5 kg" : "9,5-11 kg",
    mtb: mtbFull(s, budget) ? (carbon ? "12-14 kg" : "13,5-15,5 kg") : carbon ? "10-11,5 kg" : "11,5-13,5 kg",
    urbana: "12-16 kg", paseo: "14-17 kg", infantil: "",
  };
  return `${range[s.uso!]} orientativo`;
}

const mtbFull = (s: Slots, budget: number) =>
  s.usoConcreto?.kind === "descensos" || (budget >= 1800 && (s.nivel === "avanzado" || s.nivel === "pro") && s.usoConcreto?.kind !== "competicion");

const isLong = (d?: Duration) => (d?.minutes ?? 0) >= 150 || (d?.km ?? 0) >= 60;

export function bikeType(s: Slots, budget = s.presupuesto ?? 0): { nombre: string; porque: string } {
  const sp = s.usoConcreto?.kind;
  const e = s.electrica === "si" ? "eléctrica " : "";
  const long = isLong(s.duracion);
  switch (s.uso) {
    case "infantil":
      return { nombre: `Bici infantil (${wheels(s).split(":")[0]})`, porque: "La rueda va por la altura del niño, no por la edad." };
    case "carretera":
      if (sp === "triatlon") return { nombre: `Bici de carretera aero ${e}o de triatlón`, porque: "Tubos perfilados y postura baja para ir rápido en llano y contrarreloj." };
      if (sp === "competicion") return { nombre: `Carretera ${e}de competición`, porque: "Geometría racing, rígida y ligera, para ir a tope en grupo." };
      return {
        nombre: `Carretera ${e}endurance`,
        porque: long || s.nivel === "novato" || s.nivel === "curioso"
          ? "Postura más alta y cómoda: aguantas más kilómetros sin dolor de espalda."
          : "Polivalente: cómoda para entrenar y rápida cuando aprietas.",
      };
    case "gravel":
      if (sp === "bikepacking" || sp === "cicloturismo") return { nombre: `Gravel ${e}de aventura`, porque: "Anclajes para bolsas y portabultos, ruedas anchas y desarrollos suaves para ir cargado." };
      if (sp === "competicion") return { nombre: `Gravel ${e}de competición`, porque: "Más ligera y rápida, para pistas rápidas y carreras." };
      return { nombre: `Gravel ${e}polivalente`, porque: "Vale para asfalto y caminos en la misma salida: la más versátil." };
    case "mtb":
      if (sp === "competicion") return { nombre: `MTB ${e}de XC (rally)`, porque: "Ligera y eficiente subiendo: la de las carreras de montaña." };
      if (mtbFull(s, budget)) return { nombre: `MTB ${e}doble suspensión de trail${sp === "descensos" ? "/enduro" : ""}`, porque: "Suspensión delante y detrás: más control y confianza bajando." };
      return { nombre: `MTB ${e}rígida (suspensión delantera)`, porque: "Más ligera, barata y fácil de mantener: perfecta para pistas y senderos." };
    case "urbana":
      return { nombre: `Urbana ${e}o híbrida`, porque: "Postura erguida, ves y te ven, y lista para el día a día." };
    default:
      return { nombre: `Trekking ${e}o paseo`, porque: "Cómoda, con portabultos y guardabarros para rutas tranquilas." };
  }
}

/** Talla orientativa por altura (adultos). Cada marca mide distinto: se confirma con su tabla. */
export function sizeHint(h: number): string {
  if (h < 156) return "XS";
  if (h < 167) return "S";
  if (h < 178) return "M";
  if (h < 188) return "L";
  if (h < 196) return "XL";
  return "XXL";
}

// ─── Consejos parciales (uno por turno, cuando un dato nuevo permite decir algo útil) ──────────────

export function partialTip(s: Slots, said: string[], fresh: (keyof Slots)[]): { key: string; text: string } | null {
  const has = (k: keyof Slots) => fresh.includes(k);
  const tips: { key: string; when: boolean; text: () => string }[] = [
    {
      key: "budget-low",
      when: !!s.uso && !!s.presupuesto && (s.uso === "infantil" || s.electrica !== undefined) && s.presupuesto < minBudget(s.uso, s.electrica === "si"),
      text: () => `Ojo: para ${s.electrica === "si" ? "una eléctrica de " : ""}${USE_LABEL[s.uso!]}, las bicis decentes suelen empezar en torno a ${eur(minBudget(s.uso!, s.electrica === "si"))}. Con menos se puede, pero con piezas muy básicas. ¿Te planteas estirar un poco?`,
    },
    {
      key: "type",
      when: !!s.uso && (has("uso") || has("electrica") || has("usoConcreto")),
      text: () => {
        const t = bikeType(s);
        return `Para eso te encaja una ${lowerFirst(t.nombre)}. ${t.porque}`;
      },
    },
    {
      key: "tier",
      when: !!s.uso && !!s.presupuesto && s.uso !== "infantil" && s.electrica !== undefined,
      text: () =>
        s.nivel === "novato" || s.nivel === "curioso"
          ? `Con tus ${eur(s.presupuesto!)} ya hay bicis con ${plainTier(s.uso!, s.presupuesto!, s.electrica === "si")} y frenos ${s.presupuesto! >= 600 ? "de disco hidráulicos (frenan fuerte apretando poco)" : "de disco mecánicos o de llanta: suficientes para empezar"}.`
          : `Con tus ${eur(s.presupuesto!)} ya entras en ${transmission(s.uso!, s.presupuesto!, s.electrica === "si")}, y frenos de ${brakes(s.uso!, s.presupuesto!)}.`,
    },
    {
      key: "electric",
      when: s.electrica === "si" && has("electrica"),
      text: () => "Con motor subes sin sufrir y llegas más lejos; a cambio pesa más y la batería hay que cargarla. Mira bien la batería (Wh: autonomía) y el par del motor (Nm: fuerza).",
    },
    {
      key: "duration",
      when: has("duracion") && !!s.duracion,
      text: () => isLong(s.duracion) && (s.usoConcreto?.kind === "competicion" || s.usoConcreto?.kind === "triatlon")
        ? "En salidas largas a ritmo de carrera, la comodidad también es rendimiento: talla bien ajustada y cubiertas de 28-30 mm."
        : isLong(s.duracion)
        ? "Para salidas largas importa mucho la postura: buscaremos una geometría cómoda (manillar más alto) y cubiertas algo anchas."
        : (s.duracion?.minutes ?? 0) >= 60 || (s.duracion?.km ?? 0) >= 20
          ? "Para salidas de una o dos horas va bien una postura equilibrada: ni muy estirada ni muy erguida."
          : "Para salidas cortas no hace falta afinar tanto: prima que sea cómoda y fácil de mantener.",
    },
    {
      key: "size",
      when: has("altura") && !!s.altura && s.uso !== "infantil",
      text: () => `Con ${cm(s.altura!)} sueles estar en una talla ${sizeHint(s.altura!)}, pero cada marca mide distinto: en el catálogo te calculamos la talla de cada bici con su tabla oficial.`,
    },
    {
      key: "material",
      when: has("material") && !!s.uso && !!s.presupuesto && (s.material === "carbono" || s.material === "titanio") && !frame(s, s.presupuesto).endsWith("como buscas"),
      text: () => `Sobre el cuadro: ${frame(s, s.presupuesto!)}.`,
    },
    {
      key: "shifting",
      when: has("cambio") && s.cambio === "electronico" && !!s.presupuesto && s.presupuesto < 2800,
      text: () => `El cambio electrónico suele empezar en bicis de unos 2.800 € o más. Con ${eur(s.presupuesto!)} lo normal es mecánico, que funciona muy bien.`,
    },
    {
      key: "gearing",
      when: has("desarrollo") && s.desarrollo?.kind === "subir",
      text: () => family(s.uso ?? "carretera") === "asfalto"
        ? "Para puertos, mira un plato compacto delante (50/34 o 48/35) y un piñón grande detrás (34 dientes o más): subes con más soltura."
        : "Para subir, un monoplato pequeño con un piñón trasero de 50 dientes o más es lo que mejor funciona.",
    },
    {
      key: "weight",
      when: has("peso") && !!s.peso?.kg && !!s.uso && s.peso.kg < 8.5 && (s.presupuesto ?? 0) < 3500 && s.uso !== "mtb",
      text: () => `Bajar de ${s.peso!.kg} kg suele pedir carbono y piezas de gama alta (más de 3.500 €). Lo tendré en cuenta, pero quizá haya que elegir entre peso y presupuesto.`,
    },
  ];
  const t = tips.find((x) => x.when && !said.includes(x.key));
  return t ? { key: t.key, text: t.text() } : null;
}

// ─── Resumen y recomendación final ──────────────────────────────────────────

export function summary(s: Slots): SummaryItem[] {
  const items: SummaryItem[] = [];
  const add = (label: string, value: string | 0 | null | undefined) => {
    if (typeof value === "string" && value) items.push({ label, value });
  };
  add("Perfil", s.nivel && LEVEL_LABEL[s.nivel]);
  add("Uso", s.uso && [USE_LABEL[s.uso], ...(s.usosExtra ?? []).map((u) => `algo de ${USE_LABEL[u]}`)].join(", "));
  add("Uso concreto", slotPhrase(s, "usoConcreto"));
  add("Presupuesto", s.presupuesto && `hasta unos ${eur(s.presupuesto)}`);
  if (s.uso !== "infantil") add("Eléctrica", s.electrica && { si: "Sí", no: "No", igual: "Te da igual" }[s.electrica]);
  add("Salidas", s.duracion?.text);
  add(s.uso === "infantil" ? "Altura del niño" : "Altura", s.altura && `${s.altura} cm`);
  add("Cuadro", s.material && (s.material === "indiferente" ? "Sin preferencia" : s.material));
  add("Cambio", s.cambio && { mecanico: "Mecánico", electronico: "Electrónico", indiferente: "Sin preferencia" }[s.cambio]);
  add("Desarrollos", s.desarrollo && gearingText(s.desarrollo));
  add("Peso de la bici", s.peso?.text);
  add("Necesidades", s.necesidades && (s.necesidades.length ? s.necesidades.join("; ") : "Ninguna más"));
  return items;
}

export function finalRecommendation(s: Slots): FinalRec {
  const budget = s.presupuesto!;
  const u = s.uso!;
  const el = s.electrica === "si";
  const tipo = bikeType(s, budget);

  const caracteristicas: SummaryItem[] = [
    { label: "Cuadro", value: frame(s, budget) },
    { label: "Transmisión", value: transmission(u, budget, el) },
    { label: "Frenos", value: brakes(u, budget) },
    { label: "Ruedas", value: wheels(s) },
    { label: "Peso orientativo", value: weightHint(s, budget) },
  ];
  if (u !== "infantil") caracteristicas.push({ label: "Talla orientativa", value: s.altura ? `${sizeHint(s.altura)} (confírmala con la tabla de cada marca)` : "falta tu altura" });
  if (u !== "infantil") caracteristicas.push({ label: "¿Eléctrica?", value: electricVerdict(s) });

  const low = Math.max(minBudget(u, el), Math.round((budget * 0.7) / 50) * 50);
  const high = Math.round((budget * 1.25) / 50) * 50;
  /** Lo que cambia a otro presupuesto: transmisión, frenos y cuadro; si no cambia nada, lo típico de ese salto */
  const diff = (b: number, up: boolean): string => {
    const parts: string[] = [];
    const tr = transmission(u, b, el);
    if (tr !== transmission(u, budget, el)) parts.push(`Transmisión: ${tr}`);
    if (brakes(u, b) !== brakes(u, budget)) parts.push(`Frenos: ${brakes(u, b)}`);
    if (!s.material || s.material === "indiferente") {
      const f = frame(s, b);
      if (f.split(":")[0] !== frame(s, budget).split(":")[0]) parts.push(`Cuadro: ${f.split(":")[0]}`);
    }
    if (parts.length) return `${parts.join(". ")}.`;
    const same: Record<Family, [string, string]> = {
      asfalto: ["Mismas gamas, con ruedas y acabados más sencillos (algo más de peso).", "Ruedas más ligeras y mejores cubiertas: es lo que más se nota al rodar."],
      mtb: ["Mismas gamas, con horquilla y ruedas más sencillas.", "Mejor horquilla y ruedas más ligeras: más control y menos peso."],
      ciudad: ["Equipamiento más básico: comprueba que traiga luces, guardabarros y portabultos.", "Más equipada y con menos mantenimiento: luces con dinamo, portabultos, cambio interno o correa."],
      infantil: ["Más sencilla: que pese poco y frene bien es lo que importa.", ""],
    };
    return same[family(u)][up ? 1 : 0];
  };
  const alternativas: FinalRec["alternativas"] = [];
  // La recomendada primero; luego por debajo y por encima
  alternativas.push({ titulo: "La recomendada", precio: `hasta ${eur(budget)}`, texto: `${tipo.nombre}. Transmisión: ${transmission(u, budget, el)}.` });
  if (low < budget * 0.95) alternativas.push({ titulo: "Si quieres ajustar", precio: `unos ${eur(low)}`, texto: diff(low, false) });
  if (u !== "infantil") alternativas.push({ titulo: "Si estiras", precio: `unos ${eur(high)}`, texto: diff(high, true) });
  if (s.electrica === "igual" && u !== "infantil")
    alternativas.push({ titulo: "Versión eléctrica", precio: `desde unos ${eur(minBudget(u, true))}`, texto: "Si quieres ayuda en las subidas o ir más lejos sin cansarte." });

  const pendientes: string[] = [];
  if (u !== "infantil") pendientes.push("Tu entrepierna (descalzo, del suelo a la entrepierna): afina la talla si estás entre dos.");
  else pendientes.push("Si el niño está creciendo rápido, que llegue al suelo con las puntas de los pies con el sillín algo subido.");
  if (s.electrica === "igual") pendientes.push("Decide si quieres motor: cambia mucho el precio y el peso.");
  if (s.material === "indiferente" && budget >= 1800 && family(u) !== "ciudad") pendientes.push("Si te compensa pagar más por carbono (menos peso) o prefieres aluminio mejor montado.");
  if (s.usoDuda) pendientes.push("Confirma que el uso que hemos elegido es por donde vas a rodar de verdad.");
  if (s.pesoCiclista && s.pesoCiclista > 100) pendientes.push("El peso máximo que admite la bici (ciclista + carga): mira la ficha de la marca.");
  if (s.peso?.kg) pendientes.push(`El peso real: pides menos de ${String(s.peso.kg).replace(".", ",")} kg y las marcas suelen dar el de la talla M sin pedales.`);
  if (s.necesidades?.length) pendientes.push(`Que el modelo cumpla lo que pides: ${s.necesidades.join("; ")}.`);
  if (budget < minBudget(u, el)) pendientes.push(`Tu presupuesto está por debajo de lo habitual para este tipo (${eur(minBudget(u, el))}): revisa si puedes estirar.`);
  pendientes.push("Precio y stock en la web de la marca antes de comprar.");

  const consejo: Record<Level, string> = {
    novato: "Deja algo de dinero para casco, luces y candado, y haz la primera revisión al mes: los cables y radios se asientan.",
    curioso: "Prioriza cuadro y frenos: el resto de piezas se puede mejorar con el tiempo.",
    avanzado: "Antes de comprar, prueba la bici o hazte un estudio biomecánico: una talla bien ajustada vale más que una gama más.",
    pro: "Compara la geometría (stack y reach) con tu bici actual y pide que te la monten con tus medidas.",
  };

  return { perfil: summary(s), tipo, caracteristicas, alternativas, pendientes, consejo: consejo[s.nivel ?? "novato"] };
}

function electricVerdict(s: Slots): string {
  if (s.electrica === "si") return "Sí, como quieres: subes sin sufrir y llegas más lejos.";
  if (s.electrica === "no") return "No: para lo que cuentas no la necesitas.";
  const reasons: string[] = [];
  if (isLong(s.duracion)) reasons.push("haces salidas largas");
  if (s.uso === "urbana") reasons.push("llegarías al trabajo sin sudar");
  if (s.desarrollo?.kind === "subir") reasons.push("te preocupan las subidas");
  return reasons.length ? `Puede tener sentido: ${reasons.join(" y ")}.` : "No hace falta, pero te enseño las dos opciones.";
}
