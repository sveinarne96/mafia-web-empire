export interface HeistJobDef {
  id: string;
  name: string;
  min: number;
  max: number;
  icon: string;
  /** Jobs have a character: loud scores favor muscle, quiet ones favor stealth. */
  style: "loud" | "stealth" | "either";
}

export interface HeistCrewDef {
  id: string;
  name: string;
  chance: number;
  cost: number;
  icon: string;
  /** What this crew is good at — synergy bonus when it matches the job style. */
  style: "loud" | "stealth" | "either";
  blurb: string;
}

export interface HeistEquipDef {
  id: string;
  name: string;
  cooldown: number;
  cost: number;
  icon: string;
  /** Equipment leans the job loud or quiet; mismatched gear costs odds. */
  style: "loud" | "stealth" | "either";
  blurb: string;
}

export const HEIST_JOBS: HeistJobDef[] = [
  { id: "pawn_shop", name: "Pawn Shop", min: 4_224_900, max: 6_491_200, icon: "🔨", style: "either" },
  { id: "jewellers", name: "Jewellers", min: 4_771_800, max: 7_730_500, icon: "💍", style: "stealth" },
  { id: "ig_fed_bank", name: "IG Federal Bank", min: 5_480_300, max: 9_851_600, icon: "🏦", style: "loud" },
  { id: "ny_casino", name: "New York Casino", min: 6_431_300, max: 8_701_500, icon: "🎰", style: "either" },
  { id: "ig_fed_reserve", name: "IG Federal Reserve", min: 8_761_800, max: 10_824_700, icon: "🏛️", style: "loud" },
];

export const HEIST_CREWS: HeistCrewDef[] = [
  { id: "street_thugs", name: "Street Thugs", chance: 0.3, cost: 100_000, icon: "🥊", style: "loud", blurb: "Cheap, chaotic, and loud. Great for smash-and-grab scores." },
  { id: "professional", name: "Professional Thieves", chance: 0.4, cost: 200_000, icon: "🕵️", style: "stealth", blurb: "Quiet hands, clean work. Made for ghost runs." },
  { id: "ex_special", name: "Ex Special Forces", chance: 0.45, cost: 400_000, icon: "🪖", style: "either", blurb: "Disciplined in any environment. No style penalty, ever." },
  { id: "mexicana", name: "Mexicana Cartel", chance: 0.5, cost: 800_000, icon: "🔫", style: "loud", blurb: "Firepower first. Turns loud jobs into walkovers." },
  { id: "ny_mafia", name: "New York Mafia", chance: 0.6, cost: 1_600_000, icon: "🎩", style: "either", blurb: "The best money can buy. Expensive, near-flawless either way." },
];

export const HEIST_EQUIPMENT: HeistEquipDef[] = [
  { id: "basic", name: "Basic Tools", cooldown: 240, cost: 100_000, icon: "🧰", style: "either", blurb: "Crowbars and bolt cutters. Works anywhere, shines nowhere." },
  { id: "advanced", name: "Advanced Tools", cooldown: 180, cost: 200_000, icon: "⚙️", style: "stealth", blurb: "Bypass kits and glass cutters. Quiet jobs go smoother." },
  { id: "military", name: "Military Grade Tools", cooldown: 120, cost: 400_000, icon: "🚁", style: "loud", blurb: "Thermal lances and breaching charges. Loud jobs go faster." },
];

/** Odds model shared by the client preview and the server roll. */
export const HEIST_SYNERGY_BONUS = 0.05; // crew style matches job style
export const HEIST_MISMATCH_PENALTY = 0.04; // crew style opposes job style
export const HEIST_GEAR_SYNERGY = 0.03; // equipment style matches job style
export const HEIST_GEAR_MISMATCH = 0.025; // equipment style opposes job style

/** "either"-style crew/equipment never synergizes but never mismatches. */
export function heistStyleDelta(
  jobStyle: "loud" | "stealth" | "either",
  itemStyle: "loud" | "stealth" | "either",
  synergy: number,
  mismatch: number,
): number {
  if (jobStyle === "either" || itemStyle === "either") return 0;
  if (jobStyle === itemStyle) return synergy;
  return -mismatch;
}

export function computeHeistChance(
  job: HeistJobDef,
  crew: HeistCrewDef,
  equip: HeistEquipDef,
  playerLevel: number,
  chanceBoostActive = false,
): number {
  let chance =
    crew.chance +
    playerLevel * 0.004 +
    heistStyleDelta(job.style, crew.style, HEIST_SYNERGY_BONUS, HEIST_MISMATCH_PENALTY) +
    heistStyleDelta(job.style, equip.style, HEIST_GEAR_SYNERGY, HEIST_GEAR_MISMATCH);
  if (chanceBoostActive) chance += 0.1;
  return Math.max(0.05, Math.min(0.85, chance));
}
