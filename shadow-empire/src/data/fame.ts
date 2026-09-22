export interface FameTitle {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  bonuses: {
    attack?: number;
    defense?: number;
    money?: number;
    xp?: number;
  };
}

export const fameTitles: FameTitle[] = [
  // Bronze Tier
  {
    id: "street_thug",
    name: "Street Thug",
    description: "A small-time criminal making a name for themselves.",
    icon: "🐀",
    requirement: "Commit 10 crimes",
    tier: "bronze",
    bonuses: { attack: 2 },
  },
  {
    id: "petty_criminal",
    name: "Petty Criminal",
    description: "Known for petty theft and minor offenses.",
    icon: "🔪",
    requirement: "Earn $10,000 from crimes",
    tier: "bronze",
    bonuses: { money: 500 },
  },
  {
    id: " neighborhood_nuisance",
    name: "Neighborhood Nuisance",
    description: "A troublemaker that locals fear.",
    icon: "📢",
    requirement: "Reach Level 5",
    tier: "bronze",
    bonuses: { xp: 10 },
  },
  // Silver Tier
  {
    id: "career_criminal",
    name: "Career Criminal",
    description: "A seasoned criminal with a long rap sheet.",
    icon: "🔓",
    requirement: "Commit 100 crimes",
    tier: "silver",
    bonuses: { attack: 5, defense: 3 },
  },
  {
    id: "heist_master",
    name: "Heist Master",
    description: "Successfully completed multiple high-profile heists.",
    icon: "🏦",
    requirement: "Complete 10 heists",
    tier: "silver",
    bonuses: { money: 2000 },
  },
  {
    id: " underworld_knight",
    name: "Underworld Knight",
    description: "Respected (or feared) in the criminal underworld.",
    icon: "⚔️",
    requirement: "Win 25 PvP fights",
    tier: "silver",
    bonuses: { attack: 8 },
  },
  {
    id: "shadow_operative",
    name: "Shadow Operative",
    description: "Masters of stealth and espionage.",
    icon: "🕵️",
    requirement: "Complete 50 espionage missions",
    tier: "silver",
    bonuses: { defense: 10 },
  },
  // Gold Tier
  {
    id: "crime_lord",
    name: "Crime Lord",
    description: "Commands respect and fear throughout the city.",
    icon: "👑",
    requirement: "Control 3 territories",
    tier: "gold",
    bonuses: { attack: 10, defense: 8, money: 5000 },
  },
  {
    id: "mastermind",
    name: "The Mastermind",
    description: "Planned and executed legendary heists.",
    icon: "🧠",
    requirement: "Complete the Government Building heist",
    tier: "gold",
    bonuses: { xp: 100 },
  },
  {
    id: "kingpin",
    name: "Kingpin",
    description: "Controls a significant portion of the criminal empire.",
    icon: "🃏",
    requirement: "Reach Level 30",
    tier: "gold",
    bonuses: { attack: 15, defense: 12 },
  },
  {
    id: "ghost",
    name: "The Ghost",
    description: "Never been caught. A myth among criminals.",
    icon: "👻",
    requirement: "Complete 50 crimes without being arrested",
    tier: "gold",
    bonuses: { defense: 20 },
  },
  // Platinum Tier
  {
    id: "don",
    name: "The Don",
    description: "Leader of a powerful crime family.",
    icon: "🎩",
    requirement: "Lead a family with 10+ members",
    tier: "platinum",
    bonuses: { attack: 20, defense: 15, money: 10000 },
  },
  {
    id: "shadow_king",
    name: "Shadow King",
    description: "Rules from the shadows, unseen and unknown.",
    icon: "🌑",
    requirement: "Defeat 5 legendary bosses",
    tier: "platinum",
    bonuses: { attack: 25, defense: 20 },
  },
  {
    id: "empire_builder",
    name: "Empire Builder",
    description: "Built a criminal empire spanning multiple cities.",
    icon: "🏰",
    requirement: "Control territories in 5 cities",
    tier: "platinum",
    bonuses: { money: 25000 },
  },
  // Diamond Tier
  {
    id: "criminal_legend",
    name: "Criminal Legend",
    description: "A name whispered in fear throughout the underworld.",
    icon: "💎",
    requirement: "Reach Level 50",
    tier: "diamond",
    bonuses: { attack: 30, defense: 25, money: 50000, xp: 500 },
  },
  {
    id: "untouchable",
    name: "The Untouchable",
    description: "Beyond the reach of law enforcement.",
    icon: "⚡",
    requirement: "Complete 500 crimes total",
    tier: "diamond",
    bonuses: { defense: 40 },
  },
  {
    id: "eternal_emperor",
    name: "Eternal Emperor",
    description: "The ultimate crime boss. Your legacy will last forever.",
    icon: "🌟",
    requirement: "Achieve all other titles",
    tier: "diamond",
    bonuses: { attack: 50, defense: 50, money: 100000, xp: 1000 },
  },
];

export function getFameTierColor(tier: string): string {
  switch (tier) {
    case "bronze": return "text-orange-400";
    case "silver": return "text-gray-300";
    case "gold": return "text-yellow-400";
    case "platinum": return "text-cyan-400";
    case "diamond": return "text-purple-400";
    default: return "text-gray-400";
  }
}

export function getFameTierBg(tier: string): string {
  switch (tier) {
    case "bronze": return "bg-orange-950/30 border-orange-800/50";
    case "silver": return "bg-gray-950/30 border-gray-700/50";
    case "gold": return "bg-yellow-950/30 border-yellow-800/50";
    case "platinum": return "bg-cyan-950/30 border-cyan-800/50";
    case "diamond": return "bg-purple-950/30 border-purple-800/50";
    default: return "bg-gray-950/30 border-gray-800/50";
  }
}
