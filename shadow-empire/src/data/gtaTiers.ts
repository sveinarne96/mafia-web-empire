// GTA Car Theft — tier system
// Odds: Budget 30% / Standard 30% / Premium 10% / Sport 10% / Exotic 10% / Legendary 10%
// The "+" — every 10 player levels shifts 1% out of Budget/Standard into the top tiers.

export type GtaTierId = "budget" | "standard" | "premium" | "sport" | "exotic" | "legendary";

export interface GtaTierMeta {
  id: GtaTierId;
  name: string;
  icon: string;
  desc: string;
  weight: number; // base odds at level 1
  color: string; // tailwind text class
  rgb: string; // "r,g,b" accent
}

export const GTA_TIERS: GtaTierMeta[] = [
  { id: "budget", name: "Budget", icon: "🚗", desc: "Parking lots, curbs & driveways", weight: 30, color: "text-gray-300", rgb: "203,213,225" },
  { id: "standard", name: "Standard", icon: "🚙", desc: "Commuter streets & dealer lots", weight: 30, color: "text-blue-300", rgb: "147,197,253" },
  { id: "premium", name: "Premium", icon: "💎", desc: "Executive garages & collectors", weight: 10, color: "text-purple-300", rgb: "196,181,253" },
  { id: "sport", name: "Sport", icon: "🏎️", desc: "Race strips & tuner meets", weight: 10, color: "text-red-300", rgb: "252,165,165" },
  { id: "exotic", name: "Exotisk", icon: "🦅", desc: "Supercar showrooms & VIP events", weight: 10, color: "text-amber-300", rgb: "252,211,77" },
  { id: "legendary", name: "Legendarisk", icon: "👑", desc: "Vaults, museums & oil money", weight: 10, color: "text-yellow-200", rgb: "254,240,138" },
];

// Which backend car `type`s belong to each tier (matches carData in gameEnhanced.ts)
export const TIER_TYPES: Record<GtaTierId, string[]> = {
  budget: ["economy", "compact", "truck"],
  standard: ["sedan", "suv", "rally"],
  premium: ["luxury", "electric", "vintage", "armored"],
  sport: ["sport", "muscle"],
  exotic: ["supercar", "ultra"],
  legendary: ["legendary", "hypercar"],
};

/** Current tier odds for a player level — always sums to 100. */
export function gtaTierWeights(level: number): Record<GtaTierId, number> {
  const shift = Math.min(24, Math.floor(Math.max(1, level) / 10));
  const top = 10 + shift / 2;
  return {
    budget: Math.max(6, 30 - shift),
    standard: Math.max(6, 30 - shift),
    premium: top,
    sport: top,
    exotic: top,
    legendary: top,
  };
}

/** Weighted random tier roll using level-scaled odds. */
export function rollGtaTier(level: number): GtaTierId {
  const weights = gtaTierWeights(level);
  const entries = Object.entries(weights) as [GtaTierId, number][];
  let roll = Math.random() * 100;
  for (const [id, w] of entries) {
    roll -= w;
    if (roll <= 0) return id;
  }
  return "budget";
}

export interface GtaShowcaseCar {
  name: string;
  price: number;
  speed: number;
  storage: number;
  armored: boolean;
}

