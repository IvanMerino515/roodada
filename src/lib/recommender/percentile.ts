// Percentil por rango medio: 0 = el valor más bajo de la cohorte, 1 = el más alto.

export function sortedValues(values: (number | null | undefined)[]): number[] {
  return values.filter((v): v is number => typeof v === "number" && Number.isFinite(v)).sort((a, b) => a - b);
}

export function percentile(sorted: number[], value: number | null | undefined): number | null {
  if (value === null || value === undefined || sorted.length === 0) return null;
  if (sorted.length === 1) return 0.5;
  let below = 0;
  let equal = 0;
  for (const v of sorted) {
    if (v < value) below++;
    else if (v === value) equal++;
  }
  // rango medio de los empates, escalado a 0–1
  const rank = below + Math.max(0, equal - 1) / 2;
  return Math.min(1, Math.max(0, rank / (sorted.length - 1)));
}
