-- 005 · Evento «foto_rota» (26-11-2026). Lo manda FotoBici.tsx cuando una foto de bici no carga ni optimizada
-- ni la original de la marca (la marca la ha movido o borrado). Datos: { bici, host, url }. Anónimo, como el resto.
-- Lo ejecuta Edgar en Supabase. Mismo cuerpo que la función actual, solo se añade 'foto_rota' a la lista.
create or replace function public.registrar_evento(p_nombre text, p_pagina text default null, p_visita text default null, p_datos jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if p_nombre not in (
    'pagina_vista', 'guia_inicio', 'guia_respuesta', 'guia_fin', 'resultados_mostrados',
    'comparador_busqueda', 'comparar_marcar', 'comparativa_abierta', 'ficha_vista', 'salida_tienda',
    'talla_calculada', 'foto_rota'
  ) then
    return;
  end if;
  if p_datos is null or jsonb_typeof(p_datos) <> 'object' or pg_column_size(p_datos) > 4000 then
    p_datos := '{}'::jsonb;
  end if;
  insert into eventos (nombre, pagina, visita, datos)
  values (p_nombre, left(p_pagina, 200), left(p_visita, 40), p_datos);
end;
$function$;

-- Consulta para ver las fotos rotas de los últimos 7 días, por marca (host) y bici:
-- select datos->>'host' as host, count(distinct datos->>'url') as fotos, count(distinct datos->>'bici') as bicis
-- from public.eventos where nombre = 'foto_rota' and creado > now() - interval '7 days'
-- group by 1 order by 2 desc;
