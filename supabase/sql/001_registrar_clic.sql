-- Roodada · registrar las salidas a tienda (fase 0)
-- Ejecutar una vez en Supabase → SQL Editor. Se puede ejecutar de nuevo sin romper nada.
--
-- La web usa la clave pública (anon), que no puede escribir en outbound_clicks (RLS sin política de
-- escritura). En lugar de abrir la tabla, esta función hace solo una cosa: apuntar un clic en una
-- oferta activa, con el precio de ese momento. Sin sesión ni usuario: el registro es anónimo.

create or replace function public.registrar_clic(p_offer_id bigint, p_source_page text default null)
returns void
language sql
security definer
set search_path = public
as $$
  insert into outbound_clicks (offer_id, source_page, final_price_cents_at_click)
  select o.id, left(p_source_page, 200), o.final_price_cents
  from offers o
  where o.id = p_offer_id and o.is_active;
$$;

revoke all on function public.registrar_clic(bigint, text) from public;
grant execute on function public.registrar_clic(bigint, text) to anon, authenticated;
