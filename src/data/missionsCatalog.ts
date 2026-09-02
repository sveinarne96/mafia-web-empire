import { EMPIRE_DISTRICTS, DISTRICT_CASH } from "./empire";

// ═══════════════════════════════════════════════════════════════
// MISSIONS CATALOG — 16 mission types × 10 districts = 160 missions
// Every mission type gets a live pin on the city map in every district.
// ═══════════════════════════════════════════════════════════════

export type MissionTypeId =
  | "crime" | "heist" | "melt" | "buybullets" | "gta" | "rarecar"
  | "repair" | "bank" | "casino" | "smuggle" | "assassin" | "empire"
  | "fraud" | "burglary" | "supply" | "racing";

export type MissionCurrency = "cash" | "points" | "bullets" | "coins" | "xp" | "scrap";

export interface MissionTypeDef {
  id: MissionTypeId;
  label: string;
  icon: string;
  color: string;       // hex accent for the map pin
  desc: string;
  /** Reward per task completion [task1, task2, task3] */
  rewards: [number, number, number];
  currency: MissionCurrency;
  difficulty: 1 | 2 | 3 | 4 | 5;
  energy: number;      // energy cost to START the mission
  cooldownMin: number; // minutes between starts of the same mission
  /** Action type the player must grind in-game to earn the mission */
  action: string;
  /** Friendly hint of what to do */
  where: string;
  /** Times the action must be performed */
  required: number;
}

export const MISSION_TYPES: MissionTypeDef[] = [
  { id: "crime",      label: "Commit Crimes",     icon: "🔪", color: "#ef4444", desc: "Run street-level crimes for quick cash",        rewards: [18_000, 30_000, 55_000],    currency: "cash",    difficulty: 1, energy: 10, cooldownMin: 3,  action: "crime",      where: "Crime hub → any street crime",        required: 3 },
  { id: "heist",      label: "Commit Heists",     icon: "🎯", color: "#a855f7", desc: "High-value scores planned with your crew",      rewards: [120_000, 250_000, 500_000], currency: "cash",    difficulty: 4, energy: 30, cooldownMin: 15, action: "heist",      where: "Heist → plan & execute a job",        required: 1 },
  { id: "melt",       label: "Melt Bullets",      icon: "🔥", color: "#f97316", desc: "Turn stolen cars into bullets in the scrapyard", rewards: [400, 800, 1_600],           currency: "xp",      difficulty: 1, energy: 5,  cooldownMin: 2,  action: "melt",       where: "My Items → melt cars",                required: 1 },
  { id: "buybullets", label: "Buy Bullets",       icon: "🔫", color: "#eab308", desc: "Restock ammo at the district dealer",           rewards: [300, 600, 1_200],           currency: "bullets", difficulty: 1, energy: 5,  cooldownMin: 2,  action: "buybullets", where: "GTA & Garage → Bullet Dealer (buy bullets)", required: 1 },
  { id: "gta",        label: "Steal Cars",        icon: "🚗", color: "#22d3ee", desc: "Boost vehicles straight off the street",        rewards: [45_000, 90_000, 180_000],   currency: "cash",    difficulty: 2, energy: 15, cooldownMin: 5,  action: "gta",        where: "GTA Car Theft → steal any car",       required: 2 },
  { id: "rarecar",    label: "Steal Rare Cars",   icon: "💎", color: "#38bdf8", desc: "Hunt legendary rides in private garages",       rewards: [200_000, 400_000, 900_000], currency: "cash",    difficulty: 4, energy: 25, cooldownMin: 10, action: "rarecar",    where: "GTA → steal a rare/epic/legendary car", required: 1 },
  { id: "repair",     label: "Repair Rare Cars",  icon: "🔧", color: "#34d399", desc: "Restore wrecks to showroom condition",          rewards: [30, 60, 120],               currency: "scrap",   difficulty: 2, energy: 12, cooldownMin: 8,  action: "repair",     where: "Garage → repair a damaged car",       required: 1 },
  { id: "bank",       label: "Bank Interest",     icon: "🏦", color: "#4ade80", desc: "Deposit and let the interest bank pay you",     rewards: [25_000, 50_000, 100_000],   currency: "cash",    difficulty: 1, energy: 4,  cooldownMin: 10, action: "interest",   where: "Bank → Interest Bank → Deposit",       required: 1 },
  { id: "casino",     label: "Casino Grind",      icon: "🎰", color: "#fbbf24", desc: "Work the tables — every round counts",          rewards: [2, 4, 8],                   currency: "coins",   difficulty: 2, energy: 10, cooldownMin: 5,  action: "casino",     where: "Casino Overview → play any casino game", required: 5 },
  { id: "smuggle",    label: "Run Contraband",    icon: "🚛", color: "#f472b6", desc: "Move illegal freight across the city",          rewards: [60_000, 120_000, 240_000],  currency: "cash",    difficulty: 3, energy: 18, cooldownMin: 8,  action: "smuggle",    where: "Prison → Smuggle Contraband",          required: 1 },
  { id: "assassin",   label: "Contract Kills",    icon: "💀", color: "#f43f5e", desc: "Take a contract and finish the hit",            rewards: [150, 300, 600],             currency: "points",  difficulty: 5, energy: 25, cooldownMin: 20, action: "assassin",   where: "Contract Killings → complete a hit",  required: 1 },
  { id: "empire",     label: "Empire Expansion",  icon: "👑", color: "#ffd700", desc: "Buy property and extend your influence",        rewards: [40_000, 80_000, 160_000],   currency: "cash",    difficulty: 3, energy: 15, cooldownMin: 10, action: "property",   where: "Company → buy any property",           required: 1 },
  { id: "fraud",      label: "Fraud Schemes",     icon: "🃏", color: "#fb923c", desc: "Run identity and counterfeit scams",            rewards: [35_000, 70_000, 140_000],   currency: "cash",    difficulty: 2, energy: 12, cooldownMin: 6,  action: "fraud",      where: "Underground → counterfeiting/ID theft", required: 1 },
  { id: "burglary",   label: "Burglarize Homes",  icon: "🏠", color: "#c084fc", desc: "Silent entries on wealthy houses",              rewards: [28_000, 56_000, 112_000],   currency: "cash",    difficulty: 2, energy: 12, cooldownMin: 6,  action: "burglary",   where: "Burglarize Houses → any break-in",    required: 2 },
  { id: "supply",     label: "Supply Runs",       icon: "📦", color: "#2dd4bf", desc: "Deliver supplies between district hubs",        rewards: [3, 6, 12],                  currency: "coins",   difficulty: 2, energy: 10, cooldownMin: 5,  action: "supply",     where: "Supply Running → sell supplies at a hub", required: 1 },
  { id: "racing",     label: "Street Racing",     icon: "🏎️", color: "#60a5fa", desc: "Win street races for cash and glory",           rewards: [22_000, 44_000, 88_000],    currency: "cash",    difficulty: 3, energy: 10, cooldownMin: 5,  action: "race",       where: "Street Racing → win a street race",   required: 1 },
];

