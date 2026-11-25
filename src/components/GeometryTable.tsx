import { InfoTip } from "@/components/InfoTip";
import type { BikeDetail } from "@/lib/catalog/load";

/** Qué es cada medida y qué supone tener más o menos (Edgar, 25 nov 2026: lenguaje llano). Se abre con el ⓘ junto al nombre. */
type Info = { que: string; mas: [string, string]; menos: [string, string]; nota?: string };
const GEOMETRY_INFO: Record<string, Info> = {
  stack_mm: {
    que: "Lo alto que queda la parte delantera de la bici, donde va el manillar.",
    mas: ["Más stack", "el manillar queda más alto y vas más erguido: más cómodo para la espalda y el cuello."],
    menos: ["Menos stack", "manillar más bajo y postura más agachada: más aerodinámica y de competición."],
  },
  reach_mm: {
    que: "Lo larga que es la bici entre el sillín y el manillar: cuánto tienes que estirarte para llegar.",
    mas: ["Más reach", "vas más estirado. La bici es más estable a alta velocidad y, en montaña, tienes más sitio para moverte en las bajadas."],
    menos: ["Menos reach", "postura más recogida y bici más ágil y fácil de manejar. Suele ir mejor a quien tiene el torso o los brazos cortos."],
  },
  top_tube_eff_mm: {
    que: "La distancia entre el sillín y el manillar, medida en línea recta.",
    mas: ["Más largo", "más espacio entre sillín y manillar."],
    menos: ["Más corto", "posición más compacta."],
    nota: "Depende también del ángulo del sillín: para comparar lo largas que son dos bicis, mejor el reach.",
  },
  seat_tube_angle_deg: {
    que: "Lo inclinado que va el tubo del sillín: si te sienta más encima de los pedales o más atrás.",
    mas: ["Más ángulo (más vertical)", "vas más encima de los pedales y empujas mejor en subidas empinadas. Típico de montaña moderna (76-78°) y de triatlón."],
    menos: ["Menos ángulo (más tumbado)", "vas más atrás. Lo habitual en carretera (72-74°): cómodo para pedalear sentado durante horas."],
  },
  seat_tube_mm: {
    que: "Lo alto que es el tubo donde entra la tija del sillín.",
    mas: ["Más largo", "cuadro más alto y menos tija a la vista. Si eres bajo, puede que el sillín no baje lo que necesitas."],
    menos: ["Más corto", "más margen para bajar el sillín y para meter una tija telescópica larga, y es más fácil pasar la pierna."],
  },
  head_tube_length_mm: {
    que: "Lo largo que es el tubo de delante, donde gira la horquilla.",
    mas: ["Más largo", "el manillar queda más alto y vas más erguido (sube el stack)."],
    menos: ["Más corto", "manillar más bajo y postura más agachada."],
  },
  head_tube_angle_deg: {
    que: "Lo inclinada que va la horquilla.",
    mas: ["Más ángulo (más vertical)", "dirección rápida y precisa. Lo habitual en carretera (72-74°)."],
    menos: ["Menos ángulo (más lanzada)", "más estable y aplomada a alta velocidad y en bajadas. Típico de montaña de bajada (63-66°)."],
  },
  chainstay_mm: {
    que: "Lo cerca que queda la rueda de atrás de los pedales.",
    mas: ["Más largas", "bici más estable y subes mejor sin que se levante la rueda delantera."],
    menos: ["Más cortas", "bici más ágil, que gira con más facilidad y con la que es más fácil levantar la rueda delantera."],
  },
  wheelbase_mm: {
    que: "La distancia entre el centro de las dos ruedas.",
    mas: ["Más larga", "bici más estable y aplomada, sobre todo rápido o en bajadas."],
    menos: ["Más corta", "bici más ágil, que gira en menos espacio."],
  },
  bb_drop_mm: {
    que: "Cuánto más bajos quedan los pedales que el centro de las ruedas.",
    mas: ["Más caída", "vas más «metido» en la bici: más estable, sobre todo en curva."],
    menos: ["Menos caída", "pedales más altos: más espacio con el suelo para no tocar con ellos en zonas técnicas o al pedalear en curva."],
  },
  standover_mm: {
    que: "La altura desde el suelo hasta el tubo de arriba del cuadro, por donde pasas la pierna.",
    mas: ["Más alto", "menos espacio entre la entrepierna y el cuadro cuando te bajas de la bici."],
    menos: ["Más bajo", "más fácil subir, bajar y poner el pie en el suelo, con margen de seguridad."],
  },
  fork_offset_mm: {
    que: "Lo adelantada que queda la rueda delantera respecto a la dirección.",
    mas: ["Más offset", "dirección más ligera y rápida."],
    menos: ["Menos offset", "dirección más tranquila y estable."],
  },
  trail_mm: {
    que: "Cuánto tiende la rueda delantera a ir recta sola. Sale del ángulo de dirección y del offset.",
    mas: ["Más trail", "bici más estable, que va recta casi sola y es menos nerviosa."],
    menos: ["Menos trail", "dirección más viva, que gira con menos esfuerzo."],
  },
  crank_length_mm: {
    que: "Lo largas que son las bielas, los brazos donde van los pedales.",
    mas: ["Más largas", "más palanca en cada pedalada. Suelen ir a ciclistas más altos."],
    menos: ["Más cortas", "las piernas giran más cómodas a muchas pedaladas por minuto y es más difícil tocar el suelo con el pedal. Suelen ir a ciclistas más bajos."],
  },
  handlebar_width_mm: {
    que: "Lo ancho que es el manillar.",
    mas: ["Más ancho", "más control y más estable, sobre todo en montaña."],
    menos: ["Más estrecho", "más aerodinámico y pasa mejor por huecos estrechos. En carretera suele elegirse parecido al ancho de los hombros."],
  },
  stem_length_mm: {
    que: "Lo larga que es la potencia, la pieza que une el manillar con la horquilla.",
    mas: ["Más larga", "manillar más lejos, postura más estirada y dirección más tranquila."],
    menos: ["Más corta", "manillar más cerca, postura más recogida y dirección más rápida."],
  },
  dropper_travel_mm: {
    que: "Cuánto baja el sillín con el mando de la tija telescópica.",
    mas: ["Más recorrido", "bajas más el sillín y te mueves mejor en las bajadas."],
    menos: ["Menos recorrido", "cabe en cuadros pequeños o con el tubo del sillín corto y basta para senderos fáciles."],
  },
};

