// Salida a la tienda. Todas las salidas pasan por aquí para poder medir clics y, en la fase 2,
// cambiar a offers.affiliate_url sin tocar las páginas. (outbound_clicks no admite escritura
// pública todavía: el registro de clics se añade cuando haya una política o una función para ello.)
import { getBike, getBikeDetail } from "@/lib/catalog/load";

export async function GET(_request: Request, { params }: RouteContext<"/ir/[slug]">) {
  const bike = await getBike((await params).slug);
  if (!bike) return new Response("Bici no encontrada", { status: 404 });
  const { offer } = await getBikeDetail(bike.id);
  return new Response(null, {
    status: 302,
    headers: { Location: offer?.url ?? bike.officialUrl, "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" },
  });
}