export const MISSION_TYPE_MAP: Record<string, MissionTypeDef> = Object.fromEntries(
  MISSION_TYPES.map((t) => [t.id, t]),
);

// ═══════════ DISTRICTS — map geometry + per-district flavor ═══════════

export interface DistrictDef {
  name: string;
  x: number; // % position on map
  y: number;
  lockLevel: number;   // player level required
  hazard: number;      // 0-1 risk factor baked into success chance
  tagline: string;
  police: string;      // police presence label
}

export const DISTRICTS: DistrictDef[] = [
  { name: "Little Italy",       x: 26, y: 66, lockLevel: 1,  hazard: 0.04, tagline: "Old-family turf, tight-knit and watchful",  police: "Low" },
  { name: "Chinatown",          x: 50, y: 76, lockLevel: 4,  hazard: 0.05, tagline: "Dragon gates, hidden fortunes",             police: "Low" },
  { name: "Industrial Docks",   x: 12, y: 84, lockLevel: 7,  hazard: 0.08, tagline: "Rust, cranes and unmanifested cargo",       police: "Medium" },
  { name: "Downtown Core",      x: 44, y: 46, lockLevel: 10, hazard: 0.07, tagline: "Glass towers over crowded streets",         police: "High" },
  { name: "Harbor Point",       x: 74, y: 80, lockLevel: 13, hazard: 0.09, tagline: "Where the big ships never fully unload",    police: "Medium" },
  { name: "The Strip",          x: 78, y: 28, lockLevel: 16, hazard: 0.10, tagline: "Neon sins open 24/7 — casinos included",    police: "High" },
  { name: "Garment District",   x: 22, y: 32, lockLevel: 19, hazard: 0.08, tagline: "Counterfeit silk and sweatshops",           police: "Medium" },
  { name: "Old Town",           x: 62, y: 60, lockLevel: 22, hazard: 0.09, tagline: "Cobblestones, ghosts, old money vaults",    police: "Medium" },
  { name: "Financial Quarter",  x: 40, y: 18, lockLevel: 26, hazard: 0.12, tagline: "Money moves at the speed of light here",    police: "Extreme" },
  { name: "Nightlife Row",      x: 88, y: 52, lockLevel: 30, hazard: 0.11, tagline: "Clubs, VIPs and zero witnesses",            police: "High" },
];

