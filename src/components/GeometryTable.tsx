import type { BikeDetail } from "@/lib/catalog/load";

const GEOMETRY_LABELS: [key: string, label: string, unit: string][] = [
  ["stack_mm", "Stack", "mm"],
  ["reach_mm", "Reach", "mm"],
  ["top_tube_eff_mm", "Tubo horizontal efectivo", "mm"],
  ["seat_tube_mm", "Tubo de sillín", "mm"],
  ["seat_tube_angle_deg", "Ángulo de sillín", "°"],
  ["head_tube_length_mm", "Tubo de dirección", "mm"],
  ["head_tube_angle_deg", "Ángulo de dirección", "°"],
  ["chainstay_mm", "Vainas", "mm"],
  ["wheelbase_mm", "Distancia entre ejes", "mm"],
  ["bb_drop_mm", "Caída de pedalier", "mm"],
  ["standover_mm", "Standover", "mm"],
  ["fork_offset_mm", "Offset de horquilla", "mm"],
  ["trail_mm", "Trail", "mm"],
  ["crank_length_mm", "Bielas", "mm"],
  ["handlebar_width_mm", "Manillar", "mm"],
  ["stem_length_mm", "Potencia", "mm"],
  ["dropper_travel_mm", "Recorrido de tija", "mm"],
];

/** Geometría por talla. Solo muestra las medidas que la marca publica para alguna talla. */
export function GeometryTable({ geometry, highlight }: { geometry: BikeDetail["geometry"]; highlight?: string }) {
  const rows = GEOMETRY_LABELS.filter(([key]) => geometry.some((s) => s.values[key] !== null && s.values[key] !== undefined));
  if (rows.length === 0) return <p className="px-2 py-2 border-t border-border italic">La marca no publica la geometría de esta bici.</p>;
  return (
    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Geometría por talla (desliza para ver todas las tallas)">
      <table className="w-full text-small border-collapse num">
        <caption className="sr-only">Geometría por talla</caption>
        <thead>
          <tr className="border-t border-border">
            <th scope="col" className="eyebrow text-left font-normal py-1 px-2">Talla</th>
            {geometry.map((s) => (
              <th key={s.label} scope="col" className={`font-display text-body py-1 px-1 text-right ${s.label === highlight ? "bg-accent text-on-accent" : ""}`}>
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([key, label, unit]) => (
            <tr key={key} className="border-t border-border">
              <th scope="row" className="eyebrow text-left font-normal py-1 px-2 whitespace-nowrap">{label} <span className="normal-case">({unit})</span></th>
              {geometry.map((s) => (
                <td key={s.label} className={`py-1 px-1 text-right font-mono ${s.label === highlight ? "bg-accent text-on-accent" : ""}`}>
                  {s.values[key] ?? "–"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
