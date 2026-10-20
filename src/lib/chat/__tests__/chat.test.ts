import { describe, expect, it } from "vitest";

import { answersSchema } from "../../recommender/questions";
import { DEMOS } from "../demos";
import { canClose, reply, start, toAnswers } from "../engine";
import { parseBudget, parseDuration, parseElectric, parseHeight, parseUses } from "../extract";
import type { ChatState, Level } from "../types";

/** Juega una conversación y devuelve el estado y todos los mensajes del asistente. */
function play(lines: string[], from?: ChatState) {
  const init = from ? { state: from, messages: [] } : start();
  let state = init.state;
  const messages = init.messages;
  const all = [...messages];
  const turns: ReturnType<typeof reply>[] = [];
  for (const line of lines) {
    const r = reply(state, line);
    turns.push(r);
    state = r.state;
    all.push(...r.messages);
  }
  return { state, all, turns };
}

describe("lectura del texto", () => {
  it("presupuesto en sus formas habituales", () => {
    expect(parseBudget("unos 1.500 €", false)).toBe(1500);
    expect(parseBudget("hasta 2k", false)).toBe(2000);
    expect(parseBudget("2500 euros", false)).toBe(2500);
    expect(parseBudget("entre 1000 y 1500", false)).toBe(1500);
    expect(parseBudget("presupuesto de 900", false)).toBe(900);
    expect(parseBudget("800", true)).toBe(800);
  });
  it("no confunde altura, ruedas o peso con dinero", () => {
    expect(parseBudget("mido unos 175", false)).toBeUndefined();
    expect(parseBudget("ruedas de 29 y 12 kg", false)).toBeUndefined();
    expect(parseBudget("800", false)).toBeUndefined(); // sin € ni contexto, solo si se acaba de preguntar
  });
  it("altura", () => {
    expect(parseHeight("mido 1,76", false)).toBe(176);
    expect(parseHeight("1.8 m", false)).toBe(180);
    expect(parseHeight("176 cm", false)).toBe(176);
    expect(parseHeight("mido 182", false)).toBe(182);
    expect(parseHeight("175", true)).toBe(175);
    expect(parseHeight("175", false)).toBeUndefined();
  });
  it("eléctrica, con negaciones", () => {
    expect(parseElectric("quiero una electrica")).toBe("si");
    expect(parseElectric("sin motor")).toBe("no");
    expect(parseElectric("nada de motor")).toBe("no");
    expect(parseElectric("no quiero electrica")).toBe("no");
    expect(parseElectric("lo de electrica me da igual")).toBe("igual");
    expect(parseElectric("montana, electrica no")).toBe("no");
    expect(parseElectric("lo de electrica no lo tengo claro")).toBe("igual");
  });
  it("usos en orden y «puertos de montaña» no es MTB", () => {
    expect(parseUses("gravel y algo de ciudad")).toEqual(["gravel", "urbana"]);
    expect(parseUses("para subir puertos de montana")).toEqual(["carretera"]);
    expect(parseUses("para mi hijo")).toEqual(["infantil"]);
    expect(parseUses("salgo alguna vez con mis hijos")).toEqual([]);
  });
  it("duración", () => {
    expect(parseDuration("media hora", false)?.minutes).toBe(30);
    expect(parseDuration("1-2 horas", false)?.minutes).toBe(90);
    expect(parseDuration("un par de horas", false)?.minutes).toBe(120);
    expect(parseDuration("unos 40 km", false)?.km).toBe(40);
  });
});

describe("conversación", () => {
  it("empieza saludando y preguntando el perfil de forma abierta", () => {
    const { state, messages } = start();
    expect(state.pending).toEqual(["nivel"]);
    expect(messages.at(-1)!.paragraphs.join(" ")).toMatch(/c[oó]mo te definir[ií]as/i);
  });

  for (const level of Object.keys(DEMOS) as Level[]) {
    it(`demo ${level}: llega a la recomendación final con su estructura`, () => {
      const { state, all, turns } = play(DEMOS[level].messages);
      expect(state.phase).toBe("final");
      expect(state.slots.nivel).toBe(level);
      const final = all.find((m) => m.final)?.final;
      expect(final).toBeDefined();
      expect(final!.alternativas.length).toBeGreaterThan(1);
      expect(final!.alternativas.length).toBeLessThanOrEqual(4);
      expect(final!.pendientes.length).toBeGreaterThan(0);
      // Nunca más de 3 datos preguntados por turno
      for (const t of turns) expect(t.state.pending.length).toBeLessThanOrEqual(3);
      // El enlace a las bicis reales es válido para la guía de siempre
      expect(answersSchema.safeParse(toAnswers(state.slots)).success).toBe(true);
    });
  }

  it("el pro tiene campo libre con sugerencias para sus necesidades", () => {
    const lines = DEMOS.pro.messages.slice(0, 5);
    const { all, state } = play(lines);
    expect(state.pending).toEqual(["necesidades"]);
    expect(all.at(-1)!.autocomplete).toBe(true);
  });

  it("no cierra sin altura aunque tenga todo lo demás", () => {
    const { state, all } = play(["soy novato", "carretera, 1.000 €, sin motor", "salidas de 2 horas"]);
    expect(canClose(state.slots)).toBe(false);
    expect(state.pending).toEqual(["altura"]);
    expect(all.some((m) => m.final || m.summary)).toBe(false);
    const r = play(["vale, recomiendame ya"], state);
    expect(r.state.phase).not.toBe("final");
  });

  it("si no tiene claro el uso, le ayuda a decidir y no lo da por hecho", () => {
    const { state, all } = play(["novato", "no lo tengo claro"]);
    expect(state.slots.uso).toBeUndefined();
    expect(state.slots.usoDuda).toBe(true);
    expect(all.at(-1)!.paragraphs.join(" ")).toMatch(/carreteras, caminos/);
  });

  it("«no sé» en material lo deja abierto (vale como respuesta)", () => {
    const { state } = play(["soy curioso", "gravel, 1.200 €, sin motor", "2 horas, mido 1,70", "el material no lo tengo claro y el cambio mecanico"]);
    expect(state.slots.material).toBe("indiferente");
    expect(state.slots.cambio).toBe("mecanico");
  });

  it("si no entiende nada, repregunta con ejemplos", () => {
    const { all } = play(["soy novato", "patata"]);
    expect(all.at(-1)!.paragraphs[0]).toMatch(/No te he pillado/);
  });

  it("explica términos técnicos", () => {
    const { all } = play(["soy novato", "¿que es el gravel?"]);
    expect(all.find((m) => m.term)?.term?.text).toMatch(/caminos de tierra/);
  });

  it("después de la final, un cambio rehace la recomendación", () => {
    const { state } = play(DEMOS.curioso.messages);
    const r = reply(state, "mejor hasta 2.000 €");
    expect(r.state.slots.presupuesto).toBe(2000);
    expect(r.messages.some((m) => m.final)).toBe(true);
  });

  it("un nivel deducido no pisa uno dicho", () => {
    const { state } = play(["soy novato", "entreno 4 veces por semana en carretera"]);
    expect(state.slots.nivel).toBe("novato");
  });

  it("infantil: solo pide uso, presupuesto y altura del niño", () => {
    const { state } = play(["soy curioso", "es para mi hijo, unos 300 €", "mide 125 cm"]);
    expect(state.phase).toBe("confirmar");
    expect(toAnswers(state.slots)?.uso).toBe("infantil");
  });
});
