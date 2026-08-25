// ===== ULTIMATE POINTS SHOP DATA =====
// 175+ items across 10 clean categories

export interface PointsShopItem {
  id: string;
  name: string;
  icon: string;
  cost: number;
  desc: string;
  category: string;
  tier?: "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";
}

// ===== CATEGORY 1: BOOSTERS =====
export const boosterItems: PointsShopItem[] = [
  { id: "rank_small", name: "Small Rank Booster", icon: "🚀", cost: 90, desc: "+50% XP for 4 hours", category: "boosters" },
  { id: "rank_standard", name: "Standard Rank Booster", icon: "🚀", cost: 200, desc: "+50% XP for 10 hours", category: "boosters" },
  { id: "rank_mega", name: "Mega Rank Booster", icon: "🚀", cost: 500, desc: "+50% XP for 24 hours", category: "boosters" },
  { id: "xp_surge", name: "XP Surge", icon: "⚡", cost: 300, desc: "3x XP for 6 hours", category: "boosters" },
  { id: "cash_storm", name: "Cash Storm", icon: "💰", cost: 300, desc: "3x Cash for 6 hours", category: "boosters" },
  { id: "points_multiplier", name: "Points Multiplier", icon: "🎯", cost: 250, desc: "3x Points for 6 hours", category: "boosters" },
  { id: "energy_surge", name: "Energy Surge", icon: "🥤", cost: 200, desc: "+25% XP for 12 hours", category: "boosters" },
  { id: "god_mode", name: "God Mode", icon: "👑", cost: 1500, desc: "3x XP + 3x Cash + Energy 24H", category: "boosters", tier: "legendary" },
];

// ===== CATEGORY 2: HEALTH & HOSPITAL =====
export const healthItems: PointsShopItem[] = [
  { id: "life_refill", name: "Full Heal", icon: "❤️", cost: 100, desc: "Restore to 100 HP", category: "health" },
  { id: "revive", name: "Revive", icon: "💖", cost: 200, desc: "Come back from the dead", category: "health" },
  { id: "emergency_medicine", name: "Emergency Medicine", icon: "💊", cost: 100, desc: "Restore 100% health", category: "health" },
  { id: "nurse_vip", name: "Nurse VIP", icon: "👩‍⚕️", cost: 500, desc: "Halve hospital stays 24h", category: "health" },
  { id: "max_hp", name: "Max HP Upgrade", icon: "❤️‍🔥", cost: 2000, desc: "+50 MAX HP permanently", category: "health", tier: "epic" },
  { id: "medical_vip", name: "Medical VIP Pass", icon: "🏥", cost: 2000, desc: "Permanent +10% HP regen", category: "health", tier: "epic" },
  { id: "emergency_blood", name: "Emergency Blood", icon: "🩸", cost: 1000, desc: "Survive fatal with 1 HP", category: "health", tier: "epic" },
  { id: "luxury_hospital", name: "Luxury Hospital Room", icon: "🏥", cost: 500, desc: "Train stats in hospital", category: "health" },
];

// ===== CATEGORY 3: PRISON & LAW =====
export const prisonItems: PointsShopItem[] = [
  { id: "bribe_guard", name: "Bribe Guard", icon: "🔓", cost: 250, desc: "Get out of prison now", category: "prison" },
  { id: "jailbreak", name: "Jailbreak Card", icon: "⛓️", cost: 500, desc: "Instant release from prison", category: "prison" },
  { id: "bail_out_buddy", name: "Bail Out Buddy", icon: "👥", cost: 350, desc: "Get gang member out", category: "prison" },
  { id: "lawyer_speed_dial", name: "Lawyer Speed Dial", icon: "⚖️", cost: 600, desc: "Auto-avoid prison 3h", category: "prison" },
  { id: "top_lawyer", name: "Top Lawyer Package", icon: "👔", cost: 1500, desc: "Buddies -80% prison 12h", category: "prison", tier: "epic" },
  { id: "corrupt_judge", name: "Corrupt Judge", icon: "⚖️", cost: 1500, desc: "Permanently -5% sentences", category: "prison", tier: "legendary" },
  { id: "pre_bail", name: "Pre-Purchased Bail", icon: "💰", cost: 1500, desc: "Auto-release next arrest", category: "prison", tier: "epic" },
  { id: "police_distraction", name: "Police Distraction", icon: "👮", cost: 800, desc: "Freeze manhunt 30min", category: "prison" },
  { id: "corrupt_chief", name: "Corrupt Police Chief", icon: "👮", cost: 2000, desc: "Auto-clear record 10min", category: "prison", tier: "legendary" },
  { id: "vip_cell", name: "VIP Cell", icon: "⛓️", cost: 500, desc: "Earn XP in prison", category: "prison" },
  { id: "instant_immunity", name: "Instant Immunity", icon: "🛡️", cost: 1500, desc: "Safe for next 10 crimes", category: "prison", tier: "legendary" },
  { id: "prison_riot", name: "Prison Riot", icon: "⛓️", cost: 2000, desc: "Free all gang members", category: "prison", tier: "legendary" },
];

