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

type Column = { name: string; type: string };

async function relations() {
  const { rows } = await client.query<{ name: string; kind: string }>(
    `select table_name as name, table_type as kind
       from information_schema.tables where table_schema = $1 order by table_name`,
    [SCHEMA],
  );
  return rows;
}

async function columns(rel: string): Promise<Column[]> {
  const { rows } = await client.query<{ name: string; type: string }>(
    `select column_name as name, data_type as type from information_schema.columns
      where table_schema = $1 and table_name = $2 order by ordinal_position`,
    [SCHEMA, rel],
  );
  return rows;
}

async function enumerate(from: string, expr: string) {
  const { rows } = await client.query<{ v: string; n: string }>(
    `select ${expr}::text as v, count(*) as n from ${from}
      where ${expr} is not null group by 1 order by 2 desc limit ${MAX_DISTINCT + 1}`,
  );
  return rows;
}

async function numericSummary(from: string, expr: string) {
  const { rows } = await client.query(
    `select min(x) as min, percentile_cont(0.25) within group (order by x) as p25,
            percentile_cont(0.5) within group (order by x) as p50,
            percentile_cont(0.75) within group (order by x) as p75, max(x) as max
       from (select (${expr})::numeric as x from ${from}) t where x is not null`,
  );
  const r = rows[0];
  return `min ${r.min} · p25 ${r.p25} · mediana ${r.p50} · p75 ${r.p75} · máx ${r.max}`;
}

async function describeValues(from: string, expr: string, isNumeric: boolean) {
  if (isNumeric) return numericSummary(from, expr);
  const vals = await enumerate(from, expr);
  if (vals.length > MAX_DISTINCT) return `texto libre (>${MAX_DISTINCT} valores distintos)`;
  return vals.map((v) => `${v.v} (${v.n})`).join(" · ");
}

async function analyseJson(from: string, col: string, total: number, prefix = "") {
  const path = prefix ? `${ident(col)} #> '{${prefix}}'` : ident(col);
  const { rows: keys } = await client.query<{ k: string; n: string; t: string }>(
    `select k, count(*) as n, mode() within group (order by jsonb_typeof(v)) as t
       from ${from}, jsonb_each(case when jsonb_typeof(${path}) = 'object' then ${path} end) as e(k, v)
      where jsonb_typeof(v) <> 'null' group by k order by k`,
  );
  for (const key of keys) {
    const full = prefix ? `${prefix},${key.k}` : key.k;
    const label = `${col}.${full.replace(/,/g, ".")}`;
    if (key.t === "object") {
      line(`- \`${label}\` — objeto, ${pct(+key.n, total)}`);
      await analyseJson(from, col, total, full);
      continue;
    }
    const expr = `(${ident(col)} #>> '{${full}}')`;
    const isNum = key.t === "number";
    const detail = key.t === "array" ? "lista" : await describeValues(from, expr, isNum);
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
    line(`## ${rel.name} (${rel.kind === "VIEW" ? "vista" : "tabla"}) · ${total} filas`);
    line();
    for (const col of await columns(rel.name)) {
      const c = ident(col.name);
      const filled = +(await client.query(`select count(${c}) as n from ${from}`)).rows[0].n;
      if (col.type === "jsonb") {
        line(`- **${col.name}** (jsonb) — ${pct(filled, total)}`);
        await analyseJson(from, col.name, total);
        continue;
      }
      const isNum = ["integer", "bigint", "numeric", "real", "double precision", "smallint"].includes(col.type);
      const isText = ["text", "character varying", "USER-DEFINED", "boolean"].includes(col.type);
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
