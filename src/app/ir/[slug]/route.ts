// Salida a la tienda. Todas las salidas pasan por aquí para poder medir clics y usar offers.affiliate_url
// sin tocar las páginas. Sin parámetros: la web oficial; con ?o=<id>: esa oferta de otra tienda.
import { after } from "next/server";

import { esBot as pareceBot } from "@/lib/actividad/eventos";
import { getBike, getBikeDetail } from "@/lib/catalog/load";
import { supabase } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: RouteContext<"/ir/[slug]">) {
  const bike = await getBike((await params).slug);
  if (!bike) return new Response("Bici no encontrada", { status: 404 });
  const detail = await getBikeDetail(bike.id);
  // ?o=<id>: el botón de otra tienda de la ficha («Ver en Hibike»). Solo vale una oferta activa de esta bici;
  // si no, la de la web oficial, como siempre
  const pedida = Number(new URL(request.url).searchParams.get("o"));
  const otra = pedida ? detail.otherOffers.find((o) => o.offerId === pedida) : undefined;
  const offer = otra ? { id: otra.offerId, url: otra.url, affiliateUrl: otra.affiliateUrl } : detail.offer;

  // Rastreadores, comprobadores de enlaces y previsualizaciones (WhatsApp, redes…) no son personas:
  // no se apuntan y van a la tienda por el enlace normal, nunca por el de afiliado, para no generar
  // clics a nuestro nombre en la red de afiliación (auditoría del 25-11-2026, A1, sin Vercel Pro).
  const esBot = pareceBot(request.headers.get("user-agent"));

  // El clic se apunta después de redirigir, para no retrasar la salida. Anónimo: solo la oferta,
  // la página de origen (ruta de Roodada, sin parámetros) y el precio de ese momento.
  if (offer && !esBot) {
    const source = sourcePage(request);
    after(async () => {
      const { error } = await supabase().rpc("registrar_clic", { p_offer_id: offer.id, p_source_page: source });
      if (error) console.error("registrar_clic:", error.message);
    });
  }

  return new Response(null, {
    status: 302,
    // Con programa de afiliación, el enlace de la red (que apunta a la misma página de la tienda), solo
    // para personas; sin él, o para bots, la página de la tienda tal cual
    headers: {
      Location: (esBot ? null : offer?.affiliateUrl) ?? offer?.url ?? bike.officialUrl,
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-store",
    },
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
