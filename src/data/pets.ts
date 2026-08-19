export interface Pet {
  id: string;
  name: string;
  species: string;
  icon: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  attackBonus: number;
  defenseBonus: number;
  specialAbility: string;
  abilityDescription: string;
  price: number;
  levelRequired: number;
  description: string;
}

export const criminalPets: Pet[] = [
  // Common
  {
    id: "street_cat",
    name: "Shadow",
    species: "Cat",
    icon: "🐱",
    rarity: "common",
    attackBonus: 2,
    defenseBonus: 1,
    specialAbility: "Sneak Attack",
    abilityDescription: "Increases stealth in crimes by 10%",
    price: 500,
    levelRequired: 1,
    description: "A street-smart feline who's seen it all. Perfect for surveillance.",
  },
  {
    id: "guard_dog",
    name: "Rex",
    species: "Dog",
    icon: "🐕",
    rarity: "common",
    attackBonus: 3,
    defenseBonus: 2,
    specialAbility: "Guard Duty",
    abilityDescription: "Protects you from one ambush per day",
    price: 800,
    levelRequired: 2,
    description: "A loyal companion who will fight by your side.",
  },
  {
    id: "pigeon",
    name: "Tracker",
    species: "Pigeon",
    icon: "🐦",
    rarity: "common",
    attackBonus: 1,
    defenseBonus: 1,
    specialAbility: "Message Delivery",
    abilityDescription: "Delivers messages faster across cities",
    price: 300,
    levelRequired: 1,
    description: "A trained carrier pigeon for secret communications.",
  },
  // Uncommon
  {
    id: "raven",
    name: "Phantom",
    species: "Raven",
    icon: "🐦‍⬛",
    rarity: "uncommon",
    attackBonus: 4,
    defenseBonus: 3,
    specialAbility: "Scout",
    abilityDescription: "Reveals enemy positions before combat",
    price: 2000,
    levelRequired: 5,
    description: "A mysterious raven that brings omens of danger.",
  },
  {
    id: "python",
    name: "Viper",
    species: "Python",
    icon: "🐍",
    rarity: "uncommon",
    attackBonus: 5,
    defenseBonus: 2,
    specialAbility: "Constrict",
    abilityDescription: "Can immobilize one enemy in combat",
    price: 2500,
    levelRequired: 6,
    description: "A deadly serpent that strikes without warning.",
  },
  {
    id: "hawk",
    name: "Eyes",
    species: "Hawk",
    icon: "🦅",
    rarity: "uncommon",
    attackBonus: 3,
    defenseBonus: 4,
    specialAbility: "Aerial Recon",
    abilityDescription: "Reveals hidden traps and ambushes",
    price: 2200,
    levelRequired: 5,
    description: "A trained hawk with incredible eyesight.",
  },
  // Rare
  {
    id: "wolf",
    name: "Fang",
    species: "Wolf",
    icon: "🐺",
    rarity: "rare",
    attackBonus: 8,
    defenseBonus: 6,
    specialAbility: "Pack Mentality",
    abilityDescription: "Buffs nearby allies in crew battles",
    price: 5000,
    levelRequired: 10,
    description: "A fierce wolf that leads the pack.",
  },
  {
    id: "eagle",
    name: "Skyfall",
    species: "Eagle",
    icon: "🦅",
    rarity: "rare",
    attackBonus: 6,
    defenseBonus: 7,
    specialAbility: "Dive Bomb",
    abilityDescription: "Critical hit chance increased by 20%",
    price: 5500,
    levelRequired: 11,
    description: "A majestic eagle with deadly precision.",
  },
  {
    id: "panther",
    name: "Shadow",
    species: "Panther",
    icon: "🐆",
    rarity: "rare",
    attackBonus: 9,
    defenseBonus: 5,
    specialAbility: "Stealth Mode",
    abilityDescription: "First strike guaranteed in combat",
    price: 6000,
    levelRequired: 12,
    description: "A silent killer that strikes from the shadows.",
  },
  // Epic
  {
    id: "tiger",
    name: "Blaze",
    species: "Tiger",
    icon: "🐅",
    rarity: "epic",
    attackBonus: 12,
    defenseBonus: 8,
    specialAbility: "Berserker",
    abilityDescription: "Damage increases as health decreases",
    price: 15000,
    levelRequired: 18,
    description: "A powerful beast that fights with primal fury.",
  },
  {
    id: "bear",
    name: "Titan",
    species: "Bear",
    icon: "🐻",
    rarity: "epic",
    attackBonus: 10,
    defenseBonus: 12,
    specialAbility: "Bear Hug",
    abilityDescription: "Can grapple and disarm enemies",
    price: 16000,
    levelRequired: 19,
    description: "A massive bear that crushes all opposition.",
  },
  {
    id: "shark",
    name: "Jaws",
    species: "Shark",
    icon: "🦈",
    rarity: "epic",
    attackBonus: 14,
    defenseBonus: 7,
    specialAbility: "Blood in Water",
    abilityDescription: "Bonus damage to low-health enemies",
    price: 18000,
    levelRequired: 20,
    description: "A relentless predator that never stops hunting.",
  },
  // Legendary
  {
    id: "dragon",
    name: "Nexus",
    species: "Dragon",
    icon: "🐉",
    rarity: "legendary",
    attackBonus: 20,
    defenseBonus: 15,
    specialAbility: "Dragon's Breath",
    abilityDescription: "AOE fire damage in combat",
    price: 50000,
    levelRequired: 25,
    description: "A mythical beast of unparalleled power.",
  },
  {
    id: "phoenix",
    name: "Rebirth",
    species: "Phoenix",
    icon: "🔥",
    rarity: "legendary",
    attackBonus: 18,
    defenseBonus: 18,
    specialAbility: "Rebirth",
    abilityDescription: "Revive once per day with full health",
    price: 60000,
    levelRequired: 28,
    description: "A legendary bird that rises from the ashes.",
  },
  {
    id: "cerberus",
    name: "Hellhound",
    species: "Cerberus",
    icon: "🐾",
    rarity: "legendary",
    attackBonus: 22,
    defenseBonus: 14,
    specialAbility: "Triple Strike",
    abilityDescription: "Attack three times in one turn",
    price: 75000,
    levelRequired: 30,
    description: "The three-headed guardian of the underworld.",
  },
];

export function getPetRarityColor(rarity: string): string {
  switch (rarity) {
    case "common": return "text-gray-400";
    case "uncommon": return "text-green-400";
    case "rare": return "text-blue-400";
    case "epic": return "text-purple-400";
    case "legendary": return "text-yellow-400";
    default: return "text-gray-400";
  }
}

export function getPetRarityBg(rarity: string): string {
  switch (rarity) {
    case "common": return "bg-gray-950/30 border-gray-800/50";
    case "uncommon": return "bg-green-950/30 border-green-800/50";
    case "rare": return "bg-blue-950/30 border-blue-800/50";
    case "epic": return "bg-purple-950/30 border-purple-800/50";
    case "legendary": return "bg-yellow-950/30 border-yellow-800/50";
    default: return "bg-gray-950/30 border-gray-800/50";
  }
}
