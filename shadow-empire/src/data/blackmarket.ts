export interface BlackMarketItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  price: number;
  effect: string;
  duration?: number; // in hours, if temporary
  stackable: boolean;
  maxStack: number;
}

export const blackMarketItems: BlackMarketItem[] = [
  // Common
  {
    id: "lockpick_set",
    name: "Lockpick Set",
    description: "A set of professional lockpicks. Increases crime success rate.",
    icon: "🔐",
    rarity: "common",
    price: 500,
    effect: "+5% crime success rate",
    duration: 24,
    stackable: true,
    maxStack: 5,
  },
  {
    id: "fake_id",
    name: "Fake Identity",
    description: "A convincing fake ID. Reduces wanted level by 1.",
    icon: "🪪",
    rarity: "common",
    price: 1000,
    effect: "-1 Wanted Level",
    stackable: true,
    maxStack: 3,
  },
  {
    id: "stun_grenade",
    name: "Stun Grenade",
    description: "Disorients enemies. +20% dodge chance in combat.",
    icon: "💥",
    rarity: "common",
    price: 800,
    effect: "+20% dodge chance",
    stackable: true,
    maxStack: 10,
  },
  // Uncommon
  {
    id: "armor_vest",
    name: "Kevlar Vest",
    description: "Lightweight body armor. Reduces incoming damage.",
    icon: "🦺",
    rarity: "uncommon",
    price: 2500,
    effect: "+15 Defense for 24h",
    duration: 24,
    stackable: false,
    maxStack: 1,
  },
  {
    id: "gps_jammer",
    name: "GPS Jammer",
    description: "Blocks tracking devices. Prevents location reveal.",
    icon: "📡",
    rarity: "uncommon",
    price: 3000,
    effect: "Immune to tracking for 12h",
    duration: 12,
    stackable: true,
    maxStack: 3,
  },
  {
    id: "combat_stim",
    name: "Combat Stimulant",
    description: "Enhances reflexes. +25% attack for 6 hours.",
    icon: "💉",
    rarity: "uncommon",
    price: 2000,
    effect: "+25% Attack for 6h",
    duration: 6,
    stackable: true,
    maxStack: 5,
  },
  {
    id: "smoke_bomb",
    name: "Smoke Bomb",
    description: "Creates cover for escape. Guaranteed escape from combat.",
    icon: "🌫️",
    rarity: "uncommon",
    price: 1500,
    effect: "Guaranteed escape from combat",
    stackable: true,
    maxStack: 5,
  },
  // Rare
  {
    id: "night_vision",
    name: "Night Vision Goggles",
    description: "See in the dark. +30% stealth crime success.",
    icon: "🥽",
    rarity: "rare",
    price: 5000,
    effect: "+30% stealth crime success for 24h",
    duration: 24,
    stackable: false,
    maxStack: 1,
  },
  {
    id: "explosive_ammo",
    name: "Explosive Rounds",
    description: "High-damage ammunition. +50% attack damage.",
    icon: "🔫",
    rarity: "rare",
    price: 4000,
    effect: "+50% attack damage for 10 attacks",
    stackable: true,
    maxStack: 3,
  },
  {
    id: "escape_tunnels",
    name: "Escape Tunnel Map",
    description: "Shows hidden escape routes. +40% escape success.",
    icon: "🗺️",
    rarity: "rare",
    price: 6000,
    effect: "+40% escape success rate",
    stackable: false,
    maxStack: 1,
  },
  {
    id: "bribe_kit",
    name: "Bribe Kit",
    description: "Cash and gifts for officials. -50% prison sentence.",
    icon: "💰",
    rarity: "rare",
    price: 8000,
    effect: "-50% prison sentence",
    stackable: true,
    maxStack: 3,
  },
  // Epic
  {
    id: "invisibility_cloak",
    name: "Stealth Suit",
    description: "Advanced camouflage technology. Become invisible.",
    icon: "👻",
    rarity: "epic",
    price: 15000,
    effect: "Invisible for 2 hours (immune to PvP)",
    duration: 2,
    stackable: false,
    maxStack: 1,
  },
  {
    id: "time_lock_bypass",
    name: "Time Lock Bypass",
    description: "Advanced hacking device. Skip cooldowns.",
    icon: "⏱️",
    rarity: "epic",
    price: 20000,
    effect: "Reset all cooldowns instantly",
    stackable: true,
    maxStack: 2,
  },
  {
    id: "max_health_elixir",
    name: "Max Health Elixir",
    description: "Permanently increases max health by 50.",
    icon: "❤️",
    rarity: "epic",
    price: 25000,
    effect: "+50 Max Health (permanent)",
    stackable: true,
    maxStack: 3,
  },
  {
    id: "double_xp_potion",
    name: "Double XP Potion",
    description: "Doubles all XP gained for 24 hours.",
    icon: "⭐",
    rarity: "epic",
    price: 18000,
    effect: "2x XP for 24h",
    duration: 24,
    stackable: false,
    maxStack: 1,
  },
  // Legendary
  {
    id: "immortality_potion",
    name: "Phoenix Down",
    description: "Resurrects you once if killed. Single use.",
    icon: "🔮",
    rarity: "legendary",
    price: 50000,
    effect: "Auto-resurrect on death (1 use)",
    stackable: true,
    maxStack: 1,
  },
  {
    id: "stat_reset_token",
    name: "Stat Reset Token",
    description: "Respec all your skills and stats.",
    icon: "🔄",
    rarity: "legendary",
    price: 75000,
    effect: "Full stat respec",
    stackable: false,
    maxStack: 1,
  },
  {
    id: "legendary_weapon",
    name: "The Reaper's Scythe",
    description: "A mythical weapon that guarantees critical hits.",
    icon: "💀",
    rarity: "legendary",
    price: 100000,
    effect: "100% critical hit chance for 1 hour",
    duration: 1,
    stackable: false,
    maxStack: 1,
  },
  {
    id: "family_resurrection",
    name: "Family Heirloom",
    description: "Pass down your wealth and items to your next character.",
    icon: "👑",
    rarity: "legendary",
    price: 200000,
    effect: "Legacy inheritance on death",
    stackable: false,
    maxStack: 1,
  },
];

export function getBlackMarketRarityColor(rarity: string): string {
  switch (rarity) {
    case "common": return "text-gray-400";
    case "uncommon": return "text-green-400";
    case "rare": return "text-blue-400";
    case "epic": return "text-purple-400";
    case "legendary": return "text-yellow-400";
    default: return "text-gray-400";
  }
}

export function getBlackMarketRarityBg(rarity: string): string {
  switch (rarity) {
    case "common": return "bg-gray-950/30 border-gray-800/50";
    case "uncommon": return "bg-green-950/30 border-green-800/50";
    case "rare": return "bg-blue-950/30 border-blue-800/50";
    case "epic": return "bg-purple-950/30 border-purple-800/50";
    case "legendary": return "bg-yellow-950/30 border-yellow-800/50";
    default: return "bg-gray-950/30 border-gray-800/50";
  }
}
