// Informe bruto de la base de Supabase para diseñar el recomendador.
// Uso: npm run analysis  → docs/data/ANALISIS-bruto.md
// Solo lectura: la sesión se abre en modo READ ONLY además de usar un rol con SELECT.
import { writeFileSync } from "node:fs";
import { Client } from "pg";

const url = process.env.ANALYSIS_DATABASE_URL;
if (!url) {
  console.error("Falta ANALYSIS_DATABASE_URL en .env.local");
  process.exit(1);
}

const SCHEMA = process.env.ANALYSIS_SCHEMA ?? "public";
const MAX_DISTINCT = 40; // por debajo, se listan los valores como enumerado

const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
const out: string[] = [];
const line = (s = "") => out.push(s);
const ident = (s: string) => `"${s.replace(/"/g, '""')}"`;
const pct = (n: number, total: number) => (total ? `${Math.round((n / total) * 100)} %` : "—");

// cat = typcategory de Postgres: N número, S texto, B booleano, E enum, A lista
type Column = { name: string; type: string; cat: string };

async function relations() {
  const { rows } = await client.query<{ name: string; kind: string }>(
    // pg_class en vez de information_schema para incluir las vistas materializadas (variant_listing)
    `select c.relname as name, case c.relkind when 'r' then 'tabla' when 'v' then 'vista'
              else 'vista materializada' end as kind
       from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = $1 and c.relkind in ('r', 'v', 'm') order by c.relname`,
    [SCHEMA],
  );
  return rows;
}

async function columns(rel: string): Promise<Column[]> {
  const { rows } = await client.query<Column>(
    `select a.attname as name, format_type(a.atttypid, a.atttypmod) as type, t.typcategory as cat
       from pg_attribute a
       join pg_class c on c.oid = a.attrelid join pg_namespace n on n.oid = c.relnamespace
       join pg_type t on t.oid = a.atttypid
      where n.nspname = $1 and c.relname = $2 and a.attnum > 0 and not a.attisdropped
      order by a.attnum`,
    [SCHEMA, rel],
  );
  return rows;
}

// expr puede usar $1 (ruta JSON como text[]); params la acompaña
async function enumerate(from: string, expr: string, params: unknown[] = []) {
  const { rows } = await client.query<{ v: string; n: string }>(
    `select ${expr}::text as v, count(*) as n from ${from}
      where ${expr} is not null group by 1 order by 2 desc limit ${MAX_DISTINCT + 1}`,
    params,
  );
  return rows;
}

async function numericSummary(from: string, expr: string, params: unknown[] = []) {
  const { rows } = await client.query(
    `select min(x) as min, percentile_cont(0.25) within group (order by x) as p25,
            percentile_cont(0.5) within group (order by x) as p50,
            percentile_cont(0.75) within group (order by x) as p75, max(x) as max
       from (select (${expr})::numeric as x from ${from}) t where x is not null`,
    params,
  );
  const r = rows[0];
  return `min ${r.min} · p25 ${r.p25} · mediana ${r.p50} · p75 ${r.p75} · máx ${r.max}`;
}

async function describeValues(from: string, expr: string, isNumeric: boolean, params: unknown[] = []) {
  if (isNumeric) return numericSummary(from, expr, params);
  const vals = await enumerate(from, expr, params);
  if (vals.length > MAX_DISTINCT) return `texto libre (>${MAX_DISTINCT} valores distintos)`;
  return vals.map((v) => `${v.v} (${v.n})`).join(" · ");
}

// Las rutas van como parámetro text[]: hay claves con espacios, comas o comillas.
async function analyseJson(from: string, col: string, total: number, prefix: string[] = []) {
  const c = ident(col);
  const { rows: keys } = await client.query<{ k: string; n: string; t: string }>(
    `select k, count(*) as n, mode() within group (order by jsonb_typeof(v)) as t
       from ${from}, jsonb_each(case when jsonb_typeof(${c} #> $1::text[]) = 'object'
                                     then ${c} #> $1::text[] end) as e(k, v)
      where jsonb_typeof(v) <> 'null' group by k order by k`,
    [prefix],
  );
  for (const key of keys) {
    const path = [...prefix, key.k];
    const label = `${col}.${path.join(".")}`;
    if (key.t === "object" && path.length < 3) {
      line(`- \`${label}\` — objeto, ${pct(+key.n, total)}`);
      await analyseJson(from, col, total, path);
      continue;
    }
    const isNum = key.t === "number";
    const detail = ["array", "object"].includes(key.t)
      ? key.t
      : await describeValues(from, `(${c} #>> $1::text[])`, isNum, [path]);
    line(`- \`${label}\` — ${pct(+key.n, total)} — ${detail}`);
  }
}

async function main() {
  await client.connect();
  await client.query("set session characteristics as transaction read only");
  await client.query("set statement_timeout = '60s'");

  line(`# Análisis bruto de la base · ${new Date().toISOString().slice(0, 10)}`);
  line();
  line(`Esquema \`${SCHEMA}\`. Generado por \`scripts/analysis/run.ts\`; no editar a mano.`);

  for (const rel of await relations()) {
    const from = `${ident(SCHEMA)}.${ident(rel.name)}`;
    const total = +(await client.query(`select count(*) as n from ${from}`)).rows[0].n;
    line();
    line(`## ${rel.name} (${rel.kind}) · ${total} filas`);
    line();
    for (const col of await columns(rel.name)) {
      const c = ident(col.name);
      const filled = +(await client.query(`select count(${c}) as n from ${from}`)).rows[0].n;
      if (col.type === "jsonb") {
        line(`- **${col.name}** (jsonb) — ${pct(filled, total)}`);
        if (!col.name.endsWith("_raw")) await analyseJson(from, col.name, total);
        continue;
      }
      const isNum = col.cat === "N";
      const isText = ["S", "B", "E"].includes(col.cat);
      const detail = isNum || isText ? ` — ${await describeValues(from, c, isNum)}` : "";
      line(`- **${col.name}** (${col.type}) — ${pct(filled, total)}${detail}`);
    }
  }

  writeFileSync("docs/data/ANALISIS-bruto.md", out.join("\n") + "\n");
  console.log("Escrito docs/data/ANALISIS-bruto.md");
  await client.end();
}

main().catch(async (err) => {
  console.error(err);
  await client.end().catch(() => {});
  process.exit(1);
});
