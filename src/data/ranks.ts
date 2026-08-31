// ===== WEALTH RANKS (cash + bank) =====
export interface WealthRankDef {
  id: string;
  label: string;
  min: number;
  color: string;
  icon: string;
}

export const WEALTH_RANKS: WealthRankDef[] = [
  { id: "trillionaire", label: "Trillionaire", min: 1_000_000_000_000, color: "#fbbf24", icon: "💎" },
  { id: "i_billionaire", label: "I.Billionaire", min: 100_000_000_000, color: "#fde047", icon: "💠" },
  { id: "m_billionaire", label: "M.Billionaire", min: 10_000_000_000, color: "#facc15", icon: "👑" },
  { id: "billionaire", label: "Billionaire", min: 1_000_000_000, color: "#f59e0b", icon: "🏆" },
  { id: "u_rich", label: "U.Rich", min: 100_000_000, color: "#34d399", icon: "🤑" },
  { id: "v_rich", label: "V.Rich", min: 10_000_000, color: "#22d3ee", icon: "💰" },
  { id: "rich", label: "Rich", min: 1_000_000, color: "#60a5fa", icon: "💵" },
  { id: "broke", label: "Broke", min: 0, color: "#94a3b8", icon: "🪙" },
];

export function wealthRankFor(total: number): WealthRankDef {
  for (const r of WEALTH_RANKS) if (total >= r.min) return r;
  return WEALTH_RANKS[WEALTH_RANKS.length - 1];
}

export function wealthRankIndex(total: number): number {
  return WEALTH_RANKS.findIndex((r) => total >= r.min);
}

// ===== GAME RANKS (level ladder) =====
export interface GameRankDef {
  level: number;
  label: string;
  icon: string;
  color: string;
}

export const GAME_RANKS: GameRankDef[] = [
  { level: 1, label: "Hobo", icon: "🧍", color: "#9ca3af" },
  { level: 5, label: "Noob", icon: "🐣", color: "#9ca3af" },
  { level: 10, label: "Shadow", icon: "🌫️", color: "#a78bfa" },
  { level: 15, label: "Civilian Shadow", icon: "🏙️", color: "#c4b5fd" },
  { level: 20, label: "Soldier Shadow", icon: "🪖", color: "#818cf8" },
  { level: 25, label: "Criminal Shadow", icon: "🔫", color: "#c084fc" },
  { level: 30, label: "Associate Shadow", icon: "💼", color: "#e879f9" },
  { level: 40, label: "Made Man Shadow", icon: "🍸", color: "#f472b6" },
  { level: 50, label: "Capo Shadow", icon: "🎩", color: "#fb7185" },
  { level: 60, label: "Underboss Shadow", icon: "🕶️", color: "#f43f5e" },
  { level: 70, label: "Boss Shadow", icon: "👔", color: "#ef4444" },
  { level: 80, label: "Godfather Shadow", icon: "⛪", color: "#facc15" },
  { level: 90, label: "Don Shadow", icon: "🎖️", color: "#fbbf24" },
  { level: 100, label: "International Shadow", icon: "🌍", color: "#f59e0b" },
  { level: 125, label: "Gangster", icon: "🚬", color: "#fb923c" },
  { level: 150, label: "International Shadow Empire", icon: "👑", color: "#fde047" },
];

export function gameRankForLevel(level: number): GameRankDef {
  let rank = GAME_RANKS[0];
  for (const r of GAME_RANKS) if (level >= r.level) rank = r;
  return rank;
}

export function nextGameRank(level: number): GameRankDef | null {
  for (const r of GAME_RANKS) if (r.level > level) return r;
  return null;
}