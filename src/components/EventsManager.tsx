import { useState } from "react";

interface GameEvent {
  id: string;
  name: string;
  icon: string;
  category: string;
  desc: string;
  boost: string;
}

const ALL_EVENTS: GameEvent[] = [
  // Seasonal
  { id: "evt_newyear", name: "New Year's Heist", icon: "🎆", category: "seasonal", desc: "Fireworks + heists!", boost: "3x rewards" },
  { id: "evt_valentine", name: "Valentine's Crime", icon: "❤️", category: "seasonal", desc: "Crime of passion!", boost: "Romance scams +5x" },
  { id: "evt_patricks", name: "St. Patrick's Gold", icon: "☘️", category: "seasonal", desc: "Gold rush bonus!", boost: "+100% gold" },
  { id: "evt_easter", name: "Easter Egg Hunt", icon: "🥚", category: "seasonal", desc: "Find hidden prizes!", boost: "Hidden loot" },
  { id: "evt_summer", name: "Summer Crime Wave", icon: "☀️", category: "seasonal", desc: "All crimes boosted!", boost: "+50% XP" },
  { id: "evt_halloween", name: "Halloween Horror", icon: "🎃", category: "seasonal", desc: "3x spooky payouts!", boost: "3x rewards" },
  { id: "evt_christmas", name: "Christmas Heist", icon: "🎄", category: "seasonal", desc: "Legendary loot!", boost: "Legendary drops" },
  { id: "evt_cyber", name: "Cyber Monday", icon: "💻", category: "seasonal", desc: "Hacking +5x!", boost: "5x digital crimes" },
  { id: "evt_blackfriday", name: "Black Friday Heist", icon: "🛒", category: "seasonal", desc: "Steal the deals!", boost: "2x robbery" },
  { id: "evt_tax", name: "Tax Season Scam", icon: "📋", category: "seasonal", desc: "Tax fraud bonanza!", boost: "10x fraud" },
  { id: "evt_spring", name: "Spring Break Crime", icon: "🌸", category: "seasonal", desc: "Party + crime!", boost: "+75% XP" },
  { id: "evt_winter", name: "Winter Wonderland", icon: "❄️", category: "seasonal", desc: "Cold cash bonus!", boost: "2x smuggling" },
  // Server Events
  { id: "evt_purge", name: "Purge Night", icon: "💀", category: "server", desc: "24h lawlessness!", boost: "No wanted level" },
  { id: "evt_bloodmoon", name: "Blood Moon", icon: "🌑", category: "server", desc: "Combat boost!", boost: "+100% ATK" },
  { id: "evt_robbersmoon", name: "Robber's Moon", icon: "🌙", category: "server", desc: "Crime +20% success!", boost: "+20% success" },
  { id: "evt_fullmoon", name: "Full Moon", icon: "🌕", category: "server", desc: "ALL boosts active!", boost: "Everything +50%" },
  { id: "evt_grandheist", name: "Grand Heist", icon: "🏦", category: "server", desc: "10x bank heist!", boost: "10x bank rewards" },
  { id: "evt_tournament", name: "Tournament", icon: "🏆", category: "server", desc: "PvP tournament!", boost: "PvP prizes" },
  { id: "evt_familywar", name: "Family War Week", icon: "⚔️", category: "server", desc: "5x reputation!", boost: "5x rep gain" },
  { id: "evt_territory", name: "Territory Takeover", icon: "📍", category: "server", desc: "+300% income!", boost: "3x territory" },
  { id: "evt_underground", name: "Underground Champ", icon: "💣", category: "server", desc: "Fighting tournament!", boost: "Fight prizes" },
  { id: "evt_empire", name: "Crime Empire Week", icon: "👑", category: "server", desc: "5x empire reward!", boost: "5x empire" },
  // XP Events
  { id: "evt_double_xp", name: "Double XP Weekend", icon: "⭐", category: "xp", desc: "2x XP on all!", boost: "2x XP" },
  { id: "evt_triple_xp", name: "Triple XP Weekend", icon: "🌟", category: "xp", desc: "3x XP on all!", boost: "3x XP" },
  { id: "evt_50x_xp", name: "50x XP Event", icon: "💫", category: "xp", desc: "50x XP insane!", boost: "50x XP" },
  // Cash Events
  { id: "evt_double_cash", name: "Double Cash Weekend", icon: "💰", category: "cash", desc: "2x cash on all!", boost: "2x Cash" },
  { id: "evt_triple_cash", name: "Triple Cash Event", icon: "💎", category: "cash", desc: "3x cash on all!", boost: "3x Cash" },
  { id: "evt_cash_rain", name: "Cash Rain", icon: "🌧️", category: "cash", desc: "Money falls from sky!", boost: "Bonus cash" },
  // Crime Events
  { id: "evt_heatwave", name: "Heatwave", icon: "🔥", category: "crime", desc: "Crime XP boost!", boost: "+100% crime XP" },
  { id: "evt_thunderstorm", name: "Thunderstorm", icon: "⛈️", category: "crime", desc: "Smuggling +50%!", boost: "+50% smuggling" },
  { id: "evt_crime_frenzy", name: "Crime Frenzy", icon: "🌀", category: "crime", desc: "All crimes +100% XP!", boost: "2x crime XP" },
  { id: "evt_diamond_rush", name: "Diamond Rush", icon: "💎", category: "crime", desc: "Rare items everywhere!", boost: "Rare drops" },
  { id: "evt_black_market_sale", name: "Black Market Sale", icon: "🖤", category: "crime", desc: "50% off black market!", boost: "50% discount" },
  // Gambling Events
  { id: "evt_lucky_hour", name: "Lucky Hour", icon: "🍀", category: "gambling", desc: "Gambling +50% luck!", boost: "+50% luck" },
  { id: "evt_jackpot_hour", name: "Jackpot Hour", icon: "🎰", category: "gambling", desc: "Slots jackpot +10x!", boost: "10x jackpot" },
  { id: "evt_gambling_marathon", name: "Gambling Marathon", icon: "🎲", category: "gambling", desc: "Non-stop gambling!", boost: "No cooldown" },
  // Special Events
  { id: "evt_prestige_rush", name: "Prestige Rush", icon: "✨", category: "special", desc: "2x prestige points!", boost: "2x prestige" },
  { id: "evt_kill_free_zone", name: "Kill Free Zone", icon: "☠️", category: "special", desc: "No wanted for kills!", boost: "No wanted" },
  { id: "evt_golden_hour", name: "Golden Hour", icon: "🌅", category: "special", desc: "All rewards golden!", boost: "2x everything" },
  { id: "evt_weekend_boost", name: "Weekend Boost", icon: "🎮", category: "special", desc: "+1-10 points per action!", boost: "Points boost" },
  // Live Events
  { id: "evt_live_arctic", name: "Arctic Cold Snap", icon: "🧊", category: "live", desc: "Smuggling profits +50%", boost: "+50% smuggling" },
  { id: "evt_live_grand_heist", name: "Grand Heist Tournament", icon: "🏦", category: "live", desc: "Top heist crew wins $50M", boost: "Crew prize" },
  { id: "evt_live_street_race", name: "Street Race Championship", icon: "🏎️", category: "live", desc: "1v1 street racing", boost: "Race prizes" },
];

