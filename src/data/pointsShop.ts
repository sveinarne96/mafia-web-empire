// ===== ULTIMATE POINTS SHOP DATA =====
// 95+ items across 4 categories

export interface PointsShopItem {
  id: string;
  name: string;
  icon: string;
  cost: number;
  desc: string;
  category: "cooldowns" | "defense" | "weapons" | "special";
  tier?: "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";
}

// ===== COOLDOWNS & UTILITY (25+ items) =====
export const cooldownItems: PointsShopItem[] = [
  { id: "quick_discharge", name: "Quick Discharge", icon: "🏥", cost: 150, desc: "Leave hospital immediately", category: "cooldowns" },
  { id: "bribe_guard", name: "Bribe Guard", icon: "🔓", cost: 250, desc: "Get out of prison immediately", category: "cooldowns" },
  { id: "bail_out_buddy", name: "Bail Out Buddy", icon: "👥", cost: 350, desc: "Get a gang member out of prison", category: "cooldowns" },
  { id: "clear_heist_cd", name: "Clear Heist Cooldown", icon: "💣", cost: 200, desc: "Reset heist wait time", category: "cooldowns" },
  { id: "clear_car_theft_cd", name: "Clear Car Theft Cooldown", icon: "🚗", cost: 150, desc: "Steal a new car immediately", category: "cooldowns" },
  { id: "clear_assassin_cd", name: "Clear Assassination Cooldown", icon: "🗡️", cost: 300, desc: "Ready for assassination attempt", category: "cooldowns" },
  { id: "clear_oc_cd", name: "Clear OC Cooldown", icon: "🕵️", cost: 400, desc: "Start new major gang heist", category: "cooldowns" },
  { id: "emergency_medicine", name: "Emergency Medicine", icon: "💊", cost: 100, desc: "Restore 100% health immediately", category: "cooldowns" },
  { id: "nurse_vip", name: "Nurse VIP", icon: "👩‍⚕️", cost: 500, desc: "Halve all hospital stays for 24h", category: "cooldowns", tier: "epic" },
  { id: "lawyer_speed_dial", name: "Lawyer on Speed Dial", icon: "⚖️", cost: 600, desc: "Auto-avoid prison for 3h", category: "cooldowns", tier: "epic" },
  { id: "faster_travel", name: "Faster Travel", icon: "✈️", cost: 200, desc: "Halve travel time between cities", category: "cooldowns" },
  { id: "teleportation", name: "Teleportation", icon: "🌀", cost: 800, desc: "Travel to another city instantly", category: "cooldowns", tier: "legendary" },
  { id: "clear_drug_cd", name: "Clear Drug Smuggling Cooldown", icon: "💊", cost: 250, desc: "Buy/sell drugs without waiting", category: "cooldowns" },
  { id: "super_adrenaline", name: "Super Adrenaline", icon: "💉", cost: 400, desc: "Ignore debuffs for 1 hour", category: "cooldowns", tier: "rare" },
  { id: "quick_laundering", name: "Quick Money Laundering", icon: "💵", cost: 300, desc: "Skip laundering wait time", category: "cooldowns" },
  { id: "quick_production", name: "Quick Production", icon: "🏭", cost: 350, desc: "Complete bullet factory batch now", category: "cooldowns" },
  { id: "express_research", name: "Express Research", icon: "🔬", cost: 400, desc: "Complete gang upgrade instantly", category: "cooldowns" },
  { id: "clear_escape_cd", name: "Clear Escape Cooldown", icon: "🏃", cost: 200, desc: "Ready to flee police again", category: "cooldowns" },
  { id: "top_lawyer", name: "Top Lawyer Package", icon: "👔", cost: 1500, desc: "Reduce buddies' prison time 80% for 12h", category: "cooldowns", tier: "legendary" },
  { id: "medical_vip", name: "Medical VIP Pass", icon: "🏥", cost: 2000, desc: "Permanent 10% faster HP regen", category: "cooldowns", tier: "mythic" },
  { id: "bribery_discount", name: "Bribery Discount", icon: "💰", cost: 300, desc: "20% cheaper bailouts for 5 times", category: "cooldowns", tier: "rare" },
  { id: "quick_training", name: "Quick Training", icon: "🏋️", cost: 150, desc: "Skip gym waiting time", category: "cooldowns" },
  { id: "remove_cooldown", name: "Remove Cooldown", icon: "⏱️", cost: 500, desc: "Clear ALL active cooldowns", category: "cooldowns", tier: "epic" },
  { id: "fake_license", name: "Fake License Plates", icon: "🔢", cost: 400, desc: "Getaway car untraceable by police", category: "cooldowns", tier: "rare" },
  { id: "secret_tunnel", name: "Secret Tunnel", icon: "🕳️", cost: 1200, desc: "100% escape chance if house stormed", category: "cooldowns", tier: "legendary" },
];

