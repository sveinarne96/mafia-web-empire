// ===== GAME OBJECTIVES OVERVIEW =====
// Per-category action-count objectives. Every top-bar crime increments its
// category counter; reaching a milestone lets the player claim the reward.

export interface ObjectiveMilestone {
  count: number;
  reward: number;
}

export interface CategoryObjectiveDef {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  tagline: string;
  milestones: ObjectiveMilestone[];
}

export const CATEGORY_OBJECTIVES: CategoryObjectiveDef[] = [
  {
    categoryId: "street", name: "Street Operations", icon: "🔪", color: "#34d399",
    tagline: "Fast moves, small targets, clean exits.",
    milestones: [
      { count: 50, reward: 125_000 },
      { count: 100, reward: 500_000 },
      { count: 250, reward: 2_500_000 },
      { count: 300, reward: 5_000_000 },
    ],
  },
  {
    categoryId: "robbery", name: "Robbery Desk", icon: "💰", color: "#f87171",
    tagline: "Plan the score before you touch the door.",
    milestones: [
      { count: 50, reward: 250_000 },
      { count: 100, reward: 1_000_000 },
      { count: 250, reward: 5_000_000 },
      { count: 300, reward: 10_000_000 },
    ],
  },
  {
    categoryId: "fraud", name: "Fraud Bureau", icon: "🃏", color: "#facc15",
    tagline: "Information is leverage. Leverage is money.",
    milestones: [
      { count: 50, reward: 200_000 },
      { count: 100, reward: 800_000 },
      { count: 250, reward: 4_000_000 },
      { count: 300, reward: 8_000_000 },
    ],
  },
  {
    categoryId: "burglary", name: "Burglary Board", icon: "🏠", color: "#fb923c",
    tagline: "Every property has a weakness.",
    milestones: [
      { count: 50, reward: 300_000 },
      { count: 100, reward: 1_200_000 },
      { count: 250, reward: 6_000_000 },
      { count: 300, reward: 12_000_000 },
    ],
  },
  {
    categoryId: "drugs", name: "Distribution Network", icon: "💊", color: "#c084fc",
    tagline: "Routes, contacts, and controlled risk.",
    milestones: [
      { count: 50, reward: 300_000 },
      { count: 100, reward: 1_200_000 },
      { count: 250, reward: 6_000_000 },
      { count: 300, reward: 12_000_000 },
    ],
  },
  {
    categoryId: "organized", name: "Organized Crime", icon: "🕵️", color: "#60a5fa",
    tagline: "Bigger crews. Bigger exposure. Bigger returns.",
    milestones: [
      { count: 50, reward: 500_000 },
      { count: 100, reward: 2_000_000 },
      { count: 250, reward: 10_000_000 },
      { count: 300, reward: 20_000_000 },
    ],
  },
  {
    categoryId: "underground", name: "Underground Desk", icon: "🕳️", color: "#94a3b8",
    tagline: "The jobs nobody puts on a ledger.",
    milestones: [
      { count: 50, reward: 600_000 },
      { count: 100, reward: 2_400_000 },
      { count: 250, reward: 12_000_000 },
      { count: 300, reward: 24_000_000 },
    ],
  },
  {
    categoryId: "gta_theft", name: "GTA Car Theft", icon: "🚗", color: "#ef4444",
    tagline: "Steal anything with wheels. The bigger the engine, the bigger the score.",
    milestones: [
      { count: 50, reward: 750_000 },
      { count: 100, reward: 3_000_000 },
      { count: 250, reward: 15_000_000 },
      { count: 300, reward: 30_000_000 },
    ],
  },
  {
    categoryId: "steal_house", name: "House Infiltration", icon: "🏠", color: "#f43f5e",
    tagline: "Every home has a weakness. Find it, exploit it, vanish.",
    milestones: [
      { count: 50, reward: 600_000 },
      { count: 100, reward: 2_400_000 },
      { count: 250, reward: 12_000_000 },
      { count: 300, reward: 24_000_000 },
    ],
  },
  {
    categoryId: "murder", name: "Contract Killings", icon: "💀", color: "#dc2626",
    tagline: "No witnesses. No evidence. No mercy.",
    milestones: [
      { count: 50, reward: 500_000 },
      { count: 100, reward: 2_000_000 },
      { count: 250, reward: 10_000_000 },
      { count: 300, reward: 20_000_000 },
    ],
  },
];

