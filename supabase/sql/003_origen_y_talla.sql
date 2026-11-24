-- Roodada · origen de las visitas (UTM) y uso de la calculadora de talla
-- Ejecutar una vez en Supabase → SQL Editor, después de 002_eventos.sql. Se puede ejecutar de nuevo.

-- 1. La función acepta el evento nuevo «talla_calculada» (el resto, igual que en 002)
create or replace function public.registrar_evento(
  p_nombre text,
  p_pagina text default null,
  p_visita text default null,
  p_datos jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_nombre not in (
    'pagina_vista', 'guia_inicio', 'guia_respuesta', 'guia_fin', 'resultados_mostrados',
    'comparador_busqueda', 'comparar_marcar', 'comparativa_abierta', 'ficha_vista', 'salida_tienda',
    'talla_calculada'
  ) then
    return;
  end if;
  if p_datos is null or jsonb_typeof(p_datos) <> 'object' or pg_column_size(p_datos) > 4000 then
    p_datos := '{}'::jsonb;
  end if;
  insert into eventos (nombre, pagina, visita, datos)
  values (p_nombre, left(p_pagina, 200), left(p_visita, 40), p_datos);
end;
$$;

revoke all on function public.registrar_evento(text, text, text, jsonb) from public;
grant execute on function public.registrar_evento(text, text, text, jsonb) to anon, authenticated;

-- 2. Visitas por origen y lo que hacen después.
-- Origen: el utm_source si lo hay; si no, el dominio desde el que se llegó, agrupado (instagram,
-- facebook, google…); sin ninguno de los dos, «directo».
create or replace view public.v_visitas_origen as
with primera as (
  select distinct on (visita) visita, creado, datos
  from eventos
  where nombre = 'pagina_vista' and visita is not null
  order by visita, creado
), acciones as (
  select visita,
    bool_or(nombre = 'talla_calculada') as talla,
    bool_or(nombre = 'guia_fin') as guia,
    bool_or(nombre = 'salida_tienda') as tienda
  from eventos
  where visita is not null
  group by visita
), v as (
  select p.creado::date as dia,
    case
      when p.datos ? 'utm_source' then p.datos->>'utm_source'
      when p.datos->>'origen' ilike '%instagram%' then 'instagram'
      when p.datos->>'origen' ilike any (array['%facebook%', '%fb.com%', '%fb.me%']) then 'facebook'
      when p.datos->>'origen' ilike '%google%' then 'google'
      when p.datos->>'origen' ilike '%bing%' then 'bing'
      when p.datos->>'origen' ilike '%chatgpt%' or p.datos->>'origen' ilike '%openai%' then 'chatgpt'
      when p.datos->>'origen' ilike '%perplexity%' then 'perplexity'
      when p.datos ? 'origen' then p.datos->>'origen'
      else 'directo'
    end as fuente,
    coalesce(p.datos->>'utm_medium', '') as medio,
    coalesce(p.datos->>'utm_campaign', '') as campana,
    coalesce(a.talla, false) as talla,
    coalesce(a.guia, false) as guia,
    coalesce(a.tienda, false) as tienda
  from primera p
  left join acciones a using (visita)
)
select dia, fuente, medio, campana,
  count(*) as visitas,
  count(*) filter (where talla) as calculan_talla,
  count(*) filter (where guia) as terminan_guia,
  count(*) filter (where tienda) as salen_a_tienda
from v
group by dia, fuente, medio, campana;

grant select on public.v_visitas_origen to roodada_lectura;
revoke all on public.v_visitas_origen from anon, authenticated;
