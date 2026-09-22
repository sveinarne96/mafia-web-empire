// Shared event catalog — single source of truth for all game events
export interface GameEvent {
  id: string;
  name: string;
  icon: string;
  category: "seasonal" | "server" | "xp" | "cash" | "crime" | "gambling" | "special" | "live";
  desc: string;
  boost: string;
  color: string;
}

export const ALL_GAME_EVENTS: GameEvent[] = [
  // === SEASONAL ===
  { id: "evt_newyear", name: "New Year's Heist", icon: "🎆", category: "seasonal", desc: "Fireworks + heists!", boost: "3x rewards", color: "#f59e0b" },
  { id: "evt_valentine", name: "Valentine's Crime", icon: "❤️", category: "seasonal", desc: "Crime of passion!", boost: "Romance scams +5x", color: "#ec4899" },
  { id: "evt_patricks", name: "St. Patrick's Gold", icon: "☘️", category: "seasonal", desc: "Gold rush bonus!", boost: "+100% gold", color: "#22c55e" },
  { id: "evt_easter", name: "Easter Egg Hunt", icon: "🥚", category: "seasonal", desc: "Find hidden prizes!", boost: "Hidden loot", color: "#a855f7" },
  { id: "evt_summer", name: "Summer Crime Wave", icon: "☀️", category: "seasonal", desc: "All crimes boosted!", boost: "+50% XP", color: "#f97316" },
  { id: "evt_halloween", name: "Halloween Horror", icon: "🎃", category: "seasonal", desc: "3x spooky payouts!", boost: "3x rewards", color: "#f97316" },
  { id: "evt_christmas", name: "Christmas Heist", icon: "🎄", category: "seasonal", desc: "Legendary loot!", boost: "Legendary drops", color: "#22c55e" },
  { id: "evt_cyber", name: "Cyber Monday", icon: "💻", category: "seasonal", desc: "Hacking +5x!", boost: "5x digital crimes", color: "#3b82f6" },
  { id: "evt_blackfriday", name: "Black Friday Heist", icon: "🛒", category: "seasonal", desc: "Steal the deals!", boost: "2x robbery", color: "#6b7280" },
  { id: "evt_tax", name: "Tax Season Scam", icon: "📋", category: "seasonal", desc: "Tax fraud bonanza!", boost: "10x fraud", color: "#eab308" },
  { id: "evt_spring", name: "Spring Break Crime", icon: "🌸", category: "seasonal", desc: "Party + crime!", boost: "+75% XP", color: "#ec4899" },
  { id: "evt_winter", name: "Winter Wonderland", icon: "❄️", category: "seasonal", desc: "Cold cash bonus!", boost: "2x smuggling", color: "#06b6d4" },

  // === SERVER ===
  { id: "evt_purge", name: "Purge Night", icon: "💀", category: "server", desc: "24h lawlessness!", boost: "No wanted level", color: "#ef4444" },
  { id: "evt_bloodmoon", name: "Blood Moon", icon: "🌑", category: "server", desc: "Combat boost!", boost: "+100% ATK", color: "#dc2626" },
  { id: "evt_robbersmoon", name: "Robber's Moon", icon: "🌙", category: "server", desc: "Crime +20% success!", boost: "+20% success", color: "#a3a3a3" },
  { id: "evt_fullmoon", name: "Full Moon", icon: "🌕", category: "server", desc: "ALL boosts active!", boost: "Everything +50%", color: "#fbbf24" },
  { id: "evt_grandheist", name: "Grand Heist", icon: "🏦", category: "server", desc: "10x bank heist!", boost: "10x bank rewards", color: "#22c55e" },
  { id: "evt_tournament", name: "Tournament", icon: "🏆", category: "server", desc: "PvP tournament!", boost: "PvP prizes", color: "#f59e0b" },
  { id: "evt_familywar", name: "Family War Week", icon: "⚔️", category: "server", desc: "5x reputation!", boost: "5x rep gain", color: "#ef4444" },
  { id: "evt_territory", name: "Territory Takeover", icon: "📍", category: "server", desc: "+300% income!", boost: "3x territory", color: "#3b82f6" },
  { id: "evt_underground", name: "Underground Champ", icon: "💣", category: "server", desc: "Fighting tournament!", boost: "Fight prizes", color: "#6b7280" },
  { id: "evt_empire", name: "Crime Empire Week", icon: "👑", category: "server", desc: "5x empire reward!", boost: "5x empire", color: "#f59e0b" },

  // === XP ===
  { id: "evt_double_xp", name: "Double XP Weekend", icon: "⭐", category: "xp", desc: "2x XP on all!", boost: "2x XP", color: "#fbbf24" },
  { id: "evt_triple_xp", name: "Triple XP Weekend", icon: "🌟", category: "xp", desc: "3x XP on all!", boost: "3x XP", color: "#fbbf24" },
  { id: "evt_50x_xp", name: "50x XP Event", icon: "💫", category: "xp", desc: "50x XP insane!", boost: "50x XP", color: "#a855f7" },

  // === CASH ===
  { id: "evt_double_cash", name: "Double Cash Weekend", icon: "💰", category: "cash", desc: "2x cash on all!", boost: "2x Cash", color: "#22c55e" },
  { id: "evt_triple_cash", name: "Triple Cash Event", icon: "💎", category: "cash", desc: "3x cash on all!", boost: "3x Cash", color: "#06b6d4" },
  { id: "evt_cash_rain", name: "Cash Rain", icon: "🌧️", category: "cash", desc: "Money falls from sky!", boost: "Bonus cash", color: "#22c55e" },

  // === CRIME ===
  { id: "evt_heatwave", name: "Heatwave", icon: "🔥", category: "crime", desc: "Crime XP boost!", boost: "+100% crime XP", color: "#ef4444" },
  { id: "evt_thunderstorm", name: "Thunderstorm", icon: "⛈️", category: "crime", desc: "Smuggling +50%!", boost: "+50% smuggling", color: "#6366f1" },
  { id: "evt_crime_frenzy", name: "Crime Frenzy", icon: "🌀", category: "crime", desc: "All crimes +100% XP!", boost: "2x crime XP", color: "#ec4899" },
  { id: "evt_diamond_rush", name: "Diamond Rush", icon: "💎", category: "crime", desc: "Rare items everywhere!", boost: "Rare drops", color: "#06b6d4" },
  { id: "evt_black_market_sale", name: "Black Market Sale", icon: "🖤", category: "crime", desc: "50% off black market!", boost: "50% discount", color: "#6b7280" },

  // === GAMBLING ===
  { id: "evt_lucky_hour", name: "Lucky Hour", icon: "🍀", category: "gambling", desc: "Gambling +50% luck!", boost: "+50% luck", color: "#22c55e" },
  { id: "evt_jackpot_hour", name: "Jackpot Hour", icon: "🎰", category: "gambling", desc: "Slots jackpot +10x!", boost: "10x jackpot", color: "#f59e0b" },
  { id: "evt_gambling_marathon", name: "Gambling Marathon", icon: "🎲", category: "gambling", desc: "Non-stop gambling!", boost: "No cooldown", color: "#a855f7" },

  // === SPECIAL ===
  { id: "evt_prestige_rush", name: "Prestige Rush", icon: "✨", category: "special", desc: "2x prestige points!", boost: "2x prestige", color: "#fbbf24" },
  { id: "evt_kill_free_zone", name: "Kill Free Zone", icon: "☠️", category: "special", desc: "No wanted for kills!", boost: "No wanted", color: "#ef4444" },
  { id: "evt_golden_hour", name: "Golden Hour", icon: "🌅", category: "special", desc: "All rewards golden!", boost: "2x everything", color: "#f59e0b" },
  { id: "evt_weekend_boost", name: "Weekend Boost", icon: "🎮", category: "special", desc: "+1-10 points per action!", boost: "Points boost", color: "#22c55e" },

  // === LIVE ===
  { id: "evt_live_arctic", name: "Arctic Cold Snap", icon: "🧊", category: "live", desc: "Smuggling profits +50%", boost: "+50% smuggling", color: "#06b6d4" },
  { id: "evt_live_grand_heist", name: "Grand Heist Tournament", icon: "🏦", category: "live", desc: "Top heist crew wins $50M", boost: "Crew prize", color: "#22c55e" },
  { id: "evt_live_street_race", name: "Street Race Championship", icon: "🏎️", category: "live", desc: "1v1 street racing", boost: "Race prizes", color: "#3b82f6" },

  // === NEW: TOP TIER COMPETITION ===
  { id: "evt_king_city", name: "King of the City", icon: "👑", category: "server", desc: "Most crimes in 24h becomes King!", boost: "+50% all rewards + crown", color: "#fbbf24" },
  { id: "evt_gang_war", name: "Gang War Weekend", icon: "⚔️", category: "server", desc: "Crew vs Crew war score!", boost: "Combined crew XP counts", color: "#ef4444" },
  { id: "evt_server_jackpot", name: "Server Jackpot", icon: "🎰", category: "cash", desc: "Every crime feeds the pot!", boost: "Random winner takes all", color: "#22c55e" },
  { id: "evt_rat_hunt", name: "Rat Hunt", icon: "🕵️", category: "special", desc: "Informants are hiding...", boost: "Huge bounties on rats", color: "#a855f7" },
  { id: "evt_chaos_hour", name: "Chaos Hour", icon: "🎲", category: "special", desc: "Random modifier every hour!", boost: "Unpredictable boosts", color: "#ec4899" },

  // === NEW: HIGH TIER MECHANICS ===
  { id: "evt_manhunt", name: "Manhunt", icon: "🚔", category: "crime", desc: "Wanted rises 2x, bail -50%!", boost: "Risk/reward", color: "#3b82f6" },
  { id: "evt_treasure_hunt", name: "Treasure Hunt", icon: "🗺️", category: "special", desc: "Riddles lead to stashes!", boost: "Hidden treasure", color: "#f59e0b" },
  { id: "evt_revenge_week", name: "Revenge Week", icon: "🩸", category: "server", desc: "Revenge kills = 3x rep!", boost: "3x revenge reputation", color: "#dc2626" },
  { id: "evt_bank_holiday", name: "Bank Holiday", icon: "🏦", category: "cash", desc: "Vaults wide open!", boost: "+25% robbery success", color: "#22c55e" },
  { id: "evt_night_ops", name: "Night Ops", icon: "🌙", category: "crime", desc: "Crimes after dark pay more!", boost: "+75% night XP", color: "#6366f1" },
  { id: "evt_cargo_drop", name: "Cargo Drop", icon: "📦", category: "special", desc: "Mystery crates spawn!", boost: "First click wins", color: "#f97316" },
  { id: "evt_masquerade", name: "Masquerade", icon: "🎭", category: "special", desc: "Everyone is anonymous!", boost: "Hidden identities", color: "#a855f7" },

  // === NEW: MEDIUM TIER VARIETY ===
  { id: "evt_speed_demon", name: "Speed Demon", icon: "⚡", category: "crime", desc: "All cooldowns cut to 5s!", boost: "5s cooldowns", color: "#fbbf24" },
  { id: "evt_traveling_circus", name: "Traveling Circus", icon: "🎪", category: "gambling", desc: "House edge halved!", boost: "+100% gambling payouts", color: "#ec4899" },
  { id: "evt_malpractice", name: "Malpractice", icon: "🏥", category: "special", desc: "Doctors feeling generous!", boost: "40% off hospital", color: "#22c55e" },
  { id: "evt_lockdown", name: "Lockdown", icon: "🔒", category: "crime", desc: "Guards distracted!", boost: "+50% prison break", color: "#64748b" },
  { id: "evt_guard_dogs_gone", name: "Guard Dogs Gone", icon: "🐕", category: "crime", desc: "Houses unguarded!", boost: "+30% burglary success", color: "#f97316" },
  { id: "evt_market_crash", name: "Black Friday Market", icon: "📈", category: "cash", desc: "Crash then pump!", boost: "Trading frenzy", color: "#06b6d4" },
];

