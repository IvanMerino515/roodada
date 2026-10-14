// "Por qué esta bici": pros y contras frente a las otras recomendadas, y una explicación larga para la ficha.
// Todo sale de datos publicados; lo que falta se dice, no se rellena.
import type { Bike } from "../catalog/types";
import { label } from "../format";
import { LEVELS, PRIORITIES, type Answers } from "./questions";
import type { ScoreKey, Scored } from "./score";
import { effectivePriorities } from "./score";
import { STANDOVER_MARGIN_MM } from "./sizing";
import { TIER_LABELS } from "./tiers";

export type Explanation = {
  /** A favor: la talla primero y luego lo que la distingue de las demás recomendadas (máx. 4) */
  pros: string[];
  /** En contra: lo que hay que saber antes de comprarla (máx. 4; puede estar vacío) */
  cons: string[];
  /** Explicación larga, en párrafos, para la ficha */
  story: string[];
};

const MAX_PROS = 4;
const MAX_CONS = 4;

const eur = (cents: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(cents / 100);
const metres = (cm: number) => (cm / 100).toLocaleString("es-ES", { minimumFractionDigits: 2 }) + " m";
const kg = (g: number) => (g / 1000).toLocaleString("es-ES", { maximumFractionDigits: 1 }) + " kg";
const pct = (v: number) => `${Math.round(v * 100)} %`;
const dec = (n: number) => n.toLocaleString("es-ES", { maximumFractionDigits: 1 });
const capitalize = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const listJoin = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} y ${xs.at(-1)}` : (xs[0] ?? ""));

/** Comparaciones dentro del grupo recomendado. La mejor única gana un pro; la peor única, un contra. */
type Metric = {
  key: string;
  value: (r: Scored) => number | null;
  better: "higher" | "lower";
  pro: (r: Scored, all: Scored[]) => string;
  con?: (r: Scored) => string;
  when?: (a: Answers) => boolean;
};

const ciudadKit = (b: Bike) =>
  ([
    [b.specs.lights, "luces"],
    [b.specs.fenders, "guardabarros"],
    [b.specs.rack, "portabultos"],
    [b.specs.kickstand, "caballete"],
  ] as const);

function metrics(a: Answers): Metric[] {
  const sporty = effectivePriorities(a).has("rendimiento");
  return [
    {
      key: "precio",
      value: (r) => r.bike.priceCents,
      better: "lower",
      pro: (r, all) => {
        const next = Math.min(...all.filter((o) => o !== r).map((o) => o.bike.priceCents));
        return `La más barata de tus opciones: ${eur(next - r.bike.priceCents)} menos que la siguiente`;
      },
      con: () => "La más cara de tus opciones",
    },
    {
      key: "calidad",
      value: (r) => (r.bike.category === "bici-infantil" ? null : r.bike.quality.total),
      better: "higher",
      pro: (r) => `La mejor calidad-precio de tus opciones (${dec(r.bike.quality.total)}/10)`,
      con: (r) => `La calidad-precio más baja de tus opciones (${dec(r.bike.quality.total)}/10)`,
    },
    {
      key: "componentes",
      value: (r) => r.bike.tier,
      better: "higher",
      pro: (r) => `El mejor grupo de tus opciones: ${r.bike.specs.groupset} (gama ${TIER_LABELS[r.bike.tier!]})`,
      con: (r) => `El grupo más básico de tus opciones: ${r.bike.specs.groupset}`,
      when: (x) => x.uso !== "infantil",
    },
    {
      key: "ligereza",
      value: (r) => r.bike.weightG,
      better: "lower",
      pro: (r) => `La más ligera de tus opciones (${kg(r.bike.weightG!)})`,
      con: (r) => `La más pesada de tus opciones (${kg(r.bike.weightG!)})`,
    },
    sporty
      ? {
          key: "postura",
          value: (r) => r.uprightPct,
          better: "lower",
          pro: () => "La postura más deportiva de tus opciones",
        }
      : {
          key: "postura",
          value: (r) => r.uprightPct,
          better: "higher",
          pro: () => "La postura más cómoda de tus opciones: vas más erguido",
          con: () => "La postura más estirada de tus opciones: carga más la espalda",
        },
    {
      key: "autonomia",
      value: (r) => (r.bike.electric ? r.bike.specs.batteryWh : null),
      better: "higher",
      pro: (r) => `La batería más grande de tus opciones (${r.bike.specs.batteryWh} Wh)`,
      con: (r) => `La batería más pequeña de tus opciones (${r.bike.specs.batteryWh} Wh)`,
    },
    {
      key: "versatilidad",
      value: (r) => r.bike.specs.maxTyreWidthMm,
      better: "higher",
      pro: (r) => `Admite las cubiertas más anchas de tus opciones (hasta ${r.bike.specs.maxTyreWidthMm} mm)`,
      when: (x) => ["gravel", "montana", "montana-suave", "montana-tecnica", "paseo"].includes(x.uso) || x.prioridades.includes("versatilidad"),
    },
    {
      key: "ciudad",
      value: (r) => ciudadKit(r.bike).filter(([has]) => has).length,
      better: "higher",
      pro: (r) => `La más equipada: ${listJoin(ciudadKit(r.bike).filter(([has]) => has).map(([, n]) => n))}`,
      when: (x) => x.uso === "ciudad" || x.uso === "paseo",
    },
  ];
}

type Tagged = { key: string; text: string };

/** Lo que distingue a cada bici dentro del grupo. */
function relative(all: Scored[], a: Answers): Map<Scored, { pros: Tagged[]; cons: Tagged[] }> {
  const out = new Map(all.map((r) => [r, { pros: [] as Tagged[], cons: [] as Tagged[] }]));
  if (all.length < 2) return out;
  for (const m of metrics(a)) {
    if (m.when && !m.when(a)) continue;
    const withValue = all.map((r) => [r, m.value(r)] as const).filter((x): x is readonly [Scored, number] => x[1] !== null);
    if (withValue.length < 2) continue;
    const values = withValue.map(([, v]) => v);
    const best = m.better === "higher" ? Math.max(...values) : Math.min(...values);
    const worst = m.better === "higher" ? Math.min(...values) : Math.max(...values);
    if (best === worst) continue;
    const bests = withValue.filter(([, v]) => v === best);
    const worsts = withValue.filter(([, v]) => v === worst);
    if (bests.length === 1) out.get(bests[0][0])!.pros.push({ key: m.key, text: m.pro(bests[0][0], all) });
    // Solo es "la peor" si hay al menos tres con dato: entre dos, ser peor es solo ser distinta
    if (m.con && worsts.length === 1 && withValue.length >= 3) out.get(worsts[0][0])!.cons.push({ key: m.key, text: m.con(worsts[0][0]) });
  }
  return out;
}

function sizeLine(r: Scored, a: Answers): string {
  const { sizeFit } = r;
  if (sizeFit.fit === "entre") {
    const alt = sizeFit.alternative ? ` y ${sizeFit.alternative.label}` : "";
    return `Entre las tallas ${sizeFit.size.label}${alt} para ${metres(a.altura)}`;
  }
  return `Talla ${sizeFit.size.label} para ${metres(a.altura)} (${sizeFit.fit === "oficial" ? "según la tabla de la marca" : "talla estimada"})`;
}

/** Lo que hay que saber de la bici en sí, sin compararla. */
function absoluteCons(r: Scored, a: Answers): Tagged[] {
  const { bike, sizeFit } = r;
  const s = bike.specs;
  const cons: Tagged[] = [];
  if (r.overBudget) cons.push({ key: "precio", text: `${eur(bike.priceCents - a.presupuesto * 100)} por encima de tu presupuesto` });
  if (r.clearanceMm !== null && r.clearanceMm < 0) {
    cons.push({ key: "talla", text: `Con tu entrepierna no pasas por encima del tubo en la talla ${sizeFit.size.label}` });
  } else if (r.clearanceMm !== null && r.clearanceMm < STANDOVER_MARGIN_MM) {
    cons.push({ key: "talla", text: `Holgura justa sobre el tubo (${Math.round(r.clearanceMm / 10)} cm)` });
  }
  if (sizeFit.fit === "entre") cons.push({ key: "talla", text: "Estás entre dos tallas: pruébala antes de comprar" });
  if (sizeFit.fit === "estimada") cons.push({ key: "talla", text: "La marca no publica tabla de tallas: la talla es estimada" });
  if (a.uso !== "ciudad" && a.uso !== "paseo" && a.uso !== "infantil") {
    if (s.brakes === "llanta") cons.push({ key: "frenos", text: "Frenos de llanta: frenan peor con lluvia que los de disco" });
    if (s.brakes === "disco_mecanico") cons.push({ key: "frenos", text: "Frenos de disco mecánicos: menos potentes que los hidráulicos" });
  }
  if (a.uso === "ciudad" || a.uso === "paseo") {
    const missing = ciudadKit(bike).filter(([has]) => !has).map(([, n]) => n);
    if (missing.length) cons.push({ key: "ciudad", text: `Sin ${listJoin(missing)} de serie` });
  }
  const asked = effectivePriorities(a);
  if (asked.has("ligereza") && bike.weightG === null) cons.push({ key: "ligereza", text: "La marca no publica el peso" });
  if (asked.has("autonomia") && bike.electric && s.batteryWh === null) cons.push({ key: "autonomia", text: "La marca no publica la batería" });
  if (asked.has("componentes") && s.groupset === null) cons.push({ key: "componentes", text: "La marca no publica el grupo de transmisión" });
  return cons;
}

/** Lo que destaca respecto a lo que ha pedido (para cuando no hay grupo con el que comparar o queda hueco). */
function priorityPros(r: Scored, a: Answers): Tagged[] {
  const out: { w: number; t: Tagged }[] = [];
  for (const [key, w] of effectivePriorities(a)) {
    const v = r.parts[key];
    if (v === null || v === undefined || v < 0.6) continue;
    const text = priorityText(key, r, a);
    if (text) out.push({ w: w * v, t: { key: key === "comodidad" || key === "rendimiento" ? "postura" : key, text } });
  }
  if (r.bike.category !== "bici-infantil" && r.bike.quality.total >= 6.5) {
    out.push({ w: 0.3, t: { key: "calidad", text: `Calidad-precio ${dec(r.bike.quality.total)}/10 frente a las de su tipo` } });
  }
  return out.sort((x, y) => y.w - x.w).map((x) => x.t);
}

function priorityText(key: ScoreKey, r: Scored, a: Answers): string | null {
  const { bike } = r;
  const s = bike.specs;
  switch (key) {
    case "comodidad":
      return "Postura de las más erguidas entre las que encajan contigo";
    case "rendimiento":
      return "Postura deportiva, de las más agresivas entre las que encajan contigo";
    case "ligereza":
      return bike.weightG ? `${kg(bike.weightG)}, de las más ligeras de su tipo` : null;
    case "componentes":
      return s.groupset && bike.tier
        ? `${s.groupset}${s.shifting === "electronico" ? " electrónico" : ""}: gama ${TIER_LABELS[bike.tier]}`
        : null;
    case "ahorro":
      return a.presupuesto * 100 > bike.priceCents ? `Te deja ${eur(a.presupuesto * 100 - bike.priceCents)} de margen` : null;
    case "versatilidad": {
      const bits = [
        s.tyreWidthMm ? `cubiertas de ${s.tyreWidthMm} mm` : null,
        s.maxTyreWidthMm ? `admite hasta ${s.maxTyreWidthMm} mm` : null,
        s.tubeless ? "tubeless" : null,
      ].filter(Boolean) as string[];
      return bits.length ? capitalize(bits.join(", ")) : null;
    }
    case "autonomia":
      return s.batteryWh ? `Batería de ${s.batteryWh} Wh` : null;
    case "ciudad": {
      const kit = ciudadKit(bike).filter(([has]) => has).map(([, n]) => n);
      return kit.length ? `Viene con ${listJoin(kit)}` : null;
    }
  }
}

/** Explicación larga: talla, lo que pediste, frente a las demás, calidad-precio y encaje. */
function story(r: Scored, a: Answers, others: number, rel: { pros: Tagged[]; cons: Tagged[] }, cons: Tagged[]): string[] {
  const { bike, sizeFit } = r;
  const s = bike.specs;
  const out: string[] = [];

  // Talla
  const range = sizeFit.size.heightMin && sizeFit.size.heightMax ? ` (de ${sizeFit.size.heightMin} a ${sizeFit.size.heightMax} cm)` : "";
  let talla =
    sizeFit.fit === "oficial"
      ? `Para ${metres(a.altura)} te corresponde la talla ${sizeFit.size.label}${range}, según la tabla de tallas de ${bike.brand}.`
      : sizeFit.fit === "estimada"
        ? `Para ${metres(a.altura)} te corresponde la talla ${sizeFit.size.label}${range}. ${bike.brand} no publica tabla de tallas, así que la estimamos a partir de su geometría.`
        : `Para ${metres(a.altura)} estás entre la talla ${sizeFit.size.label}${sizeFit.alternative ? ` y la ${sizeFit.alternative.label}` : ""}. Te proponemos la ${sizeFit.size.label}; la de más stack te llevará más erguido y la de más reach, más estirado. Si puedes, pruébalas.`;
  if (r.clearanceMm !== null) {
    talla +=
      r.clearanceMm >= 0
        ? ` Con tu entrepierna de ${a.entrepierna} cm te ${r.clearanceMm < 15 ? "queda apenas 1 cm" : `quedan unos ${Math.round(r.clearanceMm / 10)} cm`} de holgura sobre el tubo.`
        : ` Ojo: con tu entrepierna de ${a.entrepierna} cm el tubo queda ${Math.round(-r.clearanceMm / 10)} cm por encima; no podrías apoyar los pies con comodidad.`;
  }
  out.push(talla);

  // Lo que pediste
  const asked = [...effectivePriorities(a).keys()].filter((k): k is Exclude<ScoreKey, "rendimiento"> => k !== "rendimiento");
  const intro = a.prioridades.length
    ? `Nos dijiste que te importa ${listJoin(a.prioridades.map((k) => PRIORITIES[k].label.toLowerCase()))}.`
    : `Como ${LEVELS[a.nivel].label}, buscamos ante todo ${listJoin(asked.map((k) => PRIORITIES[k].label.toLowerCase()))}.`;
  const facts: string[] = [];
  for (const key of effectivePriorities(a).keys()) {
    const v = r.parts[key];
    if (v === null || v === undefined) {
      const what: Partial<Record<ScoreKey, string>> = { ligereza: "el peso", comodidad: "la geometría", rendimiento: "la geometría", autonomia: "la batería", componentes: "el grupo" };
      if (what[key]) facts.push(`${bike.brand} no publica ${what[key]}, así que en eso no suma ni resta.`);
      continue;
    }
    if (key === "comodidad") facts.push(`Su postura es más erguida que la del ${pct(v)} de las bicis que encajan contigo.`);
    if (key === "rendimiento") facts.push(`Su postura es más deportiva que la del ${pct(v)} de las bicis que encajan contigo.`);
    if (key === "ligereza" && bike.weightG) facts.push(`Pesa ${kg(bike.weightG)}: más ligera que el ${pct(v)} de las bicis de su tipo.`);
    if (key === "componentes" && s.groupset)
      facts.push(
        `Monta ${s.groupset}${bike.tier ? `, gama ${TIER_LABELS[bike.tier].toLowerCase()}` : ""}${s.shifting === "electronico" ? ", con cambio electrónico" : ""}${s.brakes ? `, y frenos de ${label(s.brakes)!.toLowerCase()}` : ""}.`,
      );
    if (key === "ahorro") facts.push(`Cuesta ${eur(bike.priceCents)}${a.presupuesto * 100 > bike.priceCents ? `: te deja ${eur(a.presupuesto * 100 - bike.priceCents)} para lo demás` : ""}.`);
    if (key === "versatilidad") { const t = priorityText(key, r, a); if (t) facts.push(`${t}.`); }
    if (key === "autonomia" && s.batteryWh) facts.push(`Su batería de ${s.batteryWh} Wh es más grande que la del ${pct(v)} de las eléctricas de su tipo.`);
    if (key === "ciudad") { const t = priorityText(key, r, a); facts.push(t ? `${t} de serie.` : "No trae equipamiento urbano de serie."); }
  }
  out.push([intro, ...facts].join(" "));

  // Frente a las demás
  if (others > 0) {
    const lower = (t: Tagged) => (t.text.charAt(0).toLowerCase() + t.text.slice(1)).replace(/ de tus opciones/g, "");
    const parts = [
      rel.pros.length
        ? `Frente a tus otras ${others} opciones: ${listJoin(rel.pros.map(lower))}.`
        : `Frente a tus otras ${others} opciones está equilibrada: no es la mejor ni la peor en nada concreto.`,
      rel.cons.length ? `En contra: ${listJoin(rel.cons.map(lower))}.` : "",
    ];
    out.push(parts.filter(Boolean).join(" "));
  }

  // Calidad-precio y encaje
  if (bike.category !== "bici-infantil") {
    out.push(
      `Su nota calidad-precio es ${dec(bike.quality.total)}/10 comparada con las ${bike.electric ? "eléctricas" : "bicis"} de su tipo: mide componentes, precio, cuadro y peso. En total, encaja un ${r.score} % con lo que nos has contado.`,
    );
  } else {
    out.push(`En total, encaja un ${r.score} % con lo que nos has contado.`);
  }

  // Lo que debes saber
  if (cons.length) out.push(`Antes de comprarla, ten en cuenta: ${listJoin(cons.map((c) => c.text.charAt(0).toLowerCase() + c.text.slice(1)))}.`);
  return out;
}

/** Explica cada bici del grupo recomendado, comparándola con las demás. */
export function explainAll<T extends Scored>(group: T[], a: Answers): (T & Explanation)[] {
  const rel = relative(group, a);
  return group.map((r) => {
    const own = rel.get(r)!;
    const pros: Tagged[] = [...own.pros];
    for (const p of priorityPros(r, a)) if (!pros.some((x) => x.key === p.key)) pros.push(p);
    const consAll: Tagged[] = [...absoluteCons(r, a)];
    for (const c of own.cons) if (!consAll.some((x) => x.key === c.key)) consAll.push(c);
    return {
      ...r,
      pros: [sizeLine(r, a), ...pros.slice(0, MAX_PROS - 1).map((p) => p.text)],
      cons: consAll.slice(0, MAX_CONS).map((c) => c.text),
      // En la explicación larga, los contras relativos ya salen al comparar; al final, solo los de la bici en sí
      story: story(r, a, group.length - 1, own, absoluteCons(r, a)),
    };
  });
}