// ===== MILESTONE OBJECTIVES (lifetime, surprise ladder) =====
export interface MilestoneObjectiveDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
  target: number;
  kind: "actions" | "earnings";
  reward: number;
  points: number;
  coins: number;
}

export const MILESTONE_OBJECTIVES: MilestoneObjectiveDef[] = [
  { id: "first_job", name: "First Blood", icon: "🩸", desc: "Complete your first criminal action", target: 1, kind: "actions", reward: 5_000, points: 10, coins: 0 },
  { id: "rookie", name: "Rookie of the City", icon: "🥷", desc: "Complete 25 criminal actions", target: 25, kind: "actions", reward: 50_000, points: 50, coins: 0 },
  { id: "making_moves", name: "Making Moves", icon: "📈", desc: "Complete 100 criminal actions", target: 100, kind: "actions", reward: 300_000, points: 200, coins: 0 },
  { id: "rising_star", name: "Rising Star", icon: "🌟", desc: "Complete 250 criminal actions", target: 250, kind: "actions", reward: 1_000_000, points: 500, coins: 1 },
  { id: "professional", name: "Certified Professional", icon: "🎯", desc: "Complete 500 criminal actions", target: 500, kind: "actions", reward: 3_000_000, points: 1_200, coins: 2 },
  { id: "elite", name: "City Elite", icon: "🏙️", desc: "Complete 1,000 criminal actions", target: 1000, kind: "actions", reward: 10_000_000, points: 3_000, coins: 5 },
  { id: "money_machine", name: "Money Machine", icon: "🤑", desc: "Earn $25,000,000 in total", target: 25_000_000, kind: "earnings", reward: 5_000_000, points: 1_500, coins: 3 },
  { id: "shadow_legend", name: "Shadow Legend", icon: "👑", desc: "Complete 5,000 criminal actions", target: 5000, kind: "actions", reward: 50_000_000, points: 10_000, coins: 10 },
];

// ===== SEASON XP (under Special Point Store) =====
export interface SeasonTierDef {
  tier: number;
  xp: number;
  reward: string;
  type: string; // bullets | autoRank | commonPack | points | doubleXp | goldBar | heistTimer | heistChance | epicPack
  amount: number;
}

export const FREE_TRACK: SeasonTierDef[] = [
  { tier: 1, xp: 34_500, reward: "2,500 Bullets", type: "bullets", amount: 2500 },
  { tier: 2, xp: 277_000, reward: "5 Auto Rank Perks", type: "autoRank", amount: 5 },
  { tier: 3, xp: 1_385_000, reward: "2 Common Packs", type: "commonPack", amount: 2 },
  { tier: 4, xp: 6_230_000, reward: "125 Points", type: "points", amount: 125 },
  { tier: 5, xp: 13_150_000, reward: "5 Double XP Perks", type: "doubleXp", amount: 5 },
  { tier: 6, xp: 20_000_000, reward: "5,000 Bullets", type: "bullets", amount: 5000 },
  { tier: 7, xp: 27_000_000, reward: "5 Gold Bars", type: "goldBar", amount: 5 },
  { tier: 8, xp: 33_900_000, reward: "5 Heist Timer Perks", type: "heistTimer", amount: 5 },
  { tier: 9, xp: 40_850_000, reward: "5 Heist Chance Perks", type: "heistChance", amount: 5 },
  { tier: 10, xp: 45_000_000, reward: "2 Epic Packs", type: "epicPack", amount: 2 },
  // ═══ UNLIMITED EXTENSION (tiers 11+) — keeps everything scaling forever ═══
  { tier: 11, xp: 50_000_000, reward: "10,000 Bullets", type: "bullets", amount: 10000 },
  { tier: 12, xp: 58_000_000, reward: "250 Points", type: "points", amount: 250 },
  { tier: 13, xp: 67_000_000, reward: "1 Legendary Pack", type: "legendaryPack", amount: 1 },
  { tier: 14, xp: 78_000_000, reward: "10 Auto Rank Perks", type: "autoRank", amount: 10 },
  { tier: 15, xp: 90_000_000, reward: "25,000 Bullets", type: "bullets", amount: 25000 },
  { tier: 16, xp: 105_000_000, reward: "1,000,000 Cash", type: "cash", amount: 1000000 },
  { tier: 17, xp: 122_000_000, reward: "500 Points", type: "points", amount: 500 },
  { tier: 18, xp: 142_000_000, reward: "5 Double XP + 5 Double Pay", type: "doubleXp", amount: 5 },
  { tier: 19, xp: 165_000_000, reward: "2 Legendary Packs", type: "legendaryPack", amount: 2 },
  { tier: 20, xp: 190_000_000, reward: "50,000 Bullets", type: "bullets", amount: 50000 },
  { tier: 21, xp: 220_000_000, reward: "1,000 Points", type: "points", amount: 1000 },
  { tier: 22, xp: 255_000_000, reward: "1 Hired Limo (garage)", type: "car", amount: 0 },
  { tier: 23, xp: 295_000_000, reward: "10 Gold Bars", type: "goldBar", amount: 10 },
  { tier: 24, xp: 340_000_000, reward: "100,000 Bullets", type: "bullets", amount: 100000 },
  { tier: 25, xp: 390_000_000, reward: "3 Legendary Packs", type: "legendaryPack", amount: 3 },
  { tier: 26, xp: 450_000_000, reward: "2,500 Points", type: "points", amount: 2500 },
  { tier: 27, xp: 520_000_000, reward: "5,000,000 Cash", type: "cash", amount: 5000000 },
  { tier: 28, xp: 600_000_000, reward: "250,000 Bullets", type: "bullets", amount: 250000 },
  { tier: 29, xp: 700_000_000, reward: "5,000 Points", type: "points", amount: 5000 },
  { tier: 30, xp: 820_000_000, reward: "5 Legendary Packs + 1,000 Coins", type: "coins", amount: 1000 },
];