export const DISTRICT_MAP: Record<string, DistrictDef> = Object.fromEntries(
  DISTRICTS.map((d) => [d.name, d]),
);

/** Deterministic mission name per (district, type, task) so board matches server. */
export function missionName(district: string, typeId: string, task: number): string {
  const t = MISSION_TYPE_MAP[typeId];
  const d = DISTRICT_MAP[district];
  const a = hashStr(district + typeId) % TARGET_NOUNS[typeId].length;
  const b = hashStr(district + typeId + task) % TARGET_PREFIX.length;
  return `${TARGET_PREFIX[b]} ${TARGET_NOUNS[typeId][a]}`;
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

const TARGET_PREFIX = ["Midnight", "Crimson", "Silent", "Golden", "Broken", "Shadow", "Iron", "Neon", "Velvet", "Razor", "Blackout", "Ghost"];
const TARGET_NOUNS: Record<string, string[]> = {
  crime:      ["Mugging Spree", "Loan Sharking", "Protection Racket", "Pickpocket Ring", "Chop Shop Sweep"],
  heist:      ["Vault Breach", "Diamond Lift", "Armored Truck Score", "Casino Cage Job", "Museum Job"],
  melt:       ["Ammo Forge Shift", "Scrap Meltdown", "Brass Recycle Run", "Lead Pour", "Foundry Night"],
  buybullets: ["Dealer Restock", "Ammo Cache Buy", "Crate Deal", "Guns & Ammo Run", "Bulk Order"],
  gta:        ["Parking Lot Boost", "Valet Jack", "Showroom Snatch", "Highway Grab", "Cab Flip"],
  rarecar:    ["Hypercar Heist", "Classic Garage Raid", "Auction Preview Jack", "Collector Con", "Yacht Club Sweep"],
  repair:     ["Wreck Restoration", "Barn Find Rebuild", "Chassis Refit", "Panel & Paint", "Engine Swap"],
  bank:       ["Compound Interest", "Dividend Skim", "Offshore Sweep", "Vault Dividend", "Silent Ledger"],
  casino:     ["Pit Boss Deal", "High-Roller Table", "Card Counting Shift", "Slot Room Skim", "Sportsbook Edge"],
  smuggle:    ["Night Freight", "Container Swap", "Speedboat Run", "Convoy Escort", "Tunnel Drop"],
  assassin:   ["Silent Contract", "Rooftop Job", "Drive-By Order", "Poison Detail", "Sniper Post"],
  empire:     ["Warehouse Buyout", "Launderette Takeover", "Nightclub Deal", "Liquor License Grab", "Block Buy-Up"],
  fraud:      ["Card Farm", "Wire Ghosting", "Shell Game", "Check Kit Run", "Insurance Swindle"],
  burglary:   ["Penthouse Entry", "Brownstone Sweep", "Safe Crack", "Window Job", "Vacation Home Hit"],
  supply:     ["Courier Drop", "Waypoint Run", "Cache Rotation", "Dead Drop Relay", "Hub Restock"],
  racing:     ["Pink Slip Race", "Canyon Run", "Drag Strip Duel", "Street Circuit", "Touge Challenge"],
};

/** One mission = (district, type). progress = which of its 3 tasks is next. */
export interface MissionInstance {
  key: string;             // `${districtIndex}:${typeId}`
  district: string;
  districtIdx: number;
  type: MissionTypeId;
  typeDef: MissionTypeDef;
  progress: number;        // 0..3
  done: boolean;
  lockLevel: number;
  locked: boolean;
  reward: number;          // reward for the NEXT task
  name: string;
}

/** Builds the flat mission list across all districts & types. */
export function buildMissions(progress: Record<string, number>, level: number): MissionInstance[] {
  const out: MissionInstance[] = [];
  DISTRICTS.forEach((d, di) => {
    for (const t of MISSION_TYPES) {
      const key = `${di}:${t.id}`;
      const p = Math.min(3, Math.max(0, Math.floor(progress[key] ?? 0)));
      out.push({
        key,
        district: d.name,
        districtIdx: di,
        type: t.id,
        typeDef: t,
        progress: p,
        done: p >= 3,
        lockLevel: d.lockLevel,
        locked: level < d.lockLevel && p < 3,
        reward: t.rewards[Math.min(2, p)],
        name: missionName(d.name, t.id, p),
      });
    }
  });
  return out;
}

/** Per-district conquest income uses the classic DISTRICT_CASH ladder. */
export function districtCash(idx: number): number {
  return DISTRICT_CASH[idx] ?? 15_000;
}

export { EMPIRE_DISTRICTS };
