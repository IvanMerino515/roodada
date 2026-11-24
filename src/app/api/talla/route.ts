// Calculadora de talla: con la altura (y la entrepierna), qué talla toca en las bicis de un tipo.
// Devuelve solo cifras agregadas (repartos y talla por marca), nunca el catálogo. La red de Vercel la
// guarda un día por combinación, así que casi nunca llega al servidor.
import { z } from "zod";

import { getCatalog } from "@/lib/catalog/load";
import { categoryFromSlug } from "@/lib/landings";
import { calcularTalla } from "@/lib/talla";

const schema = z.object({
  altura: z.coerce.number().int().min(90).max(215),
  entrepierna: z.coerce.number().int().min(40).max(110).optional(),
  tipo: z.string().max(20).optional(),
});

export async function GET(request: Request) {
  const params = Object.fromEntries([...new URL(request.url).searchParams].filter(([, v]) => v !== ""));
  const parsed = schema.safeParse(params);
  if (!parsed.success) return Response.json({ error: "Datos no válidos" }, { status: 400 });
  const { altura, entrepierna, tipo } = parsed.data;
  const categoria = tipo ? categoryFromSlug(tipo) : undefined;
  if (tipo && !categoria) return Response.json({ error: "Tipo no válido" }, { status: 400 });

  const r = calcularTalla(await getCatalog(), altura, entrepierna, categoria);
  return Response.json(
    { ...r, letras: r.letras.slice(0, 6), cm: r.cm.slice(0, 6), pulgadas: r.pulgadas.slice(0, 4), marcas: r.marcas.slice(0, 24) },
    { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" } },
  );
}
