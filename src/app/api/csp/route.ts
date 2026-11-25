// Recibe los avisos de la Content-Security-Policy (de momento en modo Report-Only, ver next.config.ts) y
// los deja en los logs de Vercel (Logs → buscar «csp»), resumidos: qué directiva y qué recurso. Sirve
// para ver si la política bloquearía algo propio antes de aplicarla. No guarda nada más.
import { BOT } from "@/lib/actividad/eventos";

export async function POST(request: Request) {
  if (BOT.test(request.headers.get("user-agent") ?? "")) return new Response(null, { status: 204 });
  const text = await request.text();
  if (text.length > 10_000) return new Response(null, { status: 413 });
  try {
    const json = JSON.parse(text) as unknown;
    // Formato antiguo ({"csp-report": {...}}) y nuevo (lista de informes con body)
    const informes = Array.isArray(json) ? json.map((r) => r?.body) : [(json as Record<string, unknown>)?.["csp-report"]];
    for (const r of informes.slice(0, 10)) {
      if (!r || typeof r !== "object") continue;
      const i = r as Record<string, unknown>;
      const recurso = String(i["blocked-uri"] ?? i.blockedURL ?? "").slice(0, 200);
      const directiva = String(i["violated-directive"] ?? i.effectiveDirective ?? "").slice(0, 60);
      // Solo la ruta de la página: la dirección completa puede llevar las respuestas de la guía
      const pagina = String(i["document-uri"] ?? i.documentURL ?? "").split(/[?#]/)[0].slice(0, 200);
      console.warn(`csp: ${directiva} · ${recurso} · ${pagina}`);
    }
  } catch {
    return new Response(null, { status: 400 });
  }
  return new Response(null, { status: 204 });
}
