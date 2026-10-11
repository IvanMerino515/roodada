// Grupos sin gama asignada en src/lib/recommender/tiers.ts
import { Client } from "pg";
import { groupsetTier } from "../../src/lib/recommender/tiers";
const c = new Client({ connectionString: process.env.ANALYSIS_DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query("set session characteristics as transaction read only");
const { rows } = await c.query(`select specs->>'groupset' g, count(*)::int n from variants group by 1 order by 2 desc`);
const missing = rows.filter((r) => groupsetTier(r.g) === null);
console.log("sin gama:", missing, "\nbicis con gama:", rows.filter((r) => groupsetTier(r.g) !== null).reduce((a, r) => a + r.n, 0));
await c.end();
