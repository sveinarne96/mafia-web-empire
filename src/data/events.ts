export interface WorldEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: "crime" | "combat" | "social" | "special";
  duration: number; // in hours
  rewards: {
    money: number;
    xp: number;
    items?: string[];
  };
  requirements: {
    level?: number;
    crimes?: number;
    kills?: number;
  };
  multiplier: number; // 1.0 = normal, 2.0 = double rewards
}

export const worldEvents: WorldEvent[] = [
  {
    id: "double_crime_weekend",
    name: "Double Crime Weekend",
    description: "All crimes pay double! This weekend only.",
    icon: "💰",
    type: "crime",
    duration: 48,
    rewards: { money: 0, xp: 0 },
    requirements: {},
    multiplier: 2.0,
  },
  {
    id: "bounty_hunt",
    name: "Bounty Hunt Bonanza",
    description: "Hunt down criminals for bonus rewards. The bigger the target, the bigger the payout!",
    icon: "🎯",
    type: "combat",
    duration: 24,
    rewards: { money: 5000, xp: 100 },
    requirements: { level: 5 },
    multiplier: 1.5,
  },
  {
    id: "family_reunion",
    name: "Family Reunion",
    description: "Families gather for a special event. All family operations have increased rewards.",
    icon: "👨‍👩‍👧‍👦",
    type: "social",
    duration: 12,
    rewards: { money: 2000, xp: 50 },
    requirements: {},
    multiplier: 1.3,
  },
  {
    id: "police_crackdown",
    name: "Police Crackdown",
    description: "The cops are out in force! Crime success rates reduced, but rewards increased.",
    icon: "🚔",
    type: "crime",
    duration: 6,
    rewards: { money: 10000, xp: 200 },
    requirements: { level: 10 },
    multiplier: 2.5,
  },
  {
    id: "underground_tournament",
    name: "Underground Tournament",
    description: "Fighters from all over gather for an epic tournament. Winner takes all!",
    icon: "🏆",
    type: "combat",
    duration: 8,
    rewards: { money: 25000, xp: 500 },
    requirements: { kills: 10 },
    multiplier: 3.0,
  },
  {
    id: "smuggling_rush",
    name: "Smuggling Rush",
    description: "The borders are open! Smuggling operations are highly profitable right now.",
    icon: "🚢",
    type: "crime",
    duration: 16,
    rewards: { money: 8000, xp: 150 },
    requirements: { level: 8 },
    multiplier: 1.8,
  },
  {
    id: "heist_planning",
    name: "Heist Planning Phase",
    description: "Gather your crew and plan the ultimate heist. Prep work pays double!",
    icon: "📋",
    type: "crime",
    duration: 24,
    rewards: { money: 3000, xp: 75 },
    requirements: { level: 12 },
    multiplier: 1.5,
  },
  {
    id: "black_market_frenzy",
    name: "Black Market Frenzy",
    description: "Rare items flooding the black market. Everything is 50% off!",
    icon: "🛒",
    type: "special",
    duration: 12,
    rewards: { money: 1000, xp: 25 },
    requirements: {},
    multiplier: 1.0,
  },
  {
    id: "rival_family_war",
    name: "Rival Family War",
    description: "War has broken out between families! Fight for your faction!",
    icon: "⚔️",
    type: "combat",
    duration: 36,
    rewards: { money: 15000, xp: 300 },
    requirements: { kills: 25 },
    multiplier: 2.0,
  },
  {
    id: "money_laundering_surge",
    name: "Money Laundering Surge",
    description: "Dirty money is flowing! Laundering operations have increased capacity.",
    icon: "💵",
    type: "crime",
    duration: 18,
    rewards: { money: 5000, xp: 100 },
    requirements: { level: 7 },
    multiplier: 1.6,
  },
  {
    id: "informant_network",
    name: "Informant Network Active",
    description: "Tips are coming in hot! Crime success rates increased.",
    icon: "🕵️",
    type: "crime",
    duration: 10,
    rewards: { money: 2000, xp: 50 },
    requirements: {},
    multiplier: 1.4,
  },
  {
    id: "gang_territory_clash",
    name: "Gang Territory Clash",
    description: "Neighborhoods are being contested! Control areas for passive income.",
    icon: "🏘️",
    type: "crime",
    duration: 24,
    rewards: { money: 4000, xp: 80 },
    requirements: { level: 6 },
    multiplier: 1.5,
  },
];

export function getEventTypeColor(type: string): string {
  switch (type) {
    case "crime": return "text-red-400";
    case "combat": return "text-orange-400";
    case "social": return "text-blue-400";
    case "special": return "text-purple-400";
    default: return "text-gray-400";
  }
}

export function getEventTypeBg(type: string): string {
  switch (type) {
    case "crime": return "bg-red-950/30 border-red-800/50";
    case "combat": return "bg-orange-950/30 border-orange-800/50";
    case "social": return "bg-blue-950/30 border-blue-800/50";
    case "special": return "bg-purple-950/30 border-purple-800/50";
    default: return "bg-gray-950/30 border-gray-800/50";
  }
}
