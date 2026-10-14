// Contador en vivo de la guía: cuántas bicis quedan con las respuestas dadas hasta ahora,
// y cuántas quedarían con cada opción (para no llevar a una lista vacía).
import { getCatalog } from "@/lib/catalog/load";
import { funnelCounts, matchesElectric, matchesUse } from "@/lib/recommender/filters";
import { answersSchema, ELECTRIC, USES, type Answers, type ElectricKey, type UseKey } from "@/lib/recommender/questions";

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = answersSchema.partial().omit({ prioridades: true, entrepierna: true }).safeParse(params);
  if (!parsed.success) return Response.json({ error: "Respuestas no válidas" }, { status: 400 });
  const answers: Partial<Answers> = parsed.data;
  const bikes = await getCatalog();

  // Orden de la guía: eléctrica → presupuesto → uso → altura.
  // Cuántas quedarían con cada opción de eléctrica (sin más respuestas) y con cada uso (con eléctrica y presupuesto).
  const porElectrica = Object.fromEntries(
    (Object.keys(ELECTRIC) as ElectricKey[]).map((e) => [e, funnelCounts(bikes, { electrica: e }).electrica]),
  );
  const porUso = Object.fromEntries(
    (Object.keys(USES) as UseKey[]).map((uso) => [
      uso,
      funnelCounts(bikes, { electrica: answers.electrica, presupuesto: answers.presupuesto, uso }).uso,
    ]),
  );
  // Precio de la más barata con lo respondido: para sugerir un presupuesto mínimo realista
  const pool = bikes.filter(
    (b) =>
      b.inStock &&
      (!answers.uso || matchesUse(b, answers.uso)) &&
      (!answers.electrica || answers.uso === "infantil" || matchesElectric(b, answers.electrica)),
  );
  const desde = pool.length ? Math.min(...pool.map((b) => b.priceCents)) / 100 : null;

  return Response.json(
    { funnel: funnelCounts(bikes, answers), porUso, porElectrica, desde },
    { headers: { "Cache-Control": "public, max-age=300" } },
  );
}
