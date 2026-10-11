import { Client } from "pg";
const c = new Client({ connectionString: process.env.ANALYSIS_DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query("set session characteristics as transaction read only");
console.log(JSON.stringify((await c.query("select weights from score_formulas")).rows[0].weights, null, 1));
const r = await c.query(`select count(*) filter (where nxt - mx between 2 and 5) h2_5, count(*) filter (where nxt - mx > 5) h5,
  count(*) filter (where mx - nxt >= 5) solape5 from (select rider_height_max_cm mx,
  lead(rider_height_min_cm) over (partition by variant_id order by sort_order) nxt from variant_sizes) t where nxt is not null`);
console.log(r.rows[0]);
await c.end();
