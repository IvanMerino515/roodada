// Salida a la tienda. Todas las salidas pasan por aquí para poder medir clics y, en la fase 2,
// cambiar a offers.affiliate_url sin tocar las páginas.
import { after } from "next/server";

import { getBike, getBikeDetail } from "@/lib/catalog/load";
import { supabase } from "@/lib/supabase/server";

// Rastreadores y comprobadores de enlaces: no son clics de personas
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|curl|wget|python|headless/i;

export async function GET(request: Request, { params }: RouteContext<"/ir/[slug]">) {
  const bike = await getBike((await params).slug);
  if (!bike) return new Response("Bici no encontrada", { status: 404 });
  const { offer } = await getBikeDetail(bike.id);

  // El clic se apunta después de redirigir, para no retrasar la salida. Anónimo: solo la oferta,
  // la página de origen (ruta de Roodada, sin parámetros) y el precio de ese momento.
  if (offer && !BOT.test(request.headers.get("user-agent") ?? "")) {
    const source = sourcePage(request);
    after(async () => {
      const { error } = await supabase().rpc("registrar_clic", { p_offer_id: offer.id, p_source_page: source });
      if (error) console.error("registrar_clic:", error.message);
    });
  }

  return new Response(null, {
    status: 302,
    headers: { Location: offer?.url ?? bike.officialUrl, "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" },
  });
}

/** Ruta de la página de Roodada desde la que se salió ("/bici/…", "/guia/resultados"); nada de fuera ni parámetros. */
function sourcePage(request: Request): string | null {
  const referer = request.headers.get("referer");
  if (!referer) return null;
  try {
    const from = new URL(referer);
    return from.host === new URL(request.url).host ? from.pathname : null;
  } catch {
    return null;
  }
}
