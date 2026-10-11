import { Client } from "pg";
const c = new Client({ connectionString: process.env.ANALYSIS_DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query("set session characteristics as transaction read only");
const q = async (s: string) => console.table((await c.query(s)).rows);
await q(`select n.nspname as schema, c.relname, c.relkind, c.reltuples::int as filas_aprox, c.relrowsecurity as rls
  from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where c.relkind in ('r','v','m') and n.nspname not in ('pg_catalog','information_schema') and n.nspname not like 'pg_%'
    and n.nspname not in ('auth','storage','realtime','supabase_functions','extensions','graphql','graphql_public','vault','pgsodium','supabase_migrations','net','cron','pgbouncer')
  order by 1, c.reltuples desc`);
await q(`select rolname, rolbypassrls from pg_roles where rolname in (current_user,'postgres')`);
await q(`select schemaname, tablename, policyname, roles::text, cmd from pg_policies where schemaname='public' order by 2 limit 40`);
await c.end();
