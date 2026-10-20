// Tipos del chat de la guía: lo que se sabe del Roodador y los mensajes del asistente.

export type Level = "novato" | "curioso" | "avanzado" | "pro";
export type Use = "carretera" | "gravel" | "mtb" | "urbana" | "paseo" | "infantil";
export type Electric = "si" | "no" | "igual";
export type Material = "aluminio" | "carbono" | "acero" | "titanio" | "indiferente";
export type Shifting = "mecanico" | "electronico" | "indiferente";
export type SpecificUse =
  | "competicion" | "triatlon" | "descensos" | "entrenamiento" | "cicloturismo" | "bikepacking" | "commuting" | "otro";

/** Duración habitual de las salidas: en minutos, o en km si lo dice así (no se convierte: no sabemos su ritmo). */
export type Duration = { minutes?: number; km?: number; text: string };
export type Gearing = { kind: "subir" | "velocidad" | "mixto" | "indiferente"; detail?: string };
export type Weight = { kg?: number; light?: boolean; indifferent?: boolean; text: string };

export type Slots = {
  nivel?: Level;
  presupuesto?: number; // euros, solo la bici
  uso?: Use;
  usosExtra?: Use[];
  /** Ha dicho que no tiene claro el uso: se le ayuda a decidir, no se cierra sin uso */
  usoDuda?: boolean;
  electrica?: Electric;
  duracion?: Duration;
  altura?: number; // cm
  material?: Material;
  cambio?: Shifting;
  usoConcreto?: { kind: SpecificUse; text: string };
  desarrollo?: Gearing;
  peso?: Weight;
  pesoCiclista?: number; // kg, si lo dice
  /** Roodador pro: lo que necesite y no se haya preguntado. [] = nada más */
  necesidades?: string[];
};

export type SlotKey = Exclude<keyof Slots, "usosExtra" | "usoDuda" | "pesoCiclista">;

export type Phase = "perfil" | "datos" | "confirmar" | "final";

export type ChatState = {
  slots: Slots;
  phase: Phase;
  /** Lo último que se preguntó (máximo 3 datos) */
  pending: SlotKey[];
  /** Consejos parciales ya dados, para no repetirlos */
  said: string[];
  turn: number;
};

export type SummaryItem = { label: string; value: string };

export type FinalRec = {
  perfil: SummaryItem[];
  tipo: { nombre: string; porque: string };
  caracteristicas: SummaryItem[];
  alternativas: { titulo: string; precio: string; texto: string }[];
  pendientes: string[];
  consejo: string;
};

export type BotMessage = {
  role: "bot";
  paragraphs: string[];
  /** Consejo parcial: va en una casilla aparte (amarilla, lo editorial) */
  tip?: string;
  /** Término técnico explicado */
  term?: { word: string; text: string };
  /** Tras la recomendación: buscar las bicis reales del catálogo que encajan */
  fetchPicks?: boolean;
  /** Lo pone la interfaz al pintar la recomendación: clave de sus bicis y el perfil con el que se pidieron */
  picksKey?: string;
  picksSlots?: Slots;
  /** Ejemplos de respuesta: solo ayudan, siempre se puede escribir otra cosa */
  chips?: string[];
  summary?: SummaryItem[];
  final?: FinalRec;
  /** El campo de texto ofrece sugerencias (necesidades del Roodador pro) */
  autocomplete?: boolean;
};

export type UserMessage = { role: "user"; text: string };
export type Message = BotMessage | UserMessage;

/** Una bici recomendada por el catálogo real (/api/recomendar), con lo que hace falta para explicarla. */
export type ChatPick = {
  slug: string;
  brand: string;
  name: string;
  imageUrl: string;
  priceCents: number;
  score: number;
  overBudget: boolean;
  size: { label: string; fit: "oficial" | "estimada" | "entre"; alternative: string | null };
  /** 0 = la postura más estirada de las candidatas, 1 = la más erguida; null sin geometría */
  uprightPct: number | null;
  electric: boolean;
  frameMaterial: string | null;
  weightG: number | null;
  /** Percentil de peso en su cohorte: 0 = la más ligera */
  weightPct: number | null;
  tier: number | null;
  groupset: string | null;
  shifting: "mecanico" | "electronico" | null;
  speeds: number | null;
  brakes: string | null;
  suspension: "rigida" | "delantera" | "doble" | null;
  travelFrontMm: number | null;
  travelRearMm: number | null;
  tyreWidthMm: number | null;
  tubeless: boolean | null;
  dropperPost: boolean;
  batteryWh: number | null;
  motorTorqueNm: number | null;
  kit: { lights: boolean; fenders: boolean; rack: boolean; kickstand: boolean };
  quality: number | null;
  /** A favor y en contra del recomendador (frente a las otras recomendadas) */
  pros: string[];
  cons: string[];
};
