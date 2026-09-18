// Progression ladders. Values are deliberately kept in one place so the HUD,
// rank panel and rewards can all describe the same economy.
export interface WealthRankDef { id: string; label: string; min: number; max?: number; color: string; icon: string; }

export const WEALTH_RANKS: WealthRankDef[] = [
  { id: "homeless", label: "Homeless", min: 0, max: 4_999, color: "#94a3b8", icon: "🪙" },
  { id: "poor", label: "Poor", min: 5_000, max: 24_999, color: "#a1a1aa", icon: "🥾" },
  { id: "unemployed", label: "Unemployed", min: 25_000, max: 99_999, color: "#cbd5e1", icon: "📭" },
  { id: "employed", label: "Employed", min: 100_000, max: 499_999, color: "#86efac", icon: "💼" },
  { id: "average", label: "Average", min: 500_000, max: 999_999, color: "#4ade80", icon: "🏠" },
  { id: "millionaire", label: "Millionaire", min: 1_000_000, max: 1_999_999, color: "#22d3ee", icon: "💵" },
  { id: "multimillionaire", label: "Multimillionaire", min: 2_000_000, max: 4_999_999, color: "#38bdf8", icon: "💰" },
  { id: "multi_millionaire", label: "Multi-millionaire", min: 5_000_000, max: 9_999_999, color: "#60a5fa", icon: "💎" },
  { id: "rich", label: "Rich", min: 10_000_000, max: 24_999_999, color: "#818cf8", icon: "🤑" },
  { id: "very_rich", label: "Very rich", min: 25_000_000, max: 99_999_999, color: "#a78bfa", icon: "👑" },
  { id: "extremely_rich", label: "Extremely rich", min: 100_000_000, max: 999_999_999, color: "#c084fc", icon: "🏛️" },
  { id: "billionaire", label: "Billionaire", min: 1_000_000_000, max: 1_999_999_999, color: "#e879f9", icon: "🏆" },
  { id: "multibillionaire", label: "Multibillionaire", min: 2_000_000_000, max: 4_999_999_999, color: "#f472b6", icon: "💠" },
  { id: "multi_billionaire", label: "Multi-billionaire", min: 5_000_000_000, max: 9_999_999_999, color: "#fb7185", icon: "🌟" },
  { id: "financial_executive", label: "Financial Executive", min: 10_000_000_000, max: 24_999_999_999, color: "#f97316", icon: "📈" },
  { id: "businessman", label: "Businessman", min: 25_000_000_000, max: 49_999_999_999, color: "#fb923c", icon: "🏢" },
  { id: "investor", label: "Investor", min: 50_000_000_000, max: 99_999_999_999, color: "#facc15", icon: "📊" },
  { id: "oil_sheik", label: "Oil Sheik", min: 100_000_000_000, max: 199_999_999_999, color: "#fde047", icon: "🛢️" },
  { id: "piggy_bank", label: "Piggy bank", min: 200_000_000_000, color: "#fbbf24", icon: "🐷" },
];

export function wealthRankFor(total: number): WealthRankDef {
  let current = WEALTH_RANKS[0];
  for (const rank of WEALTH_RANKS) if (total >= rank.min) current = rank;
  return current;
}
export function wealthRankIndex(total: number): number {
  let index = 0;
  WEALTH_RANKS.forEach((rank, i) => { if (total >= rank.min) index = i; });
  return index;
}

export interface GameRankDef { level: number; label: string; xp: number; icon: string; color: string; }
export const GAME_RANKS: GameRankDef[] = [
  { level: 1, label: "Novice", xp: 50_000, icon: "🧍", color: "#94a3b8" },
  { level: 2, label: "Troublemaker", xp: 130_000, icon: "🥷", color: "#a3e635" },
  { level: 3, label: "Runner", xp: 320_000, icon: "🏃", color: "#4ade80" },
  { level: 4, label: "Dealer", xp: 530_000, icon: "💼", color: "#22d3ee" },
  { level: 5, label: "Gangster", xp: 1_170_000, icon: "🚬", color: "#38bdf8" },
  { level: 6, label: "Hitman", xp: 5_000_000, icon: "🎯", color: "#818cf8" },
  { level: 7, label: "Junior Boss", xp: 9_000_000, icon: "🕶️", color: "#a78bfa" },
  { level: 8, label: "Boss", xp: 25_000_000, icon: "👔", color: "#c084fc" },
  { level: 9, label: "Captain", xp: 40_000_000, icon: "🎖️", color: "#e879f9" },
  { level: 10, label: "Godfather", xp: 80_000_000, icon: "⛪", color: "#f472b6" },
  { level: 11, label: "Legendary Godfather", xp: 150_000_000, icon: "👑", color: "#fb7185" },
  { level: 12, label: "Don", xp: 1_000_000_000, icon: "🎩", color: "#f97316" },
  { level: 13, label: "Legendary Don", xp: 35_000_000_000, icon: "💎", color: "#fb923c" },
  { level: 14, label: "Crime King", xp: 1_000_000_000_000, icon: "🏆", color: "#facc15" },
  { level: 15, label: "Legend", xp: 5_000_000_000_000, icon: "🌟", color: "#fde047" },
];
export function gameRankForLevel(level: number): GameRankDef {
  let rank = GAME_RANKS[0];
  for (const candidate of GAME_RANKS) if (level >= candidate.level) rank = candidate;
  return rank;
}
export function nextGameRank(level: number): GameRankDef | null {
  return GAME_RANKS.find((rank) => rank.level > level) ?? null;
}
