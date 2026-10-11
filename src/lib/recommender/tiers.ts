// Gama del grupo de transmisión, 1 (básica) a 5 (tope). Tabla derivada de los 50 valores de
// specs.groupset y de su precio mediano (docs/data/ANALISIS.md §4). Sin línea concreta → null.

const TIERS: Record<string, number> = {
  // Shimano carretera / gravel
  "Shimano Claris": 1, "Shimano Sora": 1, "Shimano Tiagra": 2, "Shimano 105": 3,
  "Shimano GRX": 3, "Shimano Ultegra": 4, "Shimano Dura-Ace": 5,
  // Shimano MTB / urbana
  "Shimano Tourney": 1, "Shimano Altus": 1, "Shimano Acera": 1, "Shimano Nexus": 1,
  "Shimano CUES": 2, "Shimano Alivio": 2, "Shimano Alfine": 3,
  "Shimano Deore": 3, "Shimano SLX": 3, "Shimano XT": 4, "Shimano XTR": 5,
  // SRAM
  "SRAM SX": 1, "SRAM NX": 2, "SRAM Eagle": 2, "SRAM Apex": 3, "SRAM Eagle 70": 3,
  "SRAM Rival": 4, "SRAM Force": 4, "SRAM GX": 4, "SRAM Eagle 90": 4,
  "SRAM Red": 5, "SRAM X0": 5, "SRAM XX": 5, "SRAM XX SL": 5,
  // Campagnolo
  "Campagnolo Ekar": 3, "Campagnolo Record": 5, "Campagnolo Super Record": 5,
  // microSHIFT y bujes internos
  "microSHIFT": 1, "microSHIFT Sword": 1, "microSHIFT Advent": 2,
  // Bujes internos de calidad: sin mantenimiento, propios de urbanas de gama media-alta
  "Enviolo": 3,
};

export const TIER_LABELS = ["", "básica", "de entrada", "media", "alta", "tope de gama"] as const;

export function groupsetTier(groupset: string | null): number | null {
  if (!groupset) return null;
  return TIERS[groupset.trim()] ?? null;
}