// ===== CATEGORY 4: BODY ARMOR =====
export const armorItems: PointsShopItem[] = [
  { id: "vest_l1", name: "Bulletproof Vest L1", icon: "🦺", cost: 200, desc: "Absorbs 500 bullets", category: "armor" },
  { id: "vest_l2", name: "Bulletproof Vest L2", icon: "🦺", cost: 500, desc: "Absorbs 1,200 bullets", category: "armor", tier: "rare" },
  { id: "vest_l3", name: "Bulletproof Vest L3", icon: "🦺", cost: 1200, desc: "Absorbs 3,000 bullets", category: "armor", tier: "epic" },
  { id: "vest_ceramic", name: "Ceramic Vest", icon: "🦺", cost: 2000, desc: "Absorbs 4,000 bullets", category: "armor", tier: "epic" },
  { id: "vest_titanium", name: "Titanium Vest", icon: "🦺", cost: 3000, desc: "Absorbs 5,000 bullets", category: "armor", tier: "legendary" },
  { id: "military_kevlar", name: "Military Kevlar", icon: "🦺", cost: 1000, desc: "Absorbs 2,000 bullets", category: "armor", tier: "rare" },
  { id: "tactical_vest_up", name: "Tactical Vest Upgrade", icon: "🦺", cost: 400, desc: "Increase vest capacity", category: "armor" },
  { id: "bp_helmet", name: "Bulletproof Helmet", icon: "⛑️", cost: 500, desc: "Protects against headshots", category: "armor" },
  { id: "bodyguard_10", name: "Bodyguard (10%)", icon: "💂", cost: 400, desc: "Reduce damage 10%", category: "armor" },
  { id: "elite_bodyguard", name: "Elite Bodyguard", icon: "💂", cost: 1200, desc: "100% survive first shot", category: "armor", tier: "epic" },
  { id: "smoke_bomb", name: "Smoke Bomb", icon: "💨", cost: 400, desc: "+40% escape chance", category: "armor" },
  { id: "body_armor_car", name: "Body Armor (Vehicle)", icon: "🚗", cost: 1000, desc: "Getaway car crash-proof", category: "armor" },
];

// ===== CATEGORY 5: PROPERTY DEFENSE =====
export const propertyItems: PointsShopItem[] = [
  { id: "hq_shield", name: "HQ Shield", icon: "🏰", cost: 1200, desc: "Gang base invulnerable 2h", category: "property" },
  { id: "safehouse_small", name: "Safehouse (Small)", icon: "🏠", cost: 1000, desc: "Invulnerable 6h", category: "property", tier: "rare" },
  { id: "luxury_bunker", name: "Luxury Bunker", icon: "🏰", cost: 3000, desc: "Invulnerable 24h", category: "property", tier: "legendary" },
  { id: "minefield", name: "Minefield", icon: "💣", cost: 800, desc: "Protect factory from sabotage", category: "property" },
  { id: "bp_glass", name: "Bulletproof Glass", icon: "🪟", cost: 500, desc: "Increases HQ defense", category: "property" },
  { id: "blast_wall", name: "Blast-Proof Wall", icon: "🧱", cost: 700, desc: "Protect casino from bombs", category: "property" },
  { id: "alarm_system", name: "Alarm System", icon: "🚨", cost: 300, desc: "Alert if someone searches you", category: "property" },
  { id: "surveillance_cam", name: "Surveillance Cameras", icon: "📹", cost: 400, desc: "See who searches for you", category: "property" },
  { id: "kennel", name: "Kennel (Rottweilers)", icon: "🐕", cost: 600, desc: "Stop 15% physical attacks", category: "property" },
  { id: "laser_sensors", name: "Laser Sensors", icon: "🔴", cost: 600, desc: "Detect assassins before shot", category: "property" },
  { id: "quick_reno", name: "Quick Renovation", icon: "🔨", cost: 350, desc: "Complete property upgrades", category: "property" },
  { id: "security_fence", name: "Security Fence", icon: "🚗", cost: 400, desc: "-30% car theft from garage", category: "property" },
  { id: "padlock_premium", name: "Padlock (Premium)", icon: "🔒", cost: 600, desc: "Lock car, never stolen", category: "property" },
];

