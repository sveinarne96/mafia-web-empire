// ═══════════ CRYPTO STOCKS ═══════════
export interface StockDef {
  id: string;
  symbol: string;
  name: string;
  base: number; // base price (points)
  vol: number; // volatility
}

export const STOCKS: StockDef[] = [
  { id: "avax", symbol: "AVAX", name: "Avalanche", base: 7.16, vol: 0.06 },
  { id: "bnb", symbol: "BNB", name: "Binance Coin", base: 685.45, vol: 0.05 },
  { id: "btc", symbol: "BTC", name: "Bitcoin", base: 77842, vol: 0.04 },
  { id: "bch", symbol: "BCH", name: "Bitcoin Cash", base: 244.5, vol: 0.08 },
  { id: "bittensor", symbol: "TAO", name: "Bittensor", base: 226.4, vol: 0.09 },
  { id: "ada", symbol: "ADA", name: "Cardano", base: 0.1942, vol: 0.08 },
  { id: "link", symbol: "LINK", name: "Chainlink", base: 11.2, vol: 0.06 },
  { id: "curve", symbol: "CRV", name: "Curve DAO Token", base: 0.3019, vol: 0.1 },
  { id: "doge", symbol: "DOGE", name: "Dogecoin", base: 0.0822, vol: 0.09 },
  { id: "eth", symbol: "ETH", name: "Ethereum", base: 2439.18, vol: 0.04 },
  { id: "sol", symbol: "SOL", name: "Solana", base: 142.0, vol: 0.07 },
  { id: "xrp", symbol: "XRP", name: "XRP", base: 0.52, vol: 0.06 },
];

// ═══════════ SUPPLY RUNNING ═══════════
export interface SupplyDef { id: string; name: string; price: number; icon: string; }
export const SUPPLIES: SupplyDef[] = [
  { id: "gun", name: "Gun Crates", price: 225, icon: "📦" },
  { id: "drug", name: "Drug Crates", price: 431, icon: "💊" },
  { id: "booze", name: "Booze Crates", price: 450, icon: "🍾" },
  { id: "ammo", name: "Ammo Crates", price: 1116, icon: "🎯" },
];
export const SUPPLY_CITIES = ["Zenith"];
export const SUPPLY_MAX_RETURN_RUNS = 500;
export const SUPPLY_PRICE_ROTATION_MS = 6 * 3600000; // ~6h rotation

// ═══════════ REAL ESTATE ═══════════
export interface EstateLocationDef {
  name: string;
  propertyType: string;
  perk: string;
}
export const ESTATE_LOCATIONS: EstateLocationDef[] = [
  { name: "Azure", propertyType: "Mansion", perk: "Rare chance to receive rare and epic scraps." },
  { name: "Foundry", propertyType: "Bungalow", perk: "Rare chance to receive a free scratchcard." },
  { name: "Solis", propertyType: "Villa", perk: "Rare chance to receive free bullets." },
  { name: "Zenith", propertyType: "Bunker", perk: "Rare chance to receive estate property perks." },
];
export const ESTATE_PRICES: Record<string, number> = { Azure: 420_000_000, Foundry: 150_000_000, Solis: 260_000_000, Zenith: 285_000_000 };
export const ESTATE_BASE_RENT: Record<string, number> = { Azure: 45_000_000, Foundry: 12_000_000, Solis: 22_000_000, Zenith: 30_000_000 };
export const ESTATE_MAX_UPGRADES = 3;
export const ESTATE_CONSTRUCTION_DAYS = 5;

// ═══════════ CRACK THE SAFE ═══════════
export const SAFE_JACKPOT_BASE = 10_000_000;
export const SAFE_GUESS_COST = 2_500_000;
export const SAFE_DIGITS = 5;
export const SAFE_MAX_ATTEMPTS_PER_DAY = 1;