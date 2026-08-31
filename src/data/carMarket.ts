// ===== CAR MARKET =====
// Buyable car catalog used by the GTA Car Theft dealer page.
// Rarities: common, rare, epic, legendary, custom, exclusive, exotic, "20s"

export interface MarketCar {
  id: string;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary" | "custom" | "exclusive" | "exotic" | "20s";
  price: number;
  speed: number;
  storage: number;
  armored?: boolean;
  desc: string;
}

export const CAR_RARITY_ORDER = ["exclusive", "exotic", "20s", "custom", "legendary", "epic", "rare", "common"] as const;

export const RARITY_COLORS: Record<string, string> = {
  common: "#94a3b8",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#f59e0b",
  custom: "#22d3ee",
  exclusive: "#ef4444",
  exotic: "#ec4899",
  "20s": "#eab308",
};

export const CAR_MARKET: MarketCar[] = [
  // COMMON
  { id: "civic_98", name: "1998 Honda Civic", rarity: "common", price: 10_000, speed: 40, storage: 14, desc: "A beater that always starts. Perfect first ride." },
  { id: "corolla_15", name: "2015 Toyota Corolla", rarity: "common", price: 22_000, speed: 52, storage: 18, desc: "Boring, reliable, invisible to cops." },
  { id: "focus_12", name: "2012 Ford Focus", rarity: "common", price: 18_000, speed: 48, storage: 16, desc: "Compact hatch with room for a duffel." },
  { id: "sentra_10", name: "2010 Nissan Sentra", rarity: "common", price: 15_000, speed: 45, storage: 15, desc: "Sips gas, holds a body in the trunk." },
  { id: "elantra_14", name: "2014 Hyundai Elantra", rarity: "common", price: 19_000, speed: 50, storage: 16, desc: "Fleet special. Nobody looks twice." },
  { id: "fiesta_13", name: "2013 Ford Fiesta", rarity: "common", price: 14_000, speed: 44, storage: 12, desc: "Park anywhere, squeeze through anything." },
  { id: "cruz_16", name: "2016 Chevrolet Cruze", rarity: "common", price: 24_000, speed: 53, storage: 18, desc: "A sensible sedan for sensible criminals." },

  // RARE
  { id: "m3_20", name: "2020 BMW M340i", rarity: "rare", price: 90_000, speed: 82, storage: 18, desc: "Executive power with four doors." },
  { id: "a4_19", name: "2019 Audi A4", rarity: "rare", price: 75_000, speed: 76, storage: 17, desc: "Quattro grip for wet getaways." },
  { id: "mustang_18", name: "2018 Ford Mustang GT", rarity: "rare", price: 95_000, speed: 88, storage: 15, desc: "American muscle, loud and proud." },
  { id: "camaro_19", name: "2019 Chevrolet Camaro SS", rarity: "rare", price: 100_000, speed: 89, storage: 14, desc: "Burnouts at every intersection." },
  { id: "charger_17", name: "2017 Dodge Charger", rarity: "rare", price: 85_000, speed: 84, storage: 20, desc: "Cop-car looks keep you off radar." },
  { id: "golfr_20", name: "2020 VW Golf R", rarity: "rare", price: 80_000, speed: 79, storage: 18, desc: "A sleeper that shocks exotics." },
  { id: "supra_21", name: "2021 Toyota Supra", rarity: "rare", price: 120_000, speed: 90, storage: 13, desc: "Legendary nameplate, modern grip." },
  { id: "c63_18", name: "2018 Mercedes C63 AMG", rarity: "rare", price: 110_000, speed: 88, storage: 16, desc: "Twin-turbo V8 in a business suit." },

  // EPIC
  { id: "p911_20", name: "2020 Porsche 911 Carrera", rarity: "epic", price: 260_000, speed: 100, storage: 12, desc: "The benchmark. The icon." },
  { id: "r8_19", name: "2019 Audi R8 V10", rarity: "epic", price: 320_000, speed: 105, storage: 12, desc: "A supercar you can daily-drive." },
  { id: "mclaren_gt", name: "2021 McLaren GT", rarity: "epic", price: 400_000, speed: 108, storage: 14, desc: "Grand tourer with race DNA." },
  { id: "db11", name: "2019 Aston Martin DB11", rarity: "epic", price: 380_000, speed: 106, storage: 13, desc: "James Bond would approve." },
  { id: "gt63", name: "2020 Mercedes-AMG GT63 S", rarity: "epic", price: 340_000, speed: 104, storage: 16, desc: "A four-door missile." },
  { id: "rs7", name: "2019 Audi RS7", rarity: "epic", price: 300_000, speed: 102, storage: 17, desc: "Wagon-shaped intimidation." },
  { id: "urus", name: "2021 Lamborghini Urus", rarity: "epic", price: 450_000, speed: 103, storage: 22, desc: "A Lambo that carries the crew." },
  { id: "f8", name: "2020 Ferrari F8 Tributo", rarity: "epic", price: 520_000, speed: 110, storage: 10, desc: "Screaming V8, theater on wheels." },

  // LEGENDARY
  { id: "huracan", name: "2019 Lamborghini Huracán EVO", rarity: "legendary", price: 1_200_000, speed: 115, storage: 10, desc: "A raging bull for the godfather." },
  { id: "sf90", name: "2022 Ferrari SF90 Stradale", rarity: "legendary", price: 1_800_000, speed: 118, storage: 10, desc: "Hybrid V8 hypercar hybrid." },
  { id: "pista", name: "2021 Ferrari 488 Pista", rarity: "legendary", price: 1_500_000, speed: 116, storage: 9, desc: "Track-bred, road-legal rage." },
  { id: "gt3rs", name: "2022 Porsche 911 GT3 RS", rarity: "legendary", price: 1_400_000, speed: 117, storage: 9, desc: "A race car with a license plate." },
  { id: "svj", name: "2021 Lamborghini Aventador SVJ", rarity: "legendary", price: 2_200_000, speed: 119, storage: 10, desc: "The last of the great V12s." },
  { id: "senna", name: "2020 McLaren Senna", rarity: "legendary", price: 2_500_000, speed: 120, storage: 8, desc: "Built to honor a legend." },
  { id: "chiron_sport", name: "2019 Bugatti Chiron Sport", rarity: "legendary", price: 6_000_000, speed: 125, storage: 10, desc: "1,500 horsepower of pure menace." },
  { id: "valkyrie", name: "2023 Aston Martin Valkyrie", rarity: "legendary", price: 8_000_000, speed: 128, storage: 8, desc: "Formula One for the street." },

  // CUSTOM
  { id: "custom_gtr", name: "R34 Skyline GT-R (1,200hp)", rarity: "custom", price: 750_000, speed: 112, storage: 12, desc: "Full race build, widebody, anti-lag." },
  { id: "custom_mustang", name: "Eleanor-Style '67 Mustang", rarity: "custom", price: 900_000, speed: 108, storage: 14, desc: "A movie icon with a modern heart." },
  { id: "custom_e30", name: "E30 M3 Restomod", rarity: "custom", price: 650_000, speed: 104, storage: 12, desc: "Old school cool, new school go." },
  { id: "custom_supra", name: "2JZ Widebody Supra", rarity: "custom", price: 800_000, speed: 113, storage: 11, desc: "1,000hp of pure JDM legend." },
  { id: "custom_impala", name: "Lowrider Impala '64", rarity: "custom", price: 550_000, speed: 92, storage: 20, desc: "Hydraulics, gold trim, street presence." },
  { id: "custom_bat", name: "Batmobile-Style Roadster", rarity: "custom", price: 1_100_000, speed: 114, storage: 16, desc: "Nobody follows you twice." },

  // EXCLUSIVE (one-of-one — buying loses Civilian Protection)
  { id: "exclusive_pagani", name: "Pagani Zonda King", rarity: "exclusive", price: 12_000_000, speed: 126, storage: 8, desc: "One of one. Hand-built art." },
  { id: "exclusive_laferrari", name: "LaFerrari Aperta", rarity: "exclusive", price: 10_000_000, speed: 124, storage: 8, desc: "The holy trinity, open-top." },
  { id: "exclusive_veyron", name: "Veyron Super Sport 'World Record'", rarity: "exclusive", price: 14_000_000, speed: 127, storage: 9, desc: "Held the speed record for years." },
  { id: "exclusive_koenig", name: "Koenigsegg Jesko Prototype", rarity: "exclusive", price: 18_000_000, speed: 130, storage: 8, desc: "300mph potential. Zero regrets." },
  { id: "exclusive_phantom", name: "Rolls-Royce Boat Tail", rarity: "exclusive", price: 22_000_000, speed: 100, storage: 40, desc: "The most expensive car ever made." },

  // EXOTIC
  { id: "exotic_veyron", name: "Bugatti Veyron Grand Sport", rarity: "exotic", price: 5_500_000, speed: 124, storage: 9, desc: "The original hypercar." },
  { id: "exotic_huayra", name: "Pagani Huayra BC", rarity: "exotic", price: 4_500_000, speed: 122, storage: 8, desc: "Art that moves at 370km/h." },
  { id: "exotic_one77", name: "Aston Martin One-77", rarity: "exotic", price: 3_800_000, speed: 120, storage: 9, desc: "Only 77 ever built." },
  { id: "exotic_lfa", name: "Lexus LFA", rarity: "exotic", price: 3_200_000, speed: 119, storage: 9, desc: "That V10 howl is priceless." },
  { id: "exotic_918", name: "Porsche 918 Spyder", rarity: "exotic", price: 4_200_000, speed: 121, storage: 8, desc: "Hybrid tech meets insane pace." },

  // 20s CUSTOM (vintage classics)
  { id: "classic_modela", name: "1929 Model A 'Speakeasy'", rarity: "20s", price: 180_000, speed: 55, storage: 22, desc: "Prohibition-era getaway car." },
  { id: "classic_fordt", name: "1923 Ford T 'Rat Rod'", rarity: "20s", price: 120_000, speed: 50, storage: 20, desc: "Patina, flames, and a big block." },
  { id: "classic_deluxe", name: "1931 Cadillac Deluxe", rarity: "20s", price: 320_000, speed: 60, storage: 28, desc: "Gangster royalty on chrome." },
  { id: "classic_duesy", name: "1930 Duesenberg J", rarity: "20s", price: 480_000, speed: 62, storage: 26, desc: "The car Al Capone actually drove." },
  { id: "classic_bentley", name: "1928 Bentley 4½ 'Blower'", rarity: "20s", price: 520_000, speed: 65, storage: 24, desc: "Pre-war racing pedigree." },
];

export function getRarityColor(rarity: string): string {
  return RARITY_COLORS[rarity] ?? "#94a3b8";
}

export function rarityLabel(rarity: string): string {
  if (rarity === "20s") return "20s Custom";
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}
