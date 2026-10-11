import "server-only";
import { createClient } from "@supabase/supabase-js";

// Solo lectura con la publishable key: las políticas RLS de Supabase dan lectura pública al catálogo.
export function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// PostgREST devuelve como mucho 1.000 filas por petición: se pide por páginas.
export async function selectAll<T>(
  table: string,
  columns: string,
  orderBy: string,
  pageSize = 1000,
): Promise<T[]> {
  const db = supabase();
  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await db
      .from(table)
      .select(columns)
      .order(orderBy)
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...(data as T[]));
    if (!data || data.length < pageSize) return rows;
  }
}
