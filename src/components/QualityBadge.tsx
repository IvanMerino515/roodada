import { Badge } from "../../design-system/react";
import type { Bike } from "@/lib/catalog/types";
import { decimal } from "@/lib/format";

/**
 * Nota calidad-precio. En infantil no se muestra: la fórmula mide gama de grupo y material,
 * que en bicis infantiles no reflejan la calidad (todas salen bajas).
 */
export function QualityBadge({ bike }: { bike: Bike }) {
  if (bike.category === "bici-infantil") return null;
  const q = bike.quality.total;
  const tone = q >= 7 ? "success" : q >= 5 ? "neutral" : "warning";
  return (
    <Badge tone={tone} title={`Calidad-precio frente a otras bicis de su tipo. Datos disponibles: ${Math.round(bike.quality.coverage * 100)} %`}>
      Calidad-precio {decimal(q)}/10
    </Badge>
  );
}