export const UNLIMITED_SEASON = true;

// VIP track: 100 levels, XP per level scales gently (level 1 = 2,800).
export const VIP_LEVELS = 100;
export const VIP_XP_PER_LEVEL = (level: number) => Math.round(2_800 * (1 + (level - 1) * 0.18));

// Reward cycle for VIP levels (loops every 10 levels with escalating amounts).
export function vipRewardForLevel(level: number): { label: string; type: string; amount: number; cash: number } {
  const cycle = [
    { label: "Cash", type: "cash", amount: 0, cash: 5_000_000 },
    { label: "Bullets", type: "bullets", amount: 15_000, cash: 0 },
    { label: "Bust Boost", type: "bustBoost", amount: 2, cash: 0 },
    { label: "Auto Rank Perks", type: "autoRank", amount: 2, cash: 0 },
    { label: "Common Scraps", type: "commonScrap", amount: 3, cash: 0 },
    { label: "Common Packs", type: "commonPack", amount: 2, cash: 0 },
    { label: "Cash", type: "cash", amount: 0, cash: 20_000_000 },
    { label: "Double Pay Perks", type: "doublePay", amount: 2, cash: 0 },
    { label: "Bullets", type: "bullets", amount: 50_000, cash: 0 },
    { label: "Epic Packs", type: "epicPack", amount: 1, cash: 0 },
  ];
  const base = cycle[(level - 1) % 10];
  const multiplier = 1 + Math.floor((level - 1) / 10) * 0.5;
  return {
    label: base.label,
    type: base.type,
    amount: Math.round(base.amount * multiplier),
    cash: Math.round(base.cash * multiplier),
  };
}

// ===== POINT STORE =====
export interface PointStoreItem {
  id: string;
  name: string;
  cost: number;
  icon: string;
  desc: string;
  group: "bodyguard" | "upgrade" | "perks" | "bullets" | "silencer" | "vip";
  defenseBonus?: number;
  perkId?: string;
  perkAmount?: number;
  upgradeId?: string;
}

export const ROBOT_BODYGUARDS: PointStoreItem[] = [
  { id: "bg1", name: "Robot Bodyguard 1", cost: 125, icon: "🤖", desc: "+50 DEF · first unit on your security detail", group: "bodyguard", defenseBonus: 50 },
  { id: "bg2", name: "Robot Bodyguard 2", cost: 250, icon: "🤖", desc: "+125 DEF · reinforced combat chassis", group: "bodyguard", defenseBonus: 125 },
  { id: "bg3", name: "Robot Bodyguard 3", cost: 375, icon: "🤖", desc: "+250 DEF · heavy weapons platform", group: "bodyguard", defenseBonus: 250 },
  { id: "bg4", name: "Robot Bodyguard 4", cost: 525, icon: "🤖", desc: "+500 DEF · prototype war droid", group: "bodyguard", defenseBonus: 500 },
];

