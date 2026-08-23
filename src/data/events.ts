export interface WorldEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: "crime" | "combat" | "social" | "special" | "gambling" | "seasonal";
  duration: number;
  rewards: { money: number; xp: number; items?: string[] };
  requirements: { level?: number; crimes?: number; kills?: number };
  multiplier: number;
}

export const worldEvents: WorldEvent[] = [
  // === XP EVENTS ===
  { id: "double_xp", name: "Double XP Weekend", description: "2x XP on ALL actions. Grind hard!", icon: "⚡", type: "special", duration: 48, rewards: { money: 0, xp: 0 }, requirements: {}, multiplier: 2.0 },
  { id: "triple_xp", name: "Triple XP Weekend", description: "3x XP on everything. Level up fast!", icon: "⚡⚡", type: "special", duration: 48, rewards: { money: 0, xp: 0 }, requirements: { level: 10 }, multiplier: 3.0 },
  { id: "mega_xp", name: "50x XP Event", description: "50x XP for 1 hour. INSANE levels!", icon: "🔥🔥🔥", type: "special", duration: 1, rewards: { money: 0, xp: 0 }, requirements: { level: 25 }, multiplier: 50.0 },
  { id: "prestige_rush", name: "Prestige Rush", description: "10x XP to help you reach prestige!", icon: "⭐", type: "special", duration: 24, rewards: { money: 0, xp: 0 }, requirements: { level: 40 }, multiplier: 10.0 },

  // === CASH EVENTS ===
  { id: "double_cash", name: "Double Cash Weekend", description: "2x money on all crimes and heists!", icon: "💵💵", type: "crime", duration: 48, rewards: { money: 0, xp: 0 }, requirements: {}, multiplier: 2.0 },
  { id: "triple_cash", name: "Triple Cash Event", description: "3x money for 24 hours!", icon: "💰💰💰", type: "crime", duration: 24, rewards: { money: 0, xp: 0 }, requirements: { level: 5 }, multiplier: 3.0 },
  { id: "cash_rain", name: "Cash Rain", description: "$50K bonus every 30 minutes for all online players!", icon: "💸", type: "special", duration: 6, rewards: { money: 50000, xp: 0 }, requirements: {}, multiplier: 1.0 },

  // === CRIME EVENTS ===
  { id: "crime_frenzy", name: "Crime Frenzy", description: "All crime rewards +200%. Go wild!", icon: "🔥", type: "crime", duration: 12, rewards: { money: 0, xp: 0 }, requirements: {}, multiplier: 3.0 },
  { id: "diamond_rush", name: "Diamond Rush", description: "Jewelry heists pay 5x! diamonds everywhere!", icon: "💎", type: "crime", duration: 6, rewards: { money: 0, xp: 0 }, requirements: { level: 8 }, multiplier: 5.0 },
  { id: "black_market_sale", name: "Black Market Sale", description: "All black market items 50% off!", icon: "🖤", type: "special", duration: 12, rewards: { money: 0, xp: 0 }, requirements: {}, multiplier: 1.0 },
  { id: "grand_heist", name: "Grand Heist", description: "Special heist event. 10x rewards on bank heists!", icon: "🏦", type: "crime", duration: 8, rewards: { money: 0, xp: 0 }, requirements: { level: 15 }, multiplier: 10.0 },

  // === COMBAT EVENTS ===
  { id: "kill_free_zone", name: "Kill Free Zone", description: "No wanted level for kills! Hunt freely!", icon: "☠️", type: "combat", duration: 4, rewards: { money: 0, xp: 0 }, requirements: {}, multiplier: 1.0 },
  { id: "blood_moon", name: "Blood Moon", description: "All combat damage doubled. Kills give 5x XP!", icon: "🌑", type: "combat", duration: 6, rewards: { money: 0, xp: 0 }, requirements: { kills: 5 }, multiplier: 5.0 },
  { id: "robbers_moon", name: "Robber's Moon", description: "Full moon = all crimes have 20% better success rate!", icon: "🌙", type: "crime", duration: 12, rewards: { money: 0, xp: 0 }, requirements: {}, multiplier: 1.2 },

  // === GAMBLING EVENTS ===
  { id: "lucky_hour", name: "Lucky Hour", description: "All gambling wins pay 3x!", icon: "🍀", type: "gambling", duration: 1, rewards: { money: 0, xp: 0 }, requirements: {}, multiplier: 3.0 },
  { id: "jackpot_hour", name: "Jackpot Hour", description: "Slots jackpot chance 5x higher!", icon: "🎰", type: "gambling", duration: 1, rewards: { money: 0, xp: 0 }, requirements: {}, multiplier: 5.0 },
  { id: "gambling_marathon", name: "Gambling Marathon", description: "24 hours of boosted gambling rewards!", icon: "🃏", type: "gambling", duration: 24, rewards: { money: 0, xp: 0 }, requirements: {}, multiplier: 2.0 },

  // === WEATHER/SEASONAL ===
  { id: "heatwave", name: "Heatwave", description: "Temperature rising! Street crimes +50% reward!", icon: "☀️", type: "crime", duration: 8, rewards: { money: 0, xp: 0 }, requirements: {}, multiplier: 1.5 },
  { id: "thunderstorm", name: "Thunderstorm", description: "Power outages = heists easier! -20% crime risk!", icon: "⛈️", type: "crime", duration: 6, rewards: { money: 0, xp: 0 }, requirements: {}, multiplier: 1.0 },

  // === SPECIAL/HOLIDAY EVENTS ===
  { id: "purge_night", name: "Purge Night", description: "24 hours of lawlessness. No police. Maximum chaos!", icon: "💀", type: "special", duration: 24, rewards: { money: 0, xp: 0 }, requirements: { level: 10 }, multiplier: 4.0 },
  { id: "golden_hour", name: "Golden Hour", description: "1 hour of 5x rewards on ALL actions!", icon: "✨", type: "special", duration: 1, rewards: { money: 0, xp: 0 }, requirements: {}, multiplier: 5.0 },
  { id: "weekend_boost", name: "Weekend Boost", description: "+1-10 bonus points on all actions!", icon: "🎉", type: "special", duration: 48, rewards: { money: 0, xp: 0 }, requirements: {}, multiplier: 1.0 },
  { id: "new_years_heist", name: "New Year's Heist", description: "Special New Year event! Fireworks + heists!", icon: "🎆", type: "seasonal", duration: 24, rewards: { money: 100000, xp: 500 }, requirements: { level: 5 }, multiplier: 3.0 },
  { id: "valentines_crime", name: "Valentine's Crime", description: "Crime of passion! Romance scams +5x payout!", icon: "❤️", type: "seasonal", duration: 48, rewards: { money: 0, xp: 0 }, requirements: {}, multiplier: 5.0 },
  { id: "st_patricks_gold", name: "St. Patrick's Gold", description: "Gold rush! All rewards have gold bonus +100%!", icon: "☘️", type: "seasonal", duration: 48, rewards: { money: 0, xp: 0 }, requirements: {}, multiplier: 2.0 },
  { id: "halloween_horror", name: "Halloween Horror", description: "Spooky crimes pay 3x! Ghost mode free!", icon: "🎃", type: "seasonal", duration: 72, rewards: { money: 0, xp: 0 }, requirements: {}, multiplier: 3.0 },
  { id: "christmas_heist", name: "Christmas Heist", description: "Steal presents from Santa! Legendary loot!", icon: "🎄", type: "seasonal", duration: 72, rewards: { money: 50000, xp: 1000 }, requirements: {}, multiplier: 2.0 },
  { id: "cyber_monday", name: "Cyber Monday", description: "Hacking skills +5x. Digital crimes boosted!", icon: "💻", type: "seasonal", duration: 24, rewards: { money: 0, xp: 0 }, requirements: { level: 10 }, multiplier: 5.0 },
  { id: "easter_egg_hunt", name: "Easter Egg Hunt", description: "Find hidden eggs across cities for prizes!", icon: "🥚", type: "seasonal", duration: 48, rewards: { money: 25000, xp: 200 }, requirements: {}, multiplier: 1.0 },

  // === MORE EVENTS ===
  { id: "underground_tournament", name: "Underground Tournament", description: "Fight club tournament! Winner takes $500K!", icon: "🏆", type: "combat", duration: 8, rewards: { money: 500000, xp: 1000 }, requirements: { kills: 10 }, multiplier: 3.0 },
  { id: "smuggling_rush", name: "Smuggling Rush", description: "Borders are open! Smuggling 3x profit!", icon: "🚢", type: "crime", duration: 16, rewards: { money: 0, xp: 0 }, requirements: { level: 8 }, multiplier: 3.0 },
  { id: "informant_network", name: "Informant Network Active", description: "Tips flowing! All crime success +30%!", icon: "🕵️", type: "crime", duration: 10, rewards: { money: 0, xp: 0 }, requirements: {}, multiplier: 1.3 },
  { id: "rival_family_war", name: "Rival Family War", description: "Family wars give 5x reputation!", icon: "⚔️", type: "combat", duration: 36, rewards: { money: 0, xp: 0 }, requirements: { kills: 25 }, multiplier: 5.0 },
  { id: "gang_territory_clash", name: "Gang Territory Clash", description: "Fight for territory! +300% income!", icon: "🏘️", type: "crime", duration: 24, rewards: { money: 0, xp: 0 }, requirements: { level: 6 }, multiplier: 3.0 },
  { id: "police_crackdown", name: "Police Crackdown", description: "Cops everywhere! Crime risk doubled but 4x rewards!", icon: "🚔", type: "crime", duration: 6, rewards: { money: 0, xp: 0 }, requirements: { level: 10 }, multiplier: 4.0 },
  { id: "money_laundering_surge", name: "Money Laundering Surge", description: "Dirty money flowing! Laundering 3x capacity!", icon: "💵", type: "crime", duration: 18, rewards: { money: 0, xp: 0 }, requirements: { level: 7 }, multiplier: 3.0 },
];

export function getEventTypeColor(type: string): string {
  switch (type) {
    case "crime": return "text-red-400";
    case "combat": return "text-orange-400";
    case "social": return "text-blue-400";
    case "special": return "text-purple-400";
    case "gambling": return "text-yellow-400";
    case "seasonal": return "text-green-400";
    default: return "text-gray-400";
  }
}

export function getEventTypeBg(type: string): string {
  switch (type) {
    case "crime": return "bg-red-950/30 border-red-800/50";
    case "combat": return "bg-orange-950/30 border-orange-800/50";
    case "social": return "bg-blue-950/30 border-blue-800/50";
    case "special": return "bg-purple-950/30 border-purple-800/50";
    case "gambling": return "bg-yellow-950/30 border-yellow-800/50";
    case "seasonal": return "bg-green-950/30 border-green-800/50";
    default: return "bg-gray-950/30 border-gray-800/50";
  }
}