// ===== CATEGORY 6: STEALTH & SPY =====
export const stealthItems: PointsShopItem[] = [
  { id: "detective_shield", name: "Detective Shield", icon: "🕵️", cost: 600, desc: "Untrackable 2h", category: "stealth" },
  { id: "hidden_online", name: "Hidden Online", icon: "👻", cost: 350, desc: "Appear offline", category: "stealth" },
  { id: "witness_prot", name: "Witness Protection", icon: "👤", cost: 1500, desc: "Hidden 3 days", category: "stealth", tier: "epic" },
  { id: "false_trails", name: "False Trails", icon: "🗺️", cost: 500, desc: "Detectives see wrong city", category: "stealth" },
  { id: "fake_passport", name: "Fake Passport", icon: "📘", cost: 400, desc: "Invisible in airport logs", category: "stealth" },
  { id: "fake_ip", name: "Fake IP Address", icon: "🌐", cost: 350, desc: "Hide from cyber-attacks", category: "stealth" },
  { id: "fake_id_express", name: "Fake ID Express", icon: "🪪", cost: 300, desc: "Change identity instantly", category: "stealth" },
  { id: "anti_detector", name: "Anti-Detector Spray", icon: "🧴", cost: 500, desc: "No traces at crime scenes", category: "stealth" },
  { id: "jammer", name: "Electronic Jammer", icon: "📡", cost: 500, desc: "Phone untraceable 4h", category: "stealth" },
  { id: "tracking_bug", name: "Tracking Bug", icon: "🐛", cost: 300, desc: "Track target's movements", category: "stealth" },
  { id: "counter_espionage", name: "Counter-Espionage", icon: "🕵️", cost: 700, desc: "Expose and kill spies", category: "stealth" },
  { id: "confusing_rumors", name: "Confusing Rumors", icon: "📰", cost: 500, desc: "Search cost 3x", category: "stealth" },
  { id: "hide_wealth", name: "Hide Wealth", icon: "💰", cost: 300, desc: "Cash invisible to others", category: "stealth" },
  { id: "anti_bugging", name: "Anti-Bugging", icon: "🔍", cost: 250, desc: "Remove microphones", category: "stealth" },
  { id: "panic_button", name: "Panic Button", icon: "🆘", cost: 500, desc: "Auto-flee to random city", category: "stealth" },
];

// ===== CATEGORY 7: WEAPONS =====
export const weaponItems: PointsShopItem[] = [
  { id: "gold_ak47", name: "Gold AK47", icon: "🔫", cost: 1500, desc: "+10% damage", category: "weapons", tier: "epic" },
  { id: "rpg", name: "RPG", icon: "🚀", cost: 2000, desc: "+50% ATK", category: "weapons", tier: "epic" },
  { id: "sniper_50cal", name: "Sniper .50 Cal", icon: "🎯", cost: 1800, desc: "+45% ATK", category: "weapons", tier: "epic" },
  { id: "tommy_gun", name: "Tommy Gun", icon: "🔫", cost: 1200, desc: "+35% ATK", category: "weapons", tier: "rare" },
  { id: "c4_explosives", name: "C4 Explosives", icon: "💣", cost: 2500, desc: "+60% ATK", category: "weapons", tier: "epic" },
  { id: "m60", name: "M60 Machine Gun", icon: "🔫", cost: 2000, desc: "+50% ATK", category: "weapons", tier: "epic" },
  { id: "military_drone", name: "Military Drone", icon: "🛸", cost: 3000, desc: "+70% ATK", category: "weapons", tier: "legendary" },
  { id: "acid_rain", name: "Acid Rain Bomb", icon: "☢️", cost: 4000, desc: "+80% ATK", category: "weapons", tier: "legendary" },
  { id: "suppressed_sg", name: "Suppressed Shotgun", icon: "🔫", cost: 700, desc: "Damage + stealth", category: "weapons", tier: "rare" },
  { id: "gold_sg", name: "Gold Shotgun", icon: "🔫", cost: 1000, desc: "Exclusive weapon", category: "weapons", tier: "epic" },
  { id: "godfather_kill", name: "Godfather Assassination", icon: "👴", cost: 5000, desc: "Eliminate NPC boss", category: "weapons", tier: "legendary" },
  { id: "crossfire", name: "Crossfire Contract", icon: "💀", cost: 800, desc: "Hire AI gunmen", category: "weapons", tier: "rare" },
  { id: "thermite", name: "Thermite Charge", icon: "🔥", cost: 600, desc: "Melt steel gates", category: "weapons" },
  { id: "resin_bullets", name: "Resin Bullets", icon: "🔫", cost: 200, desc: "Reduce enemy escape", category: "weapons" },
  { id: "diamond_smuggle", name: "Diamond Smuggling", icon: "💎", cost: 350, desc: "Sell gems instantly", category: "weapons" },
];