export const ACCOUNT_UPGRADES: PointStoreItem[] = [
  { id: "userRaid", name: "User-Raid Account Upgrade", cost: 2000, icon: "⚔️", desc: "Unlock player raids against other users", group: "upgrade", upgradeId: "userRaid" },
  { id: "meltLimit", name: "Melt Limit Upgrade", cost: 2500, icon: "♻️", desc: "+3 extra scrapyard melt slots", group: "upgrade", upgradeId: "meltLimit" },
  { id: "reduceStockTimer", name: "Reduce Stock Timer", cost: 250, icon: "⏱️", desc: "Black market stock refreshes 25% faster", group: "upgrade", upgradeId: "reduceStockTimer" },
  { id: "increaseStockLimit", name: "Increase Stock Limit", cost: 250, icon: "📦", desc: "+10 to black market stock capacity", group: "upgrade", upgradeId: "increaseStockLimit" },
  { id: "interestBankLimit", name: "Increase Interest Bank Limit", cost: 250, icon: "🏦", desc: "Interest applies to a higher bank balance", group: "upgrade", upgradeId: "interestBankLimit" },
  { id: "sportsBettingLimit", name: "Increase Sports Betting Limit", cost: 500, icon: "🎲", desc: "Higher max stake on sports betting", group: "upgrade", upgradeId: "sportsBettingLimit" },
  { id: "bodyguardAutoSearch", name: "Bodyguard Auto-Search", cost: 1500, icon: "🔍", desc: "Bodyguards auto-refresh your defense each day", group: "upgrade", upgradeId: "bodyguardAutoSearch" },
  { id: "carWreckLimit", name: "Car Wreck Limit Upgrade", cost: 500, icon: "🚗", desc: "Scrapyard accepts more wrecked cars per melt", group: "upgrade", upgradeId: "carWreckLimit" },
];

export const PERK_BUNDLES: PointStoreItem[] = [
  { id: "random5", name: "5 Random Perks", cost: 110, icon: "🎁", desc: "5 random perk drops", group: "perks" },
  { id: "random25", name: "25 Random Perks", cost: 500, icon: "🎁", desc: "25 random perk drops", group: "perks" },
  { id: "jailImmunity", name: "10x Jail Immunity Perks", cost: 300, icon: "🛡️", desc: "Ignore 1 prison sentence each", group: "perks", perkId: "jailImmunity", perkAmount: 10 },
  { id: "bustBoost", name: "10x Bust Boost Perks", cost: 300, icon: "💥", desc: "10x better bust avoidance", group: "perks", perkId: "bustBoost", perkAmount: 10 },
  { id: "heistChance", name: "10x Heist Chance Perks", cost: 300, icon: "🎰", desc: "10x heist success chance boosts", group: "perks", perkId: "heistChance", perkAmount: 10 },
  { id: "heistTimer", name: "10x Heist Timer Perks", cost: 300, icon: "⏳", desc: "10x faster heist cooldowns", group: "perks", perkId: "heistTimer", perkAmount: 10 },
  { id: "doubleXp", name: "10x Double XP Perks", cost: 300, icon: "✨", desc: "10x double XP boosts", group: "perks", perkId: "doubleXp", perkAmount: 10 },
  { id: "doublePay", name: "10x Double Pay Perks", cost: 300, icon: "💰", desc: "10x double pay boosts", group: "perks", perkId: "doublePay", perkAmount: 10 },
  { id: "autoRank", name: "10x Auto Rank Perks", cost: 450, icon: "⭐", desc: "10x instant rank-ups", group: "perks", perkId: "autoRank", perkAmount: 10 },
];

export const POINT_STORE_EXTRA: PointStoreItem[] = [
  { id: "bullets10k", name: "10,000 Bullets", cost: 200, icon: "💀", desc: "Stock up for combat", group: "bullets" },
  { id: "silencer", name: "Weapon Silencer", cost: 200, icon: "🔇", desc: "Reduces wanted gain on kills", group: "silencer" },
  { id: "vip", name: "VIP Membership (30 days)", cost: 2500, icon: "👑", desc: "Unlocks the VIP Season track", group: "vip" },
];

