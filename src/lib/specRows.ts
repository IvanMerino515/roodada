// Filas de especificaciones: una sola definición para la ficha y la comparativa.
import type { Bike } from "./catalog/types";
import { CATEGORY_LABEL, DISCIPLINE_LABEL, eur, kg, label } from "./format";
import { TIER_LABELS } from "./recommender/tiers";

export type SpecRow = {
  group: string;
  label: string;
  value: (b: Bike) => string | null;
  /** Para resaltar la mejor en la comparativa: mayor o menor es mejor */
  better?: "higher" | "lower";
  numeric?: (b: Bike) => number | null;
};

const mm = (v: number | null) => (v === null ? null : `${v} mm`);
const yes = (v: boolean | null) => (v === null ? null : v ? "Sí" : "No");

export const SPEC_ROWS: SpecRow[] = [
  { group: "General", label: "Precio", value: (b) => eur(b.priceCents), better: "lower", numeric: (b) => b.priceCents },
  { group: "General", label: "Calidad-precio", value: (b) => (b.category === "bici-infantil" ? null : `${b.quality.total.toLocaleString("es-ES")}/10`), better: "higher", numeric: (b) => (b.category === "bici-infantil" ? null : b.quality.total) },
  { group: "General", label: "Tipo", value: (b) => `${CATEGORY_LABEL[b.category]} · ${DISCIPLINE_LABEL[b.specs.discipline]}` },
  { group: "General", label: "Eléctrica", value: (b) => yes(b.electric) },
  { group: "General", label: "Cuadro", value: (b) => label(b.frameMaterial) },
  { group: "General", label: "Peso", value: (b) => kg(b.weightG), better: "lower", numeric: (b) => b.weightG },
  { group: "General", label: "Año", value: (b) => (b.modelYear ? String(b.modelYear) : null) },
  { group: "Transmisión", label: "Grupo", value: (b) => b.specs.groupset },
  { group: "Transmisión", label: "Gama", value: (b) => (b.tier ? TIER_LABELS[b.tier] : null), better: "higher", numeric: (b) => b.tier },
  { group: "Transmisión", label: "Cambio", value: (b) => label(b.specs.shifting) },
  { group: "Transmisión", label: "Velocidades", value: (b) => (b.specs.speeds ? String(b.specs.speeds) : null) },
  { group: "Transmisión", label: "Platos", value: (b) => label(b.specs.drivetrain) },
  { group: "Frenos y ruedas", label: "Frenos", value: (b) => label(b.specs.brakes) },
  { group: "Frenos y ruedas", label: "Rueda", value: (b) => label(b.specs.wheelSize) },
  { group: "Frenos y ruedas", label: "Cubierta", value: (b) => mm(b.specs.tyreWidthMm), better: "higher", numeric: (b) => b.specs.tyreWidthMm },
  { group: "Frenos y ruedas", label: "Paso de rueda máximo", value: (b) => mm(b.specs.maxTyreWidthMm), better: "higher", numeric: (b) => b.specs.maxTyreWidthMm },
  { group: "Frenos y ruedas", label: "Tubeless", value: (b) => (b.specs.tubeless ? "Sí" : null) },
  { group: "Suspensión", label: "Suspensión", value: (b) => label(b.specs.suspension) },
  { group: "Suspensión", label: "Recorrido delantero", value: (b) => (b.specs.travelFrontMm ? mm(b.specs.travelFrontMm) : null) },
  { group: "Suspensión", label: "Recorrido trasero", value: (b) => (b.specs.travelRearMm ? mm(b.specs.travelRearMm) : null) },
  { group: "Suspensión", label: "Tija telescópica", value: (b) => yes(b.specs.dropperPost) },
  { group: "Eléctrica", label: "Motor", value: (b) => (b.electric ? [b.specs.motorBrand, b.specs.motorTorqueNm && `${b.specs.motorTorqueNm} Nm`].filter(Boolean).join(" · ") || null : null) },
  { group: "Eléctrica", label: "Batería", value: (b) => (b.electric && b.specs.batteryWh ? `${b.specs.batteryWh} Wh` : null), better: "higher", numeric: (b) => (b.electric ? b.specs.batteryWh : null) },
  { group: "Equipamiento", label: "Luces", value: (b) => yes(b.specs.lights) },
  { group: "Equipamiento", label: "Guardabarros", value: (b) => yes(b.specs.fenders) },
  { group: "Equipamiento", label: "Portabultos", value: (b) => yes(b.specs.rack) },
  { group: "Equipamiento", label: "Caballete", value: (b) => yes(b.specs.kickstand) },
];

/** Filas que tienen sentido para estas bicis (sin la sección eléctrica si ninguna lo es, etc.) */
export function rowsFor(bikes: Bike[]): SpecRow[] {
  return SPEC_ROWS.filter((r) => bikes.some((b) => r.value(b) !== null) || r.group === "General");
}
