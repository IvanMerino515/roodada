// «Por qué te encaja»: une lo que la persona ha contado en el chat con los datos publicados de cada bici.
// Nada se supone: si la ficha no trae un dato que la persona pidió, se dice que falta.
import { TIER_LABELS } from "../recommender/tiers";
import { eur as eurN } from "./advice";
import type { ChatPick, Slots } from "./types";

const eur = (cents: number) => eurN(Math.round(cents / 100));
const metres = (cm: number) => `${(cm / 100).toFixed(2).replace(".", ",")} m`;
const kg = (g: number) => `${(g / 1000).toLocaleString("es-ES", { maximumFractionDigits: 1 })} kg`;
const listJoin = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} y ${xs.at(-1)}` : (xs[0] ?? ""));
const long = (s: Slots) => (s.duracion?.minutes ?? 0) >= 150 || (s.duracion?.km ?? 0) >= 60;
const racing = (s: Slots) => s.usoConcreto?.kind === "competicion" || s.usoConcreto?.kind === "triatlon";

export type Why = {
  /** Una línea: qué papel juega esta bici entre las recomendadas */
  headline: string;
  /** Por qué te encaja (de 2 a 4 frases, en segunda persona) */
  reasons: string[];
  /** Lo que conviene mirar antes de decidir */
  watch: string[];
};

/** El papel de cada bici frente a las demás: la 1.ª es la que más encaja; el resto, por lo que destacan. */
function headline(p: ChatPick, rank: number, all: ChatPick[]): string {
  if (rank === 0) return "La que más encaja contigo";
  const others = all.filter((o) => o !== p);
  const best = (v: (x: ChatPick) => number | null, lower: boolean) => {
    const mine = v(p);
    if (mine === null) return false;
    return others.every((o) => {
      const x = v(o);
      return x === null || (lower ? mine < x : mine > x);
    });
  };
  if (best((x) => x.priceCents, true)) return "La opción para gastar menos";
  if (best((x) => x.weightG, true)) return "La más ligera";
  if (best((x) => x.tier, false)) return "La mejor montada";
  if (best((x) => x.uprightPct, false)) return "La de postura más cómoda";
  if (best((x) => x.batteryWh, false)) return "La de más autonomía";
  return "Otra que te encaja";
}

const NEEDS: [RegExp, (p: ChatPick) => boolean | null, string, string][] = [
  [/tija|dropper/i, (p) => p.dropperPost, "Trae tija telescópica de serie, como pedías", "No trae tija telescópica: tendrías que añadirla"],
  [/tubeless/i, (p) => (p.tubeless ? true : null), "Ruedas preparadas para tubeless, como pedías", "La ficha no dice si es tubeless"],
  [/luces/i, (p) => p.kit.lights, "Viene con luces", "No trae luces"],
  [/portabultos|alforjas/i, (p) => p.kit.rack, "Lleva portabultos", "No lleva portabultos"],
  [/guardabarros/i, (p) => p.kit.fenders, "Lleva guardabarros", "No lleva guardabarros"],
  [/bateria/i, (p) => (p.batteryWh ? true : null), "", "La ficha no detalla la batería"],
  [/potenci[oó]metro/i, () => null, "", "Nuestros datos no dicen si trae potenciómetro: míralo en la ficha"],
];

export function whyForYou(p: ChatPick, s: Slots, rank: number, all: ChatPick[]): Why {
  const reasons: string[] = [];
  const watch: string[] = [];
  const novice = s.nivel === "novato";

  // Presupuesto
  if (s.presupuesto) {
    const budget = s.presupuesto * 100;
    const margin = budget - p.priceCents;
    if (p.overBudget) watch.push(`Se pasa ${eur(-margin)} de tus ${eur(budget)}`);
    else if (margin >= 5000) reasons.push(`Cuesta ${eur(p.priceCents)}: te quedan ${eur(margin)} de tus ${eur(budget)}${novice ? " para casco, luces y candado" : ""}`);
    else reasons.push(`Cuesta ${eur(p.priceCents)}: aprovecha tu presupuesto al máximo`);
  }

  // Talla
  if (s.altura) {
    const who = s.uso === "infantil" ? `Para ${metres(s.altura)}` : `Con tu ${metres(s.altura)}`;
    if (p.size.fit === "oficial") reasons.push(`${who} te va la talla ${p.size.label}, según la tabla oficial de ${p.brand}`);
    else if (p.size.fit === "estimada") {
      reasons.push(`${who} te iría la talla ${p.size.label}`);
      watch.push(`${p.brand} no publica tabla de tallas: la talla es estimada`);
    } else watch.push(`Estás entre la ${p.size.label}${p.size.alternative ? ` y la ${p.size.alternative}` : ""}: pruébalas antes`);
  }

  // Postura según cómo sales
  if (p.uprightPct !== null && all.length > 1) {
    if (long(s) && !racing(s) && p.uprightPct >= 0.6) reasons.push(`Su postura es de las más erguidas de tus opciones: se agradece en ${s.duracion!.text.startsWith("salidas") ? s.duracion!.text : `salidas de ${s.duracion!.text}`}`);
    if (racing(s) && p.uprightPct <= 0.4) reasons.push("Postura deportiva, de las más estiradas de tus opciones: la que piden las carreras");
    if (long(s) && !racing(s) && p.uprightPct <= 0.2) watch.push("Es de las más estiradas: en salidas largas puede cargar la espalda");
  }

  // Lo que pidió: material, cambio, peso
  if (s.material && s.material !== "indiferente" && p.frameMaterial) {
    if (p.frameMaterial === s.material) reasons.push(`Cuadro de ${p.frameMaterial}, como querías`);
    else watch.push(`El cuadro es de ${p.frameMaterial}, no de ${s.material}`);
  }
  if (s.cambio && s.cambio !== "indiferente" && p.shifting) {
    if (p.shifting === s.cambio) reasons.push(`Cambio ${s.cambio === "electronico" ? "electrónico" : "mecánico"}${p.groupset ? ` (${p.groupset})` : ""}, como pedías`);
    else watch.push(`El cambio es ${p.shifting === "electronico" ? "electrónico" : "mecánico"}, no ${s.cambio === "electronico" ? "electrónico" : "mecánico"}`);
  }
  if (s.peso?.kg) {
    if (p.weightG === null) watch.push("La marca no publica el peso");
    else if (p.weightG <= s.peso.kg * 1000) reasons.push(`Pesa ${kg(p.weightG)}: por debajo de los ${String(s.peso.kg).replace(".", ",")} kg que buscabas`);
    else watch.push(`Pesa ${kg(p.weightG)}, más de los ${String(s.peso.kg).replace(".", ",")} kg que buscabas`);
  } else if (s.peso?.light && p.weightG !== null && p.weightPct !== null && p.weightPct <= 0.25) {
    reasons.push(`Pesa ${kg(p.weightG)}: de las más ligeras de su tipo`);
  }

  // Según el uso
  if (p.electric && (p.batteryWh || p.motorTorqueNm)) {
    const parts = [p.batteryWh && `batería de ${p.batteryWh} Wh`, p.motorTorqueNm && `motor de ${p.motorTorqueNm} Nm`].filter(Boolean) as string[];
    reasons.push(`${listJoin(parts).replace(/^./, (c) => c.toUpperCase())}${novice ? " (Wh = autonomía, Nm = fuerza al subir)" : ""}`);
  }
  if (s.uso === "urbana" || s.usoConcreto?.kind === "commuting") {
    const kit = [p.kit.lights && "luces", p.kit.fenders && "guardabarros", p.kit.rack && "portabultos", p.kit.kickstand && "caballete"].filter(Boolean) as string[];
    if (kit.length) reasons.push(`Viene con ${listJoin(kit)}: lista para el día a día`);
    else watch.push("No trae luces ni guardabarros: cuenta con añadirlos");
  }
  if (s.uso === "gravel" && p.tyreWidthMm) reasons.push(`Cubiertas de ${p.tyreWidthMm} mm: agarre y comodidad en caminos`);
  if (s.uso === "mtb" && p.travelFrontMm) {
    const rear = p.suspension === "doble" && p.travelRearMm ? ` y ${p.travelRearMm} mm detrás` : "";
    reasons.push(`Suspensión de ${p.travelFrontMm} mm delante${rear}`);
    if (s.usoConcreto?.kind === "descensos" && p.suspension !== "doble") watch.push("Solo suspensión delantera: para bajar fuerte, mejor doble");
  }
  if (p.groupset && !reasons.some((r) => r.includes(p.groupset!))) {
    const tier = p.tier ? `, gama ${TIER_LABELS[p.tier]}` : "";
    reasons.push(`Grupo ${p.groupset}${p.speeds ? ` de ${p.speeds} velocidades` : ""}${tier}`);
  }
  if (novice && p.brakes === "disco_hidraulico") reasons.push("Frenos de disco hidráulicos: frenan fuerte apretando poco, ideal si empiezas");
  else if (p.brakes === "llanta" && s.uso !== "infantil" && s.uso !== "urbana" && s.uso !== "paseo") watch.push("Frenos de llanta: frenan peor con lluvia");

  // Lo que el Roodador pro escribió en abierto
  const needs = (s.necesidades ?? []).flatMap((n) => n.split(/,|;| y /).map((x) => x.trim()).filter(Boolean));
  for (const need of needs) {
    let matched = false;
    for (const [re, has, yes, no] of NEEDS) {
      if (!re.test(need)) continue;
      matched = true;
      const v = has(p);
      if (v === true && yes) reasons.push(yes);
      else watch.push(no);
    }
    if (!matched) watch.push(`Comprueba en la ficha: «${need}» (no lo tenemos en los datos)`);
  }

  // Lo que el recomendador ve frente a las demás (sin repetir la talla ni el precio)
  // (sin repetir un tema ya dicho: talla, precio, postura, peso, luces…)
  const TOPICS = /talla|presupuesto|barata|cara|postura|erguid|estirad|ligera|pesada|peso|kg|luces|guardabarros|grupo|cubiertas|tija/gi;
  const topics = (xs: string[]) => new Set(xs.join(" ").toLowerCase().match(TOPICS) ?? []);
  const said = topics([...reasons, ...watch]);
  const fresh = (x: string) => ![...topics([x])].some((k) => said.has(k));
  const extra = p.pros.slice(1).find(fresh);
  if (extra && reasons.length < 5) reasons.push(extra);
  for (const c of p.cons) if (watch.length < 3 && fresh(c) && !/entrepierna/i.test(c)) watch.push(c);

  return { headline: headline(p, rank, all), reasons: reasons.slice(0, 5), watch: [...new Set(watch)].slice(0, 3) };
}

/** Frase con la que el asistente presenta las bicis: cercana y con lo que ha contado la persona. */
export function picksIntro(picks: ChatPick[], matched: number, s: Slots): string {
  if (!picks.length) return "";
  const top = picks[0];
  const n = matched > picks.length ? `De ${matched} bicis del catálogo que encajan contigo, me quedo con ${picks.length}.` : `Te encajan ${picks.length}.`;
  return `${n} Mi favorita para ti es la ${top.brand} ${top.name}${s.altura && top.size.fit !== "entre" ? `, en talla ${top.size.label}` : ""}. Te cuento por qué:`;
}