// ===== PACKS =====
export interface PackConfigDef {
  key: string;
  name: string;
  icon: string;
  coinCost: number; // coins per pack (0 = not coin-purchasable)
  rewards: number;
  guarantee: { rarity: string; qty: number }[];
  drops: { common: number; rare: number; epic: number; legendary: number };
  scrapYield: [number, number]; // min-max scraps of the same rarity per open
}

export const PACK_CONFIG: Record<string, PackConfigDef> = {
  common: {
    key: "common", name: "Common Pack", icon: "📦", coinCost: 0, rewards: 2,
    guarantee: [{ rarity: "common", qty: 1 }],
    drops: { common: 80, rare: 15, epic: 4, legendary: 1 },
    scrapYield: [1, 3],
  },
  rare: {
    key: "rare", name: "Rare Pack", icon: "🎁", coinCost: 0, rewards: 3,
    guarantee: [{ rarity: "rare", qty: 1 }],
    drops: { common: 70, rare: 20, epic: 8, legendary: 2 },
    scrapYield: [1, 3],
  },
  epic: {
    key: "epic", name: "Epic Pack", icon: "✨", coinCost: 1, rewards: 4,
    guarantee: [{ rarity: "epic", qty: 1 }, { rarity: "rare", qty: 1 }],
    drops: { common: 60, rare: 20, epic: 15, legendary: 5 },
    scrapYield: [2, 4],
  },
  legendary: {
    key: "legendary", name: "Legendary Pack", icon: "💎", coinCost: 2, rewards: 6,
    guarantee: [{ rarity: "legendary", qty: 1 }, { rarity: "epic", qty: 2 }],
    drops: { common: 50, rare: 20, epic: 20, legendary: 10 },
    scrapYield: [2, 4],
  },
};

export const PACK_RARITY_ORDER = ["legendary", "epic", "rare", "common"];

export const SCRAP_TO_PACK = 10; // 10 scraps of a rarity -> 1 pack of the same rarity

// ===== PERKS =====
export interface PerkDef {
  id: string;
  label: string;
  icon: string;
  desc: string;
  duration: string;
}

export const PERK_DEFS: PerkDef[] = [
  { id: "heistTimer", label: "Heist Timer", icon: "⏳", desc: "Faster heist cooldowns for 1 hour", duration: "1h" },
  { id: "heistChance", label: "Heist Chance", icon: "🎰", desc: "Higher heist success for 1 hour", duration: "1h" },
  { id: "doublePay", label: "Double Pay", icon: "💰", desc: "3x cash from crimes for 1 hour", duration: "1h" },
  { id: "doubleXp", label: "Double XP", icon: "✨", desc: "3x XP from crimes for 1 hour", duration: "1h" },
  { id: "jailImmunity", label: "Jail Immune", icon: "🛡️", desc: "Skip one prison sentence", duration: "1 use" },
  { id: "bustBoost", label: "Bust Boost", icon: "💥", desc: "Better bust avoidance for 1 hour", duration: "1h" },
  { id: "autoRank", label: "Auto Rank", icon: "⭐", desc: "Instantly gain +1 rank", duration: "1 use" },
  { id: "meltValue", label: "Melt Value", icon: "♻️", desc: "+50% scrapyard melt value for 24h", duration: "24h" },
  { id: "meltLimit", label: "Melt Limit", icon: "🔩", desc: "+2 melt slots for 24h", duration: "24h" },
  { id: "gtaRarity", label: "GTA Rarity", icon: "🚗", desc: "Better GTA car drops for 1 hour", duration: "1h" },
  { id: "supplyUnit", label: "Supply Unit", icon: "📦", desc: "Instantly gain 100 bullets + 25 energy", duration: "instant" },
];

// ===== ASSASSINATION TARGETS =====
export interface AssassinTargetDef {
  name: string;
  rank: string;
  bounty: number;
  difficulty: number; // success base chance 0-1
}