const CATEGORIES = [
  { id: "all", name: "All Events", icon: "📋" },
  { id: "seasonal", name: "Seasonal", icon: "🎄" },
  { id: "server", name: "Server", icon: "🖥️" },
  { id: "xp", name: "XP Boost", icon: "⭐" },
  { id: "cash", name: "Cash Boost", icon: "💰" },
  { id: "crime", name: "Crime", icon: "🔥" },
  { id: "gambling", name: "Gambling", icon: "🎲" },
  { id: "special", name: "Special", icon: "✨" },
  { id: "live", name: "Live", icon: "🟢" },
];

export function EventsManager({ onClose }: { onClose: () => void }) {
  const [activeEvents, setActiveEvents] = useState<string[]>([]);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? ALL_EVENTS : ALL_EVENTS.filter(e => e.category === filter);

  const toggleEvent = (id: string) => {
    setActiveEvents(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  const activateAll = () => setActiveEvents(ALL_EVENTS.map(e => e.id));
  const deactivateAll = () => setActiveEvents([]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">← Back</button>
          <h2 className="text-xl font-bold">🎪 Event Manager</h2>
          <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">{activeEvents.length} Active</span>
        </div>
        <div className="flex gap-2">
          <button onClick={activateAll} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700">Activate All</button>
          <button onClick={deactivateAll} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700">Deactivate All</button>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setFilter(cat.id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${filter === cat.id ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:text-foreground"}`}>
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[500px] overflow-y-auto">
        {filtered.map(evt => {
          const isActive = activeEvents.includes(evt.id);
          return (
            <div key={evt.id} className={`mafia-card rounded-xl p-3 flex items-center gap-3 transition-all ${isActive ? "border-green-500/30 bg-green-500/5" : ""}`}>
              <span className="text-2xl">{evt.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{evt.name}</div>
                <div className="text-[10px] text-muted-foreground truncate">{evt.desc}</div>
                <div className="text-[10px] text-primary font-bold">{evt.boost}</div>
              </div>
              <button onClick={() => toggleEvent(evt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${isActive ? "bg-red-600 text-white hover:bg-red-700" : "bg-green-600 text-white hover:bg-green-700"}`}>
                {isActive ? "Stop" : "Activate"}
              </button>
            </div>
          );
        })}
      </div>

      {activeEvents.length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="text-xs font-bold text-muted-foreground mb-2">🟢 Currently Active ({activeEvents.length})</div>
          <div className="flex flex-wrap gap-1.5">
            {activeEvents.map(id => {
              const evt = ALL_EVENTS.find(e => e.id === id);
              return evt ? (
                <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-bold text-green-400">
                  {evt.icon} {evt.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
