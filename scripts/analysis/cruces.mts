// Cruces para diseñar el recomendador. Uso: npx tsx --env-file=.env.local scripts/analysis/cruces.mts
import { Client } from "pg";

const c = new Client({ connectionString: process.env.ANALYSIS_DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query("set session characteristics as transaction read only");

const show = async (title: string, sql: string) => {
  console.log(`\n### ${title}`);
  console.table((await c.query(sql)).rows);
};

await show("Precio (€) por categoría y eléctrica", `
  select category_slug as cat, is_electric as e, count(*) n,
    round(percentile_cont(0.1) within group (order by best_final_price_cents)/100) p10,
    round(percentile_cont(0.5) within group (order by best_final_price_cents)/100) p50,
    round(percentile_cont(0.9) within group (order by best_final_price_cents)/100) p90
  from variant_listing group by 1,2 order by 1,2`);

await show("Bicis por tramo de precio y categoría", `
  select case when p < 500 then '1 <500' when p < 1000 then '2 500-1000' when p < 1500 then '3 1000-1500'
              when p < 2500 then '4 1500-2500' when p < 4000 then '5 2500-4000' when p < 6000 then '6 4000-6000'
              else '7 6000+' end tramo,
    count(*) filter (where cat='bici-carretera') carretera, count(*) filter (where cat='bici-gravel') gravel,
    count(*) filter (where cat='bici-mtb') mtb, count(*) filter (where cat='bici-urbana') urbana,
    count(*) filter (where cat='bici-infantil') infantil, count(*) filter (where e) electricas
  from (select best_final_price_cents/100 p, category_slug cat, is_electric e from variant_listing) t
  group by 1 order by 1`);

await show("Disciplina × categoría", `
  select specs->>'discipline' disc, category_slug cat, count(*) n, count(*) filter (where is_electric) e
  from variant_listing group by 1,2 order by 2,3 desc`);

await show("Grupos (todos)", `
  select specs->>'groupset' g, category_slug cat, count(*) n,
    round(percentile_cont(0.5) within group (order by best_final_price_cents)/100) p50
  from variant_listing where not is_electric group by 1,2 order by 1,2`);

await show("Cobertura de tallas por altura (bicis no infantiles con alguna talla que cubre la altura)", `
  with h as (select generate_series(150, 200, 5) cm)
  select h.cm,
    count(distinct s.variant_id) filter (where s.rider_height_source='oficial') oficial,
    count(distinct s.variant_id) cubiertas
  from h join variant_sizes s on h.cm between s.rider_height_min_cm and s.rider_height_max_cm
  join variants v on v.id=s.variant_id join models m on m.id=v.model_id
  join categories cat on cat.id=m.category_id where cat.slug<>'bici-infantil'
  group by 1 order by 1`);

await show("Altura estimada vs oficial por marca", `
  select b.name, s.rider_height_source src, count(*) n, count(*) filter (where s.stack_mm is null) sin_stack
  from variant_sizes s join variants v on v.id=s.variant_id join models m on m.id=v.model_id
  join brands b on b.id=m.brand_id group by 1,2 order by 1,2`);

await show("Solapes/huecos: tallas de una misma bici cuyo rango se solapa con la siguiente", `
  select count(*) filter (where nxt_min <= rider_height_max_cm) solapa,
         count(*) filter (where nxt_min > rider_height_max_cm + 1) hueco, count(*) total
  from (select rider_height_max_cm, lead(rider_height_min_cm) over (partition by variant_id order by sort_order) nxt_min
        from variant_sizes) t where nxt_min is not null`);

await show("Peso por categoría (kg, solo con dato)", `
  select category_slug cat, is_electric e, count(weight_g) con_peso, count(*) n,
    round((percentile_cont(0.5) within group (order by weight_g)/1000.0)::numeric, 1) p50_kg
  from variant_listing group by 1,2 order by 1,2`);

await show("score_formulas", `select version, weights, description_es from score_formulas`);
await show("filter_definitions", `
  select f.key, f.label_es, f.source, f.path, f.data_type, f.unit, f.options, f.is_facet, c.slug cat
  from filter_definitions f left join categories c on c.id=f.category_id order by f.sort_order`);
await show("Roles de componentes", `select role, count(*) n from variant_components group by 1 order by 2 desc`);
await show("Tipos de media", `select kind, count(*) n, count(distinct variant_id) bicis from media group by 1`);
await show("Ejemplo de data_notes", `select data_notes from variants where data_notes is not null limit 8`);

await c.end();