function InfoText({ info }: { info: Info }) {
  return (
    <div className="grid gap-1 text-justify hyphens-auto">
      <p className="m-0">{info.que}</p>
      <ul className="m-0 p-0 list-none grid gap-0.5">
        {[info.mas, info.menos].map(([t, d]) => (
          <li key={t}>
            <strong className="font-semibold">{t}:</strong> {d}
          </li>
        ))}
      </ul>
      {info.nota && <p className="m-0 opacity-80">{info.nota}</p>}
    </div>
  );
}

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

/** Tallas con alguna medida de la tabla publicada (contador del desplegable de la ficha). */
export function geometrySizeCount(geometry: BikeDetail["geometry"]): number {
  return geometry.filter((s) => GEOMETRY_LABELS.some(([key]) => s.values[key] !== null && s.values[key] !== undefined)).length;
}

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
              <th key={s.label} scope="col" className={`font-display text-body py-1 px-1 text-right ${s.label === highlight ? "bg-choice text-on-choice" : ""}`}>
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([key, label, unit]) => (
            <tr key={key} className="border-t border-border">
              <th scope="row" className="eyebrow text-left font-normal py-1 px-2 whitespace-nowrap align-top">
                {GEOMETRY_INFO[key] ? (
                  <InfoTip text={<InfoText info={GEOMETRY_INFO[key]} />} label={`Qué es: ${label}`} textClassName="normal-case tracking-normal whitespace-normal w-[min(68ch,78vw)]">
                    {label} <span className="normal-case">({unit})</span>
                  </InfoTip>
                ) : (
                  <>{label} <span className="normal-case">({unit})</span></>
                )}
              </th>
              {geometry.map((s) => (
                <td key={s.label} className={`py-1 px-1 text-right font-mono ${s.label === highlight ? "bg-choice text-on-choice" : ""}`}>
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
