// Bicis reales para el chat de la guía (/guia/chat): el mismo recomendador que /guia/resultados,
// con las respuestas que el chat ha deducido de la conversación. Solo lectura.
import { getCatalog } from "@/lib/catalog/load";
import { toPick } from "@/lib/chat/picks";
import { parseAnswers, recommend } from "@/lib/recommender";

export async function GET(request: Request) {
  const answers = parseAnswers(Object.fromEntries(new URL(request.url).searchParams));
  if (!answers) return Response.json({ error: "Respuestas no válidas" }, { status: 400 });
  const { results, matched } = recommend(await getCatalog(), answers);
  return Response.json(
    { matched, picks: results.map(toPick) },
    { headers: { "Cache-Control": "public, max-age=300" } },
  );
}
