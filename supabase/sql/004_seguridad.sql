-- Roodada · endurecimiento de seguridad (auditoría del 25-11-2026, puntos B1 y B2)
-- Ejecutar una vez en Supabase → SQL Editor. Se puede ejecutar de nuevo sin romper nada.
-- No cambia nada de lo que ve o hace la web: solo quita permisos que la clave pública no usa.

-- 1. Las funciones de disparador (trigger) no tienen por qué poder llamarse con la clave pública.
--    Hoy fallarían igualmente si alguien las llamara, pero así no dependemos de eso. Los disparadores
--    siguen funcionando igual: PostgreSQL no comprueba este permiso al ejecutarlos.
do $$
declare
  f record;
begin
  for f in
    select p.oid::regprocedure as firma
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prorettype = 'trigger'::regtype
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.firma);
  end loop;
end $$;

-- 2. Las vistas del panel se ejecutan con los permisos de quien las consulta (security_invoker), así
--    respetan la RLS de eventos aunque algún día se concedan por error a la clave pública.
--    roodada_lectura las sigue leyendo igual (tiene lectura sobre eventos y variant_listing).
alter view public.v_eventos_dia set (security_invoker = true);
alter view public.v_embudo_guia set (security_invoker = true);
alter view public.v_bicis_actividad set (security_invoker = true);
alter view public.v_visitas_origen set (security_invoker = true);

-- 3. Las vistas y funciones que se creen a partir de ahora tampoco se abren solas a la clave pública
--    (Supabase concede por defecto ejecutar funciones nuevas a anon). Quien cree una función que la
--    web necesite tendrá que dar el permiso a mano, como en 001 y 002.
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

-- Comprobación: debe devolver solo registrar_clic, registrar_evento y las funciones de consulta
-- (get_safety_*, lowest_final_price_before, search_variants, spec_schema_for)
select p.proname
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and has_function_privilege('anon', p.oid, 'execute')
order by 1;