/** Curated cars you can specifically target in each tier (names must exist in carData). */
export const GTA_TIER_CARS: Record<GtaTierId, GtaShowcaseCar[]> = {
  budget: [
    { name: "2018 Nissan Versa", price: 5000, speed: 35, storage: 20, armored: false },
    { name: "2019 Honda Fit", price: 8000, speed: 39, storage: 22, armored: false },
    { name: "2020 Suzuki Swift", price: 8200, speed: 43, storage: 18, armored: false },
    { name: "2019 Chevrolet Cruze", price: 16500, speed: 50, storage: 22, armored: false },
    { name: "2019 Honda Civic", price: 18000, speed: 55, storage: 25, armored: false },
    { name: "2020 Ford Focus", price: 18500, speed: 54, storage: 21, armored: false },
    { name: "2021 Toyota Prius", price: 25000, speed: 48, storage: 20, armored: false },
    { name: "2020 Ford Ranger", price: 30000, speed: 46, storage: 34, armored: false },
  ],
  standard: [
    { name: "2020 Chevrolet Malibu", price: 23000, speed: 56, storage: 25, armored: false },
    { name: "2020 Toyota Camry", price: 25000, speed: 58, storage: 28, armored: false },
    { name: "2021 Volkswagen Passat", price: 27500, speed: 58, storage: 26, armored: false },
    { name: "2021 Honda Accord", price: 28000, speed: 60, storage: 27, armored: false },
    { name: "2021 Dodge Charger", price: 35000, speed: 68, storage: 22, armored: false },
    { name: "2020 Subaru WRX STI", price: 40000, speed: 72, storage: 16, armored: false },
    { name: "2021 Jeep Grand Cherokee", price: 55000, speed: 64, storage: 40, armored: false },
    { name: "2020 Lexus RX", price: 58000, speed: 65, storage: 38, armored: false },
  ],
  premium: [
    { name: "2021 Tesla Model 3", price: 50000, speed: 78, storage: 22, armored: false },
    { name: "2021 BMW 5 Series", price: 62000, speed: 74, storage: 20, armored: false },
    { name: "2020 Mercedes E-Class", price: 68000, speed: 76, storage: 19, armored: false },
    { name: "2022 Tesla Model S", price: 85000, speed: 85, storage: 24, armored: false },
    { name: "1969 Chevrolet Camaro", price: 120000, speed: 62, storage: 12, armored: false },
    { name: "1967 Ford Mustang", price: 150000, speed: 60, storage: 14, armored: false },
    { name: "1961 Jaguar E-Type", price: 250000, speed: 68, storage: 8, armored: false },
    { name: "2022 armored Mercedes S-Class", price: 600000, speed: 70, storage: 20, armored: true },
  ],
  sport: [
    { name: "2021 Chevrolet Camaro", price: 42000, speed: 77, storage: 14, armored: false },
    { name: "2020 BMW 3 Series", price: 45000, speed: 72, storage: 20, armored: false },
    { name: "2021 Mercedes C-Class", price: 55000, speed: 75, storage: 18, armored: false },
    { name: "2021 Ford Mustang GT", price: 55000, speed: 78, storage: 15, armored: false },
    { name: "2020 BMW M340i", price: 58000, speed: 78, storage: 17, armored: false },
    { name: "2020 Chevrolet Corvette", price: 68000, speed: 90, storage: 12, armored: false },
    { name: "2021 Dodge Challenger SRT", price: 72000, speed: 85, storage: 15, armored: false },
    { name: "2021 Ford Mustang Shelby", price: 80000, speed: 92, storage: 12, armored: false },
  ],
  exotic: [
    { name: "2022 Porsche 911 Carrera", price: 120000, speed: 92, storage: 10, armored: false },
    { name: "2021 Audi R8", price: 180000, speed: 96, storage: 8, armored: false },
    { name: "2021 Lamborghini Huracan", price: 250000, speed: 98, storage: 6, armored: false },
    { name: "2022 Ferrari Roma", price: 280000, speed: 96, storage: 8, armored: false },
    { name: "2021 McLaren 720S", price: 310000, speed: 97, storage: 5, armored: false },
    { name: "2022 Ferrari F8 Tributo", price: 320000, speed: 99, storage: 5, armored: false },
    { name: "2022 Bugatti Chiron", price: 500000, speed: 100, storage: 4, armored: false },
    { name: "2021 Pagani Huayra", price: 600000, speed: 100, storage: 3, armored: false },
  ],
  legendary: [
    { name: "2023 Mercedes-AMG One", price: 2750000, speed: 100, storage: 4, armored: false },
    { name: "2021 Koenigsegg Jesko", price: 3000000, speed: 100, storage: 3, armored: false },
    { name: "2022 Bugatti Divo", price: 5800000, speed: 100, storage: 3, armored: false },
    { name: "2020 Bugatti Chiron Super Sport", price: 10000000, speed: 100, storage: 4, armored: false },
    { name: "2021 Bugatti Centodieci", price: 12000000, speed: 100, storage: 3, armored: false },
    { name: "2022 Ferrari Monza SP2", price: 18000000, speed: 100, storage: 2, armored: false },
    { name: "2021 Rolls-Royce Boat Tail", price: 30000000, speed: 70, storage: 25, armored: false },
    { name: "2023 Bugatti Tourbillon", price: 40000000, speed: 100, storage: 3, armored: false },
  ],
};