export const ASSASSIN_TARGETS: AssassinTargetDef[] = [
  { name: "Slippery Sal", rank: "Street Rat", bounty: 150_000, difficulty: 0.8 },
  { name: "Two-Face Tony", rank: "Hustler", bounty: 300_000, difficulty: 0.75 },
  { name: "Vinnie the Vulture", rank: "Enforcer", bounty: 600_000, difficulty: 0.7 },
  { name: "Madame Rouge", rank: "Madame", bounty: 1_200_000, difficulty: 0.65 },
  { name: "Silent Sam", rank: "Silencer", bounty: 2_500_000, difficulty: 0.6 },
  { name: "Boss Bones", rank: "Underboss", bounty: 5_000_000, difficulty: 0.55 },
  { name: "Crown Vic", rank: "Kingpin", bounty: 10_000_000, difficulty: 0.5 },
  { name: "The Ghost", rank: "Phantom", bounty: 20_000_000, difficulty: 0.45 },
  { name: "Emperor Kane", rank: "Crime Emperor", bounty: 40_000_000, difficulty: 0.4 },
  { name: "Shadow Lord", rank: "Shadow Emperor", bounty: 80_000_000, difficulty: 0.35 },
];

// ===== COIN STORE =====
export interface CoinStoreItem {
  id: string;
  name: string;
  cost: number;
  icon: string;
  desc: string;
  kind: "pack" | "perk" | "upgrade" | "bullets" | "car" | "scratch";
  packType?: "common" | "epic" | "legendary";
  perkId?: string;
  perkAmount?: number;
  upgradeId?: string;
  bullets?: number;
  carRarity?: string;
}

export const COIN_STORE_ITEMS: CoinStoreItem[] = [
  { id: "legendaryPack", name: "Legendary Pack", cost: 2, icon: "✨", desc: "Guaranteed legendary item", kind: "pack", packType: "legendary" },
  { id: "epicPack", name: "Epic Pack", cost: 1, icon: "🌟", desc: "Epic or better item", kind: "pack", packType: "epic" },
  { id: "randomPerks100", name: "100x Random Perks Pack", cost: 2, icon: "🎁", desc: "100 random perk drops", kind: "perk" },
  { id: "scratchCard", name: "Scratch Card", cost: 1, icon: "🎟️", desc: "Scratch for a random prize!", kind: "scratch" },
  { id: "userRaidCoin", name: "User-Raid Perk", cost: 1, icon: "⚔️", desc: "Unlock user raids permanently", kind: "upgrade", upgradeId: "userRaid" },
  { id: "targetAssassin", name: "Target Assassin Limit", cost: 1, icon: "🎯", desc: "+2 simultaneous contract targets", kind: "perk", perkId: "targetAssassin", perkAmount: 2 },
  { id: "meltLimitCoin", name: "Melt Limit", cost: 1, icon: "♻️", desc: "+3 scrapyard melt slots", kind: "upgrade", upgradeId: "meltLimit" },
  { id: "missionSkip", name: "Mission Skip", cost: 1, icon: "⏭️", desc: "Skip any active mission instantly", kind: "perk", perkId: "missionSkip", perkAmount: 1 },
  { id: "dailyRewardTimer", name: "Daily Reward Timer", cost: 2, icon: "📅", desc: "Reduce daily reward cooldown by 6h", kind: "perk", perkId: "dailyRewardTimer", perkAmount: 1 },
  { id: "crewOCXp", name: "Permanent Crew OC XP Booster", cost: 2, icon: "🕵️", desc: "+25% organized crime XP forever", kind: "upgrade", upgradeId: "crewOCXp" },
  { id: "ocTimer6h", name: "6 Hour OC Timer", cost: 1, icon: "⏳", desc: "Cut organized crime timer to 6h", kind: "upgrade", upgradeId: "ocTimer6h" },
  { id: "realEstateUpgrade", name: "Real Estate Purchase Upgrade", cost: 2, icon: "🏘️", desc: "Buy an extra property slot", kind: "upgrade", upgradeId: "realEstateUpgrade" },
  { id: "sportsBettingCoin", name: "Sports Betting Limit", cost: 2, icon: "🎲", desc: "Raise max sports bet", kind: "upgrade", upgradeId: "sportsBettingLimit" },
  { id: "swissBankLimit", name: "Swiss Bank Limit", cost: 1, icon: "🏔️", desc: "Higher Swiss bank cap", kind: "upgrade", upgradeId: "swissBankLimit" },
  { id: "missionRetrieval", name: "Mission Retrieval", cost: 1, icon: "📥", desc: "Retrieve a failed mission reward", kind: "perk", perkId: "missionRetrieval", perkAmount: 1 },
  { id: "supplyRunLimit", name: "+250 Supply Return Run Limit", cost: 2, icon: "📦", desc: "Bigger supply runs allowed", kind: "upgrade", upgradeId: "supplyRunLimit" },
  { id: "exoticCar", name: "Exotic Car", cost: 5, icon: "🏎️", desc: "A one-off exotic from the vault", kind: "car", carRarity: "exotic" },
  { id: "customCar20", name: "20 Second Custom Car", cost: 1, icon: "🚗", desc: "Vintage custom build, delivered to garage", kind: "car", carRarity: "20s" },
  { id: "bullets250k", name: "250,000 Bullets", cost: 2, icon: "💀", desc: "Massive ammo drop", kind: "bullets", bullets: 250000 },
];

