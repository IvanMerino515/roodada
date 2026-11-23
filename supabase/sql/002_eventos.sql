-- Roodada · registro anónimo de actividad (eventos de uso)
-- Ejecutar una vez en Supabase → SQL Editor. Se puede ejecutar de nuevo sin romper nada.
--
-- Igual que registrar_clic: la web usa la clave pública (anon), que no puede escribir en tablas.
-- La función registrar_evento solo admite los eventos de la lista, recorta los textos y rechaza
-- datos demasiado grandes. Sin usuario, sin IP y sin cookies: "visita" es un número aleatorio que
-- solo vive mientras la pestaña está abierta (no se guarda en el navegador).

create table if not exists public.eventos (
  id bigint generated always as identity primary key,
  creado timestamptz not null default now(),
  nombre text not null,
  pagina text,
  visita text,
  datos jsonb not null default '{}'::jsonb
);

create index if not exists eventos_creado_idx on public.eventos (creado);
create index if not exists eventos_nombre_creado_idx on public.eventos (nombre, creado);
create index if not exists eventos_visita_idx on public.eventos (visita);

-- RLS activo y sin políticas: nadie lee ni escribe con la clave pública salvo a través de la función
alter table public.eventos enable row level security;

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
    'comparador_busqueda', 'comparar_marcar', 'comparativa_abierta', 'ficha_vista', 'salida_tienda'
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

-- ───────── Vistas para el panel (Looker Studio u otro) ─────────

-- Eventos por día y tipo, con visitas distintas
create or replace view public.v_eventos_dia as
select date_trunc('day', creado)::date as dia, nombre, count(*) as eventos, count(distinct visita) as visitas
from eventos
group by 1, 2;

-- Embudo de la guía por día: cuántas visitas empiezan, terminan, ven resultados y salen a una tienda
create or replace view public.v_embudo_guia as
with v as (
  select visita, min(creado)::date as dia,
    bool_or(nombre = 'guia_inicio') as inicio,
    bool_or(nombre = 'guia_fin') as fin,
    bool_or(nombre = 'resultados_mostrados') as resultados,
    bool_or(nombre = 'salida_tienda') as salida
  from eventos
  where visita is not null
  group by visita
)
select dia,
  count(*) filter (where inicio) as empiezan_guia,
  count(*) filter (where fin) as terminan_guia,
  count(*) filter (where resultados) as ven_resultados,
  count(*) filter (where resultados and salida) as salen_a_tienda
from v
group by dia;

-- Bicis: fichas vistas, veces recomendada y salidas a tienda, con su nombre y marca
create or replace view public.v_bicis_actividad as
with f as (
  select (datos->>'bici')::bigint as bici, count(*) as fichas_vistas
  from eventos where nombre = 'ficha_vista' and datos ? 'bici' group by 1
), r as (
  select (b.value)::bigint as bici, count(*) as recomendada
  from eventos e, jsonb_array_elements_text(e.datos->'bicis') b(value)
  where e.nombre = 'resultados_mostrados' group by 1
), s as (
  -- La salida se apunta con el slug (es lo que lleva el enlace /ir/<slug>)
  select datos->>'slug' as slug, count(*) as salidas
  from eventos where nombre = 'salida_tienda' and datos ? 'slug' group by 1
)
select l.variant_id as bici, l.brand_name as marca, l.variant_name as nombre, l.category_slug as categoria,
  coalesce(f.fichas_vistas, 0) as fichas_vistas, coalesce(r.recomendada, 0) as recomendada, coalesce(s.salidas, 0) as salidas
from variant_listing l
left join f on f.bici = l.variant_id
left join r on r.bici = l.variant_id
left join s on s.slug = l.slug
where f.bici is not null or r.bici is not null or s.slug is not null;

-- Lectura para el panel con el rol de solo lectura del análisis (ya existe y no puede escribir)
grant select on public.eventos, public.v_eventos_dia, public.v_embudo_guia, public.v_bicis_actividad to roodada_lectura;
-- Las vistas no se exponen a la clave pública
revoke all on public.v_eventos_dia, public.v_embudo_guia, public.v_bicis_actividad from anon, authenticated;