export const EVENT_CATEGORIES = [
  { id: "all", name: "All", icon: "📋" },
  { id: "seasonal", name: "Seasonal", icon: "🎄" },
  { id: "server", name: "Server", icon: "🖥️" },
  { id: "xp", name: "XP", icon: "⭐" },
  { id: "cash", name: "Cash", icon: "💰" },
  { id: "crime", name: "Crime", icon: "🔥" },
  { id: "gambling", name: "Gambling", icon: "🎲" },
  { id: "special", name: "Special", icon: "✨" },
  { id: "live", name: "Live", icon: "🟢" },
] as const;

export function getActiveEvents(): { eventId: string; endTime: number }[] {
  try {
    const raw = JSON.parse(localStorage.getItem("activeEvents") || "[]");
    if (Array.isArray(raw)) {
      return raw.filter((e: any) => e && typeof e.endTime === "number" && Date.now() < e.endTime);
    }
  } catch {}
  return [];
}

export function formatTimeLeft(endTime: number): string {
  const diff = endTime - Date.now();
  if (diff <= 0) return "Expired";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// === Legacy world-events format (used by WorldEventsPage in GameFeatures) ===
export interface WorldEvent {
  id: string;
  icon: string;
  name: string;
  description: string;
  type: "boost" | "danger" | "crime" | "pvp" | "social" | "seasonal";
  duration: number; // hours
  multiplier?: number;
  rewards: { money: number; xp: number };
}

export const worldEvents: WorldEvent[] = [
  { id: "we_golden", icon: "✨", name: "Golden Hour", description: "All rewards doubled for a limited time!", type: "boost", duration: 1, multiplier: 2, rewards: { money: 5000, xp: 500 } },
  { id: "we_purge", icon: "💀", name: "Purge Night", description: "Lawlessness rules the streets tonight.", type: "danger", duration: 24, rewards: { money: 25000, xp: 2500 } },
  { id: "we_bloodmoon", icon: "🌑", name: "Blood Moon", description: "Combat power surges under the red moon.", type: "pvp", duration: 12, multiplier: 2, rewards: { money: 10000, xp: 1200 } },
  { id: "we_frenzy", icon: "🔥", name: "Crime Frenzy", description: "Success rates spike across all crimes.", type: "crime", duration: 6, multiplier: 1.5, rewards: { money: 8000, xp: 900 } },
  { id: "we_familywar", icon: "⚔️", name: "Family War", description: "Families clash for territory and honor.", type: "social", duration: 48, rewards: { money: 50000, xp: 5000 } },
];

const EVENT_TYPE_COLORS: Record<string, string> = {
  boost: "text-yellow-400",
  danger: "text-red-400",
  crime: "text-orange-400",
  pvp: "text-purple-400",
  social: "text-blue-400",
  seasonal: "text-green-400",
};

const EVENT_TYPE_BGS: Record<string, string> = {
  boost: "bg-yellow-950/30 border-yellow-500/40",
  danger: "bg-red-950/30 border-red-500/40",
  crime: "bg-orange-950/30 border-orange-500/40",
  pvp: "bg-purple-950/30 border-purple-500/40",
  social: "bg-blue-950/30 border-blue-500/40",
  seasonal: "bg-green-950/30 border-green-500/40",
};

export function getEventTypeColor(type: string): string {
  return EVENT_TYPE_COLORS[type] ?? "text-muted-foreground";
}

export function getEventTypeBg(type: string): string {
  return EVENT_TYPE_BGS[type] ?? "bg-white/5 border-border/50";
}
