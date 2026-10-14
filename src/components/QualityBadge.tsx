import type { Bike } from "@/lib/catalog/types";
import { decimal } from "@/lib/format";

/**
 * Nota calidad-precio. En infantil no se muestra: la fórmula mide gama de grupo y material,
 * que en bicis infantiles no reflejan la calidad (todas salen bajas).
 */
export function QualityBadge({ bike, large = false }: { bike: Bike; large?: boolean }) {
  if (bike.category === "bici-infantil") return null;
  const q = decimal(bike.quality.total);
  if (large) {
    return (
      <p className="flex items-baseline gap-1">
        <span className="font-display text-h2 num leading-none">{q}</span>
        <span className="eyebrow">sobre 10</span>
      </p>
    );
  }
  return (
    <span className="eyebrow num">
      Calidad-precio {q}<span className="sr-only"> sobre 10</span>
    </span>
  );
}