// ===== DEFENSE & PROTECTION (30+ items) =====
export const defenseItems: PointsShopItem[] = [
  { id: "anti_bugging", name: "Anti-Bugging", icon: "🔍", cost: 250, desc: "Remove planted microphones", category: "defense" },
  { id: "gas_mask", name: "Gas Mask", icon: "😷", cost: 300, desc: "Protect from tear gas/chemical attacks", category: "defense" },
  { id: "security_detail", name: "Security Detail", icon: "💂", cost: 800, desc: "Hire external guards for 12h", category: "defense", tier: "rare" },
  { id: "bulletproof_briefcase", name: "Bulletproof Briefcase", icon: "💼", cost: 400, desc: "Protect items during transport", category: "defense" },
  { id: "hidden_stash", name: "Hidden Stash", icon: "📦", cost: 350, desc: "Hide items from police raids", category: "defense" },
  { id: "anti_bounty", name: "Anti-Bounty Shield", icon: "🛡️", cost: 1000, desc: "No bounties on you for 24h", category: "defense", tier: "epic" },
  { id: "brothel_guards", name: "Brothel Guards", icon: "🏠", cost: 500, desc: "Protect pleasure houses from rivals", category: "defense" },
  { id: "corrupt_judge", name: "Corrupt Judge", icon: "⚖️", cost: 1500, desc: "Permanently reduce prison sentence 5%", category: "defense", tier: "legendary" },
  { id: "fake_accounting", name: "Fake Accounting Books", icon: "📒", cost: 600, desc: "Hide illicit funds from tax raids", category: "defense", tier: "rare" },
  { id: "hq_shield", name: "Headquarters Shield", icon: "🏰", cost: 1200, desc: "Gang base invulnerable for 2h", category: "defense", tier: "epic" },
  { id: "vest_l2", name: "Bulletproof Vest (Level 2)", icon: "🦺", cost: 500, desc: "Absorbs 1,200 bullets in combat", category: "defense", tier: "rare" },
  { id: "tactical_shield", name: "Tactical Shield", icon: "🛡️", cost: 700, desc: "Block first 3 shots in duel", category: "defense", tier: "rare" },
  { id: "fake_will", name: "Fake Will", icon: "📜", cost: 2000, desc: "Gang keeps properties if you die", category: "defense", tier: "legendary" },
  { id: "bodyguard_training", name: "Bodyguard Training", icon: "💪", cost: 800, desc: "Bodyguards 15% more effective", category: "defense" },
  { id: "panic_room", name: "Panic Room", icon: "🚪", cost: 1000, desc: "5 min log-in buffer if attacked offline", category: "defense", tier: "epic" },
  { id: "cryptophone", name: "Cryptophone", icon: "📱", cost: 500, desc: "All messages encrypted, cannot forward", category: "defense" },
  { id: "sabotage_shield", name: "Sabotage Shield", icon: "🔧", cost: 700, desc: "Protect businesses from sabotage 48h", category: "defense" },
  { id: "vest_l3", name: "Bulletproof Vest (Level 3)", icon: "🦺", cost: 1200, desc: "Absorbs 3,000 bullets", category: "defense", tier: "epic" },
  { id: "hidden_account", name: "Hidden Account", icon: "🏦", cost: 2500, desc: "Money abroad, never confiscated", category: "defense", tier: "legendary" },
  { id: "anti_kidnap_gps", name: "Anti-Kidnapping GPS", icon: "📍", cost: 600, desc: "Alerts gang if kidnapped", category: "defense" },
  { id: "bribe_customs", name: "Bribeable Customs", icon: "🛃", cost: 400, desc: "Contraband not seized at border", category: "defense" },
  { id: "night_patrol", name: "Night Patrol", icon: "🌙", cost: 500, desc: "Increased defenses at night (00-06)", category: "defense" },
  { id: "armored_transport", name: "Armored Cash Transport", icon: "🚛", cost: 800, desc: "Money transfers protected from robbery", category: "defense" },
  { id: "vest_titanium", name: "Bulletproof Vest (Titanium)", icon: "🦺", cost: 3000, desc: "Absorbs 5,000 bullets", category: "defense", tier: "legendary" },
  { id: "pre_bail", name: "Pre-Purchased Bail", icon: "💰", cost: 1500, desc: "Auto-release next arrest", category: "defense", tier: "epic" },
  { id: "fake_death", name: "Fake Death Certificate", icon: "💀", cost: 2000, desc: "Appear dead for 1h, fool enemies", category: "defense", tier: "legendary" },
  { id: "security_fence", name: "Security Fence", icon: "🚗", cost: 400, desc: "30% less car theft from garage", category: "defense" },
  { id: "padlock_premium", name: "Padlock (Premium)", icon: "🔒", cost: 600, desc: "Lock car so it can never be stolen", category: "defense" },
  { id: "anti_detector", name: "Anti-Detector Spray", icon: "🧴", cost: 500, desc: "No biological traces at crime scenes", category: "defense" },
  { id: "corrupt_fbi", name: "Corrupt FBI Agent", icon: "🕵️", cost: 2500, desc: "Raid warning 5 minutes before", category: "defense", tier: "legendary" },
  { id: "artillery_shield", name: "Heavy Artillery Shield", icon: "💣", cost: 800, desc: "40% less grenade/rocket damage", category: "defense" },
  { id: "shielded_ip", name: "Shielded IP Network", icon: "🌐", cost: 600, desc: "Protect bot farm from shutdown", category: "defense" },
  { id: "escape_moto", name: "Escape Motorcycle", icon: "🏍️", cost: 700, desc: "90% street escape chance", category: "defense", tier: "rare" },
  { id: "vest_ceramic", name: "Bulletproof Vest (Ceramic)", icon: "🦺", cost: 2000, desc: "Absorbs 4,000 bullets", category: "defense", tier: "epic" },
  { id: "body_armor_car", name: "Body Armor (Vehicle)", icon: "🚗", cost: 1000, desc: "Getaway car crash-proof", category: "defense" },
  { id: "infiltration_alerts", name: "Infiltration Alerts", icon: "🚨", cost: 500, desc: "Know if someone hacks gang forum", category: "defense" },
  { id: "witness_bribe", name: "Witness Bribe", icon: "👤", cost: 400, desc: "Remove all failed assassination witnesses", category: "defense" },
  { id: "godfather_blessing", name: "Godfather's Blessing", icon: "👴", cost: 10000, desc: "Total invulnerability 48h (1x/season)", category: "defense", tier: "mythic" },
];

