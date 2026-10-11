// Talla recomendada por altura (docs/data/ANALISIS.md §5). Tres resultados, siempre visibles:
// "oficial" (la altura cae en el rango que publica la marca), "estimada" (rango estimado) y
// "entre" (solape de dos tallas o hueco de hasta GAP_CM entre ellas).
import type { Size } from "../catalog/types";

export const GAP_CM = 3;

export type SizeFit = {
  fit: "oficial" | "estimada" | "entre";
  size: Size;
  /** La otra talla posible cuando fit = "entre" */
  alternative?: Size;
};

const hasRange = (s: Size): s is Size & { heightMin: number; heightMax: number } =>
  s.heightMin !== null && s.heightMax !== null;
const center = (s: Size & { heightMin: number; heightMax: number }) => (s.heightMin + s.heightMax) / 2;

export function fitSize(sizes: Size[], heightCm: number): SizeFit | null {
  const ranged = sizes.filter(hasRange).sort((a, b) => a.heightMin - b.heightMin);
  if (ranged.length === 0) return null;

  const inside = ranged.filter((s) => heightCm >= s.heightMin && heightCm <= s.heightMax);
  if (inside.length === 1) {
    const s = inside[0];
    return { fit: s.heightSource === "oficial" ? "oficial" : "estimada", size: s };
  }
  if (inside.length > 1) {
    const [a, b] = [...inside].sort((x, y) => Math.abs(center(x) - heightCm) - Math.abs(center(y) - heightCm));
    return { fit: "entre", size: a, alternative: b };
  }

  // Ninguna talla cubre la altura: si hay una a menos de GAP_CM, entre tallas; si no, no encaja
  const below = ranged.filter((s) => s.heightMax < heightCm).at(-1);
  const above = ranged.find((s) => s.heightMin > heightCm);
  const dBelow = below ? heightCm - below.heightMax : Infinity;
  const dAbove = above ? above.heightMin - heightCm : Infinity;
  if (Math.min(dBelow, dAbove) > GAP_CM) return null;
  const nearest = dBelow <= dAbove ? below! : above!;
  const other = nearest === below ? above : below;
  const otherClose = other && Math.max(dBelow, dAbove) <= GAP_CM ? other : undefined;
  return { fit: "entre", size: nearest, alternative: otherClose };
}

/** Relación stack/reach: más alta = postura más erguida y cómoda */
export function uprightRatio(s: Size): number | null {
  return s.stackMm && s.reachMm ? s.stackMm / s.reachMm : null;
}
