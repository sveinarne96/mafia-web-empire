import { useState, useEffect } from "react";

interface GameEvent {
  id: string;
  name: string;
  icon: string;
  category: string;
  desc: string;
  boost: string;
}

const ALL_EVENTS: GameEvent[] = [
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
  { id: "evt_double_xp", name: "Double XP Weekend", icon: "⭐", category: "xp", desc: "2x XP on all!", boost: "2x XP" },
  { id: "evt_triple_xp", name: "Triple XP Weekend", icon: "🌟", category: "xp", desc: "3x XP on all!", boost: "3x XP" },
  { id: "evt_50x_xp", name: "50x XP Event", icon: "💫", category: "xp", desc: "50x XP insane!", boost: "50x XP" },
  { id: "evt_double_cash", name: "Double Cash Weekend", icon: "💰", category: "cash", desc: "2x cash on all!", boost: "2x Cash" },
  { id: "evt_triple_cash", name: "Triple Cash Event", icon: "💎", category: "cash", desc: "3x cash on all!", boost: "3x Cash" },
  { id: "evt_cash_rain", name: "Cash Rain", icon: "🌧️", category: "cash", desc: "Money falls from sky!", boost: "Bonus cash" },
  { id: "evt_heatwave", name: "Heatwave", icon: "🔥", category: "crime", desc: "Crime XP boost!", boost: "+100% crime XP" },
  { id: "evt_thunderstorm", name: "Thunderstorm", icon: "⛈️", category: "crime", desc: "Smuggling +50%!", boost: "+50% smuggling" },
  { id: "evt_crime_frenzy", name: "Crime Frenzy", icon: "🌀", category: "crime", desc: "All crimes +100% XP!", boost: "2x crime XP" },
  { id: "evt_diamond_rush", name: "Diamond Rush", icon: "💎", category: "crime", desc: "Rare items everywhere!", boost: "Rare drops" },
  { id: "evt_black_market_sale", name: "Black Market Sale", icon: "🖤", category: "crime", desc: "50% off black market!", boost: "50% discount" },
  { id: "evt_lucky_hour", name: "Lucky Hour", icon: "🍀", category: "gambling", desc: "Gambling +50% luck!", boost: "+50% luck" },
  { id: "evt_jackpot_hour", name: "Jackpot Hour", icon: "🎰", category: "gambling", desc: "Slots jackpot +10x!", boost: "10x jackpot" },
  { id: "evt_gambling_marathon", name: "Gambling Marathon", icon: "🎲", category: "gambling", desc: "Non-stop gambling!", boost: "No cooldown" },
  { id: "evt_prestige_rush", name: "Prestige Rush", icon: "✨", category: "special", desc: "2x prestige points!", boost: "2x prestige" },
  { id: "evt_kill_free_zone", name: "Kill Free Zone", icon: "☠️", category: "special", desc: "No wanted for kills!", boost: "No wanted" },
  { id: "evt_golden_hour", name: "Golden Hour", icon: "🌅", category: "special", desc: "All rewards golden!", boost: "2x everything" },
  { id: "evt_weekend_boost", name: "Weekend Boost", icon: "🎮", category: "special", desc: "+1-10 points per action!", boost: "Points boost" },
  { id: "evt_live_arctic", name: "Arctic Cold Snap", icon: "🧊", category: "live", desc: "Smuggling profits +50%", boost: "+50% smuggling" },
  { id: "evt_live_grand_heist", name: "Grand Heist Tournament", icon: "🏦", category: "live", desc: "Top heist crew wins $50M", boost: "Crew prize" },
  { id: "evt_live_street_race", name: "Street Race Championship", icon: "🏎️", category: "live", desc: "1v1 street racing", boost: "Race prizes" },
];

const CATEGORIES = [
  { id: "all", name: "All", icon: "📋" },
  { id: "seasonal", name: "Seasonal", icon: "🎄" },
  { id: "server", name: "Server", icon: "🖥️" },
  { id: "xp", name: "XP", icon: "⭐" },
  { id: "cash", name: "Cash", icon: "💰" },
  { id: "crime", name: "Crime", icon: "🔥" },
  { id: "gambling", name: "Gambling", icon: "🎲" },
  { id: "special", name: "Special", icon: "✨" },
  { id: "live", name: "Live", icon: "🟢" },
];

interface EventDuration {
  eventId: string;
  endTime: number;
  durationMs: number;
}