// ===== CATEGORY 8: UTILITY & COOLDOWNS =====
export const utilityItems: PointsShopItem[] = [
  { id: "remove_cooldown", name: "Remove ALL Cooldowns", icon: "⏱️", cost: 500, desc: "Clear everything", category: "utility", tier: "epic" },
  { id: "clear_heist_cd", name: "Clear Heist CD", icon: "💣", cost: 200, desc: "Reset heist wait", category: "utility" },
  { id: "clear_car_cd", name: "Clear Car Theft CD", icon: "🚗", cost: 150, desc: "Steal new car now", category: "utility" },
  { id: "clear_assassin_cd", name: "Clear Assassination CD", icon: "🗡️", cost: 300, desc: "Ready for assassination", category: "utility" },
  { id: "clear_oc_cd", name: "Clear OC CD", icon: "🕵️", cost: 400, desc: "Start new gang heist", category: "utility" },
  { id: "clear_drug_cd", name: "Clear Drug CD", icon: "💊", cost: 250, desc: "Buy/sell drugs now", category: "utility" },
  { id: "clear_bank_cd", name: "Clear Bank CD", icon: "🏦", cost: 400, desc: "Ready for bank robbery", category: "utility" },
  { id: "clear_street_cd", name: "Clear Street Fight CD", icon: "🥊", cost: 150, desc: "Fight on street again", category: "utility" },
  { id: "clear_harbor_cd", name: "Clear Harbor CD", icon: "🚢", cost: 400, desc: "Rob container ship now", category: "utility" },
  { id: "reset_assassination", name: "Reset Assassination", icon: "🗡️", cost: 1000, desc: "Plan new assassination", category: "utility", tier: "epic" },
  { id: "teleportation", name: "Teleportation", icon: "🌀", cost: 800, desc: "Instant travel", category: "utility", tier: "legendary" },
  { id: "quick_laundering", name: "Quick Laundering", icon: "💵", cost: 300, desc: "Clean money instantly", category: "utility" },
  { id: "quick_production", name: "Quick Production", icon: "🏭", cost: 350, desc: "Complete factory batch", category: "utility" },
  { id: "express_research", name: "Express Research", icon: "🔬", cost: 400, desc: "Complete gang upgrade", category: "utility" },
  { id: "stock_market_cd", name: "Stock Market CD", icon: "📈", cost: 500, desc: "Unlimited trades/hour", category: "utility" },
  { id: "vip_flight", name: "VIP Flight Pass", icon: "✈️", cost: 800, desc: "Free flights 7 days", category: "utility", tier: "epic" },
];

// ===== CATEGORY 9: CASH & STATS =====
export const cashStatItems: PointsShopItem[] = [
  { id: "stat_20", name: "+20 ATK & DEF", icon: "💪", cost: 400, desc: "Permanent stat boost", category: "cashstats" },
  { id: "stat_50", name: "+50 ATK & DEF", icon: "💪", cost: 1000, desc: "Permanent stat boost", category: "cashstats" },
  { id: "stat_100", name: "+100 ATK & DEF", icon: "🔥", cost: 2500, desc: "Permanent stat boost", category: "cashstats", tier: "epic" },
  { id: "stat_250", name: "+250 ATK & DEF", icon: "⚡", cost: 6000, desc: "GODLIKE permanent", category: "cashstats", tier: "mythic" },
  { id: "level_skip_5", name: "+5 Levels", icon: "📈", cost: 800, desc: "Instant level skip", category: "cashstats" },
  { id: "level_skip_10", name: "+10 Levels", icon: "📈", cost: 1500, desc: "Instant mega level skip", category: "cashstats", tier: "epic" },
  { id: "cash_10m", name: "$10M Cash", icon: "💵", cost: 500, desc: "Instant cash injection", category: "cashstats" },
  { id: "cash_50m", name: "$50M Cash", icon: "💵", cost: 1500, desc: "Instant cash injection", category: "cashstats" },
  { id: "cash_100m", name: "$100M Cash", icon: "💵", cost: 3000, desc: "Instant cash injection", category: "cashstats", tier: "epic" },
  { id: "reputation_boost", name: "Reputation Boost", icon: "🌟", cost: 600, desc: "+50 reputation", category: "cashstats" },
];