// ===== WEAPONS & AMMO (35+ items) =====
export const weaponItems: PointsShopItem[] = [
  { id: "bullet_pack_small", name: "Bullet Pack (Small)", icon: "🔫", cost: 100, desc: "500 bullets", category: "weapons" },
  { id: "bullet_pack_medium", name: "Bullet Pack (Medium)", icon: "🔫", cost: 250, desc: "2,500 bullets", category: "weapons" },
  { id: "bullet_pack_large", name: "Bullet Pack (Large)", icon: "🔫", cost: 500, desc: "10,000 bullets", category: "weapons", tier: "rare" },
  { id: "gold_ak47", name: "Gold AK47", icon: "🔫", cost: 1500, desc: "+10% damage over standard", category: "weapons", tier: "epic" },
  { id: "silencer", name: "Silencer", icon: "🤫", cost: 400, desc: "50% less detection chance", category: "weapons" },
  { id: "laser_sight", name: "Laser Sight", icon: "🔴", cost: 350, desc: "+15% accuracy", category: "weapons" },
  { id: "extended_mag", name: "Extended Magazine", icon: "📦", cost: 300, desc: "+20% bullets per volley", category: "weapons" },
  { id: "hollow_point", name: "Hollow Point Bullets", icon: "💥", cost: 500, desc: "+20% damage to unarmored targets", category: "weapons" },
  { id: "armor_piercing", name: "Armor-Piercing Bullets", icon: "🎯", cost: 700, desc: "Ignores 30% of body armor", category: "weapons", tier: "rare" },
  { id: "hand_grenade", name: "Hand Grenade", icon: "💣", cost: 600, desc: "Damage multiple bodyguards", category: "weapons" },
  { id: "rpg", name: "RPG (Rocket Launcher)", icon: "🚀", cost: 2000, desc: "Destroy armored vehicles/property", category: "weapons", tier: "epic" },
  { id: "sniper_50cal", name: "Sniper Rifle (.50 Cal)", icon: "🎯", cost: 1800, desc: "Hit players in cover/safehouses", category: "weapons", tier: "epic" },
  { id: "tommy_gun", name: "Tommy Gun (Classic)", icon: "🔫", cost: 1200, desc: "High rate of fire, exclusive mafia", category: "weapons", tier: "rare" },
  { id: "molotov", name: "Molotov Cocktail", icon: "🔥", cost: 400, desc: "Set rival businesses on fire, DoT", category: "weapons" },
  { id: "nerve_gas", name: "Nerve Gas", icon: "☠️", cost: 800, desc: "Force player out of cover", category: "weapons", tier: "rare" },
  { id: "gold_knife", name: "Gold Knife", icon: "🗡️", cost: 600, desc: "+200% melee damage", category: "weapons" },
  { id: "flamethrower", name: "Flamethrower", icon: "🔥", cost: 1500, desc: "Burn down bullet factories", category: "weapons", tier: "epic" },
  { id: "smart_bullets", name: "Smart Bullets", icon: "🤖", cost: 1000, desc: "+30% accuracy, seek targets", category: "weapons", tier: "rare" },
  { id: "desert_eagle", name: "Desert Eagle (Chrome)", icon: "🔫", cost: 900, desc: "High critical hit chance", category: "weapons" },
  { id: "dual_uzis", name: "Dual Uzis", icon: "🔫", cost: 1100, desc: "Fire two weapons simultaneously", category: "weapons", tier: "rare" },
  { id: "c4_explosives", name: "C4 Explosives", icon: "💣", cost: 2500, desc: "Blow up HQ or bank vaults", category: "weapons", tier: "epic" },
  { id: "gas_grenade", name: "Gas Grenade", icon: "💨", cost: 700, desc: "Incapacitate bodyguards for 2 rounds", category: "weapons" },
  { id: "brass_knuckles_steel", name: "Brass Knuckles (Steel)", icon: "👊", cost: 300, desc: "Increase underground boxing damage", category: "weapons" },
  { id: "chemical_bullets", name: "Chemical Bullets", icon: "☠️", cost: 800, desc: "Poison target, DoT after fight", category: "weapons" },
  { id: "tire_iron_gold", name: "Tire Iron (Gold)", icon: "🔨", cost: 200, desc: "Classic extortion/vandalism weapon", category: "weapons" },
  { id: "sawed_off", name: "Shotgun (Sawed-off)", icon: "🔫", cost: 700, desc: "Extreme close range damage", category: "weapons" },
  { id: "m60", name: "M60 Machine Gun", icon: "🔫", cost: 2000, desc: "High ammo use, eliminates bodyguards fast", category: "weapons", tier: "epic" },
  { id: "stun_gun", name: "Stun Gun (Taser)", icon: "⚡", cost: 400, desc: "Disable opponent without killing", category: "weapons" },
  { id: "dynamite", name: "Stick of Dynamite", icon: "🧨", cost: 250, desc: "Cheap explosive for small businesses", category: "weapons" },
  { id: "throwing_knives", name: "Throwing Knives", icon: "🗡️", cost: 350, desc: "Silent, no alarm triggered", category: "weapons" },
  { id: "military_drone", name: "Military Drone", icon: "🛸", cost: 3000, desc: "Spy on or bomb player locations", category: "weapons", tier: "legendary" },
  { id: "digital_virus", name: "Digital Virus", icon: "💻", cost: 1500, desc: "Wipe rival's bullet stockpile", category: "weapons", tier: "epic" },
  { id: "gold_bullets", name: "Gold Bullets", icon: "✨", cost: 500, desc: "Unique kill log mark (cosmetic)", category: "weapons" },
  { id: "arsonist_kit", name: "Arsonist Kit", icon: "🔥", cost: 800, desc: "+50% property fire damage", category: "weapons" },
  { id: "acid_rain", name: "Acid Rain Bomb", icon: "☢️", cost: 4000, desc: "Destroy entire gang city defenses", category: "weapons", tier: "legendary" },
];

