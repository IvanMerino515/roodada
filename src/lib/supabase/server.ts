import "server-only";
import { createClient } from "@supabase/supabase-js";

// Solo lectura con la publishable key: las políticas RLS de Supabase dan lectura pública al catálogo.
export function supabase() {
  // Sin el prefijo NEXT_PUBLIC_, Next nunca mete estos valores en el código que va al navegador:
  // la base solo se consulta desde el servidor. Los nombres antiguos se aceptan mientras se cambian en Vercel.
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Faltan SUPABASE_URL o SUPABASE_ANON_KEY");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// PostgREST devuelve como mucho 1.000 filas por petición: se pide por páginas. La primera dice cuántas
// filas hay y el resto se piden a la vez, de PARALLEL en PARALLEL (en fila, las 19 páginas de tallas
// tardaban 6,5 s; a la vez, 0,4 s). El tope evita lanzar cientos de peticiones durante la compilación,
// donde varios procesos cargan el catálogo al mismo tiempo.
const PARALLEL = 3;

export async function selectAll<T>(
  table: string,
  columns: string,
  orderBy: string,
  options: { pageSize?: number; notNull?: string } = {},
): Promise<T[]> {
  const { pageSize = 1000, notNull } = options;
  const db = supabase();
  const query = (from: number, count: boolean) => {
    let q = db.from(table).select(columns, count ? { count: "exact" } : undefined);
    if (notNull) q = q.not(notNull, "is", null);
    return q.order(orderBy).range(from, from + pageSize - 1);
  };
  // Con la base cargada (compilación, cargas de Edgar, presupuesto de disco de Supabase agotado) a veces
  // Supabase corta una consulta por tiempo: se reintenta 4 veces con pausas crecientes (1,5 s, 3 s, 6 s,
  // 12 s) antes de dar el error, que pararía la compilación (26-11-2026, primera compilación en el VPS)
  const page = async (from: number, count = false) => {
    let r = await query(from, count);
    for (let attempt = 1; attempt <= 4 && r.error; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 1500 * 2 ** (attempt - 1)));
      r = await query(from, count);
    }
    return r;
  };

  const first = await page(0, true);
  if (first.error) throw new Error(`${table}: ${first.error.message}`);
  const rows = [...((first.data ?? []) as T[])];
  const total = first.count ?? rows.length;
  const starts: number[] = [];
  for (let from = pageSize; from < total; from += pageSize) starts.push(from);

  for (let i = 0; i < starts.length; i += PARALLEL) {
    const batch = await Promise.all(starts.slice(i, i + PARALLEL).map((from) => page(from)));
    for (const r of batch) {
      if (r.error) throw new Error(`${table}: ${r.error.message}`);
      rows.push(...((r.data ?? []) as T[]));
    }
  }
  return rows;
}
