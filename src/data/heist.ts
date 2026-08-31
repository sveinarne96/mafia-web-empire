export interface HeistJobDef { id: string; name: string; min: number; max: number; icon: string; }
export interface HeistCrewDef { id: string; name: string; chance: number; cost: number; icon: string; }
export interface HeistEquipDef { id: string; name: string; cooldown: number; cost: number; icon: string; }

export const HEIST_JOBS: HeistJobDef[] = [
  { id: "pawn_shop", name: "Pawn Shop", min: 4_224_900, max: 6_491_200, icon: "🔨" },
  { id: "jewellers", name: "Jewellers", min: 4_771_800, max: 7_730_500, icon: "💍" },
  { id: "ig_fed_bank", name: "IG Federal Bank", min: 5_480_300, max: 9_851_600, icon: "🏦" },
  { id: "ny_casino", name: "New York Casino", min: 6_431_300, max: 8_701_500, icon: "🎰" },
  { id: "ig_fed_reserve", name: "IG Federal Reserve", min: 8_761_800, max: 10_824_700, icon: "🏛️" },
];

export const HEIST_CREWS: HeistCrewDef[] = [
  { id: "street_thugs", name: "Street Thugs", chance: 0.30, cost: 100_000, icon: "🥊" },
  { id: "professional", name: "Professional Thieves", chance: 0.40, cost: 200_000, icon: "🕵️" },
  { id: "ex_special", name: "Ex Special Forces", chance: 0.45, cost: 400_000, icon: "🪖" },
  { id: "mexicana", name: "Mexicana Cartel", chance: 0.50, cost: 800_000, icon: "🔫" },
  { id: "ny_mafia", name: "New York Mafia", chance: 0.60, cost: 1_600_000, icon: "🎩" },
];

export const HEIST_EQUIPMENT: HeistEquipDef[] = [
  { id: "basic", name: "Basic Tools", cooldown: 240, cost: 100_000, icon: "🧰" },
  { id: "advanced", name: "Advanced Tools", cooldown: 180, cost: 200_000, icon: "⚙️" },
  { id: "military", name: "Military Grade Tools", cooldown: 120, cost: 400_000, icon: "🚁" },
];