// ===== SPECIAL ITEMS =====
export const specialItems: PointsShopItem[] = [
  { id: "xp_guarantee", name: "XP Guarantee Token", icon: "🎫", cost: 500, desc: "Next crime gives double XP guaranteed", category: "special" },
  { id: "cashInsurance", name: "Cash Insurance", icon: "🏦", cost: 800, desc: "Protect next $50M from loss", category: "special", tier: "rare" },
  { id: "crime_shield", name: "Crime Shield", icon: "🛡️", cost: 1000, desc: "Next crime cannot fail", category: "special", tier: "epic" },
  { id: "level_protection", name: "Level Protection", icon: "📈", cost: 1500, desc: "Can't lose levels for 24h", category: "special", tier: "epic" },
  { id: "double_rewards", name: "Double Rewards Token", icon: "💰", cost: 2000, desc: "Double all rewards for 1 hour", category: "special", tier: "legendary" },
  { id: "mystery_box", name: "Mystery Box", icon: "🎁", cost: 300, desc: "Random reward: 100-5000 points back", category: "special" },
  { id: "reputation_boost", name: "Reputation Boost", icon: "🌟", cost: 600, desc: "+50 reputation instantly", category: "special" },
  { id: "title_unlock", name: "Title Unlock Token", icon: "🏆", cost: 1000, desc: "Unlock any available title", category: "special", tier: "rare" },
  { id: "garage_expand", name: "Garage Expansion", icon: "🏠", cost: 800, desc: "+5 garage slots permanently", category: "special" },
  { id: "inventory_expand", name: "Inventory Expansion", icon: "📦", cost: 600, desc: "+10 inventory slots permanently", category: "special" },
];

// All items combined
export const allPointsShopItems: PointsShopItem[] = [
  ...cooldownItems,
  ...defenseItems,
  ...weaponItems,
  ...specialItems,
];

// Category metadata
export const categories = [
  { id: "cooldowns", name: "⏱️ Cooldowns & Utility", icon: "⏱️", color: "text-cyan-400", count: cooldownItems.length },
  { id: "defense", name: "🛡️ Defense & Protection", icon: "🛡️", color: "text-blue-400", count: defenseItems.length },
  { id: "weapons", name: "⚔️ Weapons & Ammo", icon: "⚔️", color: "text-red-400", count: weaponItems.length },
  { id: "special", name: "✨ Special Items", icon: "✨", color: "text-purple-400", count: specialItems.length },
] as const;

// Tier colors
export const tierColors: Record<string, string> = {
  common: "text-gray-400 border-gray-600",
  uncommon: "text-green-400 border-green-600",
  rare: "text-blue-400 border-blue-600",
  epic: "text-purple-400 border-purple-600",
  legendary: "text-yellow-400 border-yellow-600",
  mythic: "text-orange-400 border-orange-500",
};