// ===== SCRATCH CARD PRIZES =====
export const SCRATCH_PRIZES: { label: string; icon: string; type: string; amount: number }[] = [
  { label: "Nothing", icon: "💨", type: "none", amount: 0 },
  { label: "$50,000", icon: "💵", type: "money", amount: 50_000 },
  { label: "$250,000", icon: "💰", type: "money", amount: 250_000 },
  { label: "25 Points", icon: "🏆", type: "points", amount: 25 },
  { label: "100 Points", icon: "🏆", type: "points", amount: 100 },
  { label: "1,000 Bullets", icon: "💀", type: "bullets", amount: 1000 },
  { label: "10,000 Bullets", icon: "💀", type: "bullets", amount: 10_000 },
  { label: "1 Coin", icon: "🪙", type: "coins", amount: 1 },
  { label: "Common Pack", icon: "🎁", type: "commonPack", amount: 1 },
  { label: "Jackpot $5,000,000", icon: "👑", type: "money", amount: 5_000_000 },
];

// ===== PACK CONTENTS =====
export const PACK_ITEMS: Record<string, { name: string; rarity: string; attack: number; defense: number; price: number }[]> = {
  common: [
    { name: "Brass Knuckles", rarity: "common", attack: 3, defense: 0, price: 1_000 },
    { name: "Switchblade", rarity: "common", attack: 4, defense: 0, price: 1_500 },
    { name: "Sap Gloves", rarity: "common", attack: 2, defense: 2, price: 1_200 },
    { name: "Bulletproof Vest (I)", rarity: "common", attack: 0, defense: 5, price: 2_500 },
    { name: "Stolen Phone", rarity: "common", attack: 1, defense: 1, price: 800 },
    { name: "Lockpick Set", rarity: "common", attack: 0, defense: 2, price: 1_000 },
  ],
  rare: [
    { name: "Sawn-Off Shotgun", rarity: "rare", attack: 12, defense: 0, price: 9_000 },
    { name: "Kevlar Vest", rarity: "rare", attack: 0, defense: 15, price: 12_000 },
    { name: "Hunting Knife", rarity: "rare", attack: 10, defense: 3, price: 8_000 },
    { name: "Night-Vision Goggles", rarity: "rare", attack: 3, defense: 8, price: 11_000 },
    { name: "Master Lockpick Set", rarity: "rare", attack: 0, defense: 6, price: 7_500 },
    { name: "Stolen Police Radio", rarity: "rare", attack: 5, defense: 5, price: 9_500 },
  ],
  epic: [
    { name: "Tactical Shotgun", rarity: "epic", attack: 18, defense: 2, price: 25_000 },
    { name: "Riot Shield", rarity: "epic", attack: 4, defense: 22, price: 30_000 },
    { name: "Body Armor (II)", rarity: "epic", attack: 0, defense: 30, price: 40_000 },
    { name: "Silenced Pistol", rarity: "epic", attack: 15, defense: 0, price: 22_000 },
    { name: "Surveillance Kit", rarity: "epic", attack: 6, defense: 8, price: 18_000 },
    { name: "Combat Knife", rarity: "epic", attack: 14, defense: 4, price: 16_000 },
  ],
  legendary: [
    { name: "Golden Desert Eagle", rarity: "legendary", attack: 40, defense: 5, price: 150_000 },
    { name: "Kevlar Exo-Suit", rarity: "legendary", attack: 10, defense: 60, price: 200_000 },
    { name: "Plasma Cutter", rarity: "legendary", attack: 35, defense: 10, price: 140_000 },
    { name: "Empire Signet Ring", rarity: "legendary", attack: 20, defense: 25, price: 120_000 },
    { name: "Boss's Body Armor", rarity: "legendary", attack: 15, defense: 75, price: 250_000 },
    { name: "Phantom Silencer", rarity: "legendary", attack: 25, defense: 15, price: 130_000 },
  ],
};