// ===== CATEGORY 10: SPECIAL =====
export const specialItems: PointsShopItem[] = [
  { id: "mystery_box", name: "Mystery Box", icon: "🎁", cost: 300, desc: "100-5000 points back", category: "special" },
  { id: "crime_shield", name: "Crime Shield", icon: "🛡️", cost: 1000, desc: "Next crime cannot fail", category: "special", tier: "epic" },
  { id: "double_rewards", name: "Double Rewards", icon: "💰", cost: 2000, desc: "All rewards 2x for 1h", category: "special", tier: "legendary" },
  { id: "xp_guarantee", name: "XP Guarantee Token", icon: "🎫", cost: 500, desc: "Next crime double XP", category: "special" },
  { id: "cashInsurance", name: "Cash Insurance", icon: "🏦", cost: 800, desc: "Protect next $50M", category: "special" },
  { id: "level_protection", name: "Level Protection", icon: "📈", cost: 1500, desc: "Can't lose levels 24h", category: "special", tier: "epic" },
  { id: "title_unlock", name: "Title Unlock Token", icon: "🏆", cost: 1000, desc: "Unlock any title", category: "special" },
  { id: "garage_expand", name: "Garage Expansion", icon: "🏠", cost: 800, desc: "+5 garage slots", category: "special" },
  { id: "inventory_expand", name: "Inventory Expansion", icon: "📦", cost: 600, desc: "+10 inventory slots", category: "special" },
  { id: "godfather_blessing", name: "Godfather's Blessing", icon: "👴", cost: 10000, desc: "+100 ATK/DEF + invulnerable 48h", category: "special", tier: "mythic" },
];

// All items
export const allPointsShopItems: PointsShopItem[] = [
  ...boosterItems, ...healthItems, ...prisonItems, ...armorItems,
  ...propertyItems, ...stealthItems, ...weaponItems, ...utilityItems,
  ...cashStatItems, ...specialItems,
];

// Category metadata
export const categories = [
  { id: "boosters", name: "🚀 Boosters", icon: "🚀", color: "text-cyan-400", count: boosterItems.length },
  { id: "health", name: "❤️ Health", icon: "❤️", color: "text-red-400", count: healthItems.length },
  { id: "prison", name: "🔓 Prison & Law", icon: "🔓", color: "text-orange-400", count: prisonItems.length },
  { id: "armor", name: "🦺 Body Armor", icon: "🦺", color: "text-blue-400", count: armorItems.length },
  { id: "property", name: "🏰 Property", icon: "🏰", color: "text-yellow-400", count: propertyItems.length },
  { id: "stealth", name: "🕵️ Stealth", icon: "🕵️", color: "text-purple-400", count: stealthItems.length },
  { id: "weapons", name: "⚔️ Weapons", icon: "⚔️", color: "text-red-400", count: weaponItems.length },
  { id: "utility", name: "⏱️ Cooldowns", icon: "⏱️", color: "text-green-400", count: utilityItems.length },
  { id: "cashstats", name: "💰 Cash & Stats", icon: "💰", color: "text-yellow-400", count: cashStatItems.length },
  { id: "special", name: "✨ Special", icon: "✨", color: "text-pink-400", count: specialItems.length },
] as const;

// Helper to get items by category
export const getCategoryItems = (catId: string): PointsShopItem[] => {
  switch (catId) {
    case "boosters": return boosterItems;
    case "health": return healthItems;
    case "prison": return prisonItems;
    case "armor": return armorItems;
    case "property": return propertyItems;
    case "stealth": return stealthItems;
    case "weapons": return weaponItems;
    case "utility": return utilityItems;
    case "cashstats": return cashStatItems;
    case "special": return specialItems;
    default: return [];
  }
};

// Tier colors
export const tierColors: Record<string, string> = {
  common: "text-gray-400 border-gray-600",
  uncommon: "text-green-400 border-green-600",
  rare: "text-blue-400 border-blue-600",
  epic: "text-purple-400 border-purple-600",
  legendary: "text-yellow-400 border-yellow-600",
  mythic: "text-orange-400 border-orange-500",
};
