// Recibe los eventos de uso del navegador y los apunta en Supabase con registrar_evento. Responde al
// momento (204) y apunta después, para no retrasar nada. Sin IP ni identificadores: solo lo validado.
import { after } from "next/server";

import { BOT, eventoSchema } from "@/lib/actividad/eventos";
import { supabase } from "@/lib/supabase/server";

let avisado = false;

export async function POST(request: Request) {
  if (BOT.test(request.headers.get("user-agent") ?? "")) return new Response(null, { status: 204 });
  // Solo desde nuestra propia web
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) return new Response(null, { status: 403 });

  const text = await request.text();
  if (text.length > 4000) return new Response(null, { status: 413 });
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }
  const parsed = eventoSchema.safeParse(json);
  if (!parsed.success) return new Response(null, { status: 400 });

  const { n, p, v, d } = parsed.data;
  after(async () => {
    const { error } = await supabase().rpc("registrar_evento", { p_nombre: n, p_pagina: p ?? null, p_visita: v ?? null, p_datos: d ?? {} });
    // Mientras no se haya ejecutado 002_eventos.sql la función no existe: se avisa una vez y ya
    if (error && !avisado) {
      avisado = true;
      console.error("registrar_evento:", error.message);
    }
  });
  return new Response(null, { status: 204 });
}