export function EventsManager({ onClose }: { onClose: () => void }) {
  const [activeEvents, setActiveEvents] = useState<EventDuration[]>(() => {
    try { return JSON.parse(localStorage.getItem("activeEvents") || "[]"); } catch { return []; }
  });
  const [filter, setFilter] = useState("all");
  const [popup, setPopup] = useState<GameEvent | null>(null);
  const [customMinutes, setCustomMinutes] = useState(60);

  useEffect(() => {
    localStorage.setItem("activeEvents", JSON.stringify(activeEvents));
    const ids = activeEvents.filter(e => Date.now() < e.endTime).map(e => e.eventId);
    localStorage.setItem("activeEventIds", JSON.stringify(ids));
    window.dispatchEvent(new Event("eventsChanged"));
  }, [activeEvents]);

  // Clean expired events every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveEvents(prev => prev.filter(e => Date.now() < e.endTime));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter === "all" ? ALL_EVENTS : ALL_EVENTS.filter(e => e.category === filter);

  const activateEvent = (evt: GameEvent, minutes: number) => {
    const durationMs = minutes * 60 * 1000;
    const endTime = Date.now() + durationMs;
    setActiveEvents(prev => {
      const without = prev.filter(e => e.eventId !== evt.id);
      return [...without, { eventId: evt.id, endTime, durationMs }];
    });
    setPopup(null);
  };

  const stopEvent = (id: string) => {
    setActiveEvents(prev => prev.filter(e => e.eventId !== id));
  };

  const activateAll = () => {
    const now = Date.now();
    const hour = 60 * 60 * 1000;
    setActiveEvents(ALL_EVENTS.map(e => ({ eventId: e.id, endTime: now + hour, durationMs: hour })));
  };

  const deactivateAll = () => {
    setActiveEvents([]);
    localStorage.removeItem("activeEventIds");
  };

  const isActive = (id: string) => activeEvents.find(e => e.eventId === id && Date.now() < e.endTime);

  const getTimeLeft = (endTime: number) => {
    const diff = endTime - Date.now();
    if (diff <= 0) return "Expired";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const durations = [
    { label: "5 min", value: 5 },
    { label: "15 min", value: 15 },
    { label: "30 min", value: 30 },
    { label: "1 hour", value: 60 },
    { label: "2 hours", value: 120 },
    { label: "6 hours", value: 360 },
    { label: "12 hours", value: 720 },
    { label: "24 hours", value: 1440 },
    { label: "3 days", value: 4320 },
    { label: "7 days", value: 10080 },
    { label: "30 days", value: 43200 },
  ];

  return (
    <div className="space-y-4">
      {/* Duration Popup */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setPopup(null)}>
          <div className="mafia-card rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <span className="text-5xl block mb-2">{popup.icon}</span>
              <h3 className="text-lg font-bold">{popup.name}</h3>
              <p className="text-xs text-muted-foreground">{popup.desc}</p>
              <p className="text-xs text-primary font-bold mt-1">{popup.boost}</p>
            </div>
            <div className="text-sm font-bold text-center">Set Duration</div>
            <div className="grid grid-cols-3 gap-2">
              {durations.map(d => (
                <button key={d.value} onClick={() => activateEvent(popup, d.value)}
                  className={`px-2 py-2 rounded-lg text-xs font-bold transition-all border ${
                    customMinutes === d.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-white/5 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  }`}>
                  {d.label}
                </button>
              ))}
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Custom (minutes)</label>
              <div className="flex gap-2">
                <input type="number" value={customMinutes} onChange={e => setCustomMinutes(Number(e.target.value) || 1)}
                  min={1} max={43200}
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm" />
                <button onClick={() => activateEvent(popup, customMinutes)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700">
                  Activate
                </button>
              </div>
            </div>
            <button onClick={() => setPopup(null)} className="w-full text-center text-xs text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">← Back</button>
          <h2 className="text-xl font-bold">🎪 Event Manager</h2>
          <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">{activeEvents.length} Active</span>
        </div>
        <div className="flex gap-2">
          <button onClick={activateAll} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700">Activate All (1h)</button>
          <button onClick={deactivateAll} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700">Stop All</button>
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
          const active = isActive(evt.id);
          return (
            <div key={evt.id} className={`mafia-card rounded-xl p-3 flex items-center gap-3 transition-all ${active ? "border-green-500/30 bg-green-500/5" : ""}`}>
              <span className="text-2xl">{evt.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{evt.name}</div>
                <div className="text-[10px] text-muted-foreground truncate">{evt.desc}</div>
                <div className="text-[10px] text-primary font-bold">{evt.boost}</div>
                {active && (
                  <div className="text-[10px] text-green-400 font-bold mt-0.5">
                    ⏱️ {getTimeLeft(active.endTime)}
                  </div>
                )}
              </div>
              <button onClick={() => active ? stopEvent(evt.id) : setPopup(evt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${active ? "bg-red-600 text-white hover:bg-red-700" : "bg-green-600 text-white hover:bg-green-700"}`}>
                {active ? "Stop" : "Activate"}
              </button>
            </div>
          );
        })}
      </div>

      {activeEvents.length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="text-xs font-bold text-muted-foreground mb-2">🟢 Currently Active ({activeEvents.length})</div>
          <div className="flex flex-wrap gap-1.5">
            {activeEvents.filter(e => Date.now() < e.endTime).map(evt => {
              const evtData = ALL_EVENTS.find(e => e.id === evt.eventId);
              return evtData ? (
                <span key={evt.eventId} className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-bold text-green-400">
                  {evtData.icon} {evtData.name} <span className="opacity-60">({getTimeLeft(evt.endTime)})</span>
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